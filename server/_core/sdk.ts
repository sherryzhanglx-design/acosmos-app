/**
 * Google OAuth 2.0 + JWT Session Service
 *
 * Replaces the former Manus OAuth SDK. Uses Google's standard OAuth 2.0 flow
 * with authorization code exchange and Google's userinfo endpoint.
 * Sessions are managed via signed JWTs stored in an httpOnly cookie.
 */

import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

// ─── Constants ───────────────────────────────────────────────────────────────

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionPayload = {
  sub: string;       // Google user ID (stable unique identifier)
  name: string;
  email: string;
};

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
  refresh_token?: string;
}

export interface GoogleUserInfo {
  sub: string;        // Unique Google user ID
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified: boolean;
  locale?: string;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

// ─── Google OAuth Service ────────────────────────────────────────────────────

class GoogleOAuthService {
  /**
   * Build the Google OAuth authorization URL.
   * The user's browser will be redirected here to initiate login.
   */
  getAuthorizationUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
    });

    if (state) {
      params.set("state", state);
    }

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange an authorization code for access + id tokens.
   */
  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<GoogleTokenResponse> {
    const body = new URLSearchParams({
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Google OAuth] Token exchange failed:", response.status, errorText);
      throw new Error(`Google token exchange failed: ${response.status}`);
    }

    return response.json() as Promise<GoogleTokenResponse>;
  }

  /**
   * Fetch user profile from Google using the access token.
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Google OAuth] UserInfo fetch failed:", response.status, errorText);
      throw new Error(`Google userinfo fetch failed: ${response.status}`);
    }

    return response.json() as Promise<GoogleUserInfo>;
  }
}

// ─── Session Manager ─────────────────────────────────────────────────────────

class SessionManager {
  private getSecretKey() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  /**
   * Create a signed JWT session token.
   */
  async createToken(
    payload: SessionPayload,
    expiresInMs: number = ONE_YEAR_MS
  ): Promise<string> {
    const secretKey = this.getSecretKey();
    const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

    return new SignJWT({
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /**
   * Verify and decode a JWT session token.
   * Supports both new Google sessions (sub) and legacy Manus sessions (openId).
   */
  async verify(
    token: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!token) return null;

    try {
      const secretKey = this.getSecretKey();
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      const raw = payload as Record<string, unknown>;

      // Support both new format (sub) and legacy format (openId)
      const sub = (raw.sub as string) || (raw.openId as string) || "";

      if (!isNonEmptyString(sub)) {
        console.warn("[Auth] Session payload missing user identifier");
        return null;
      }

      return {
        sub,
        name: (raw.name as string) || "",
        email: (raw.email as string) || "",
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed:", String(error));
      return null;
    }
  }

  /**
   * Extract session cookie from an Express request.
   */
  extractCookie(req: Request): string | undefined {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;

    const parsed = parseCookieHeader(cookieHeader);
    return parsed[COOKIE_NAME];
  }
}

// ─── SDK Server (main export) ────────────────────────────────────────────────

class SDKServer {
  readonly google: GoogleOAuthService;
  readonly session: SessionManager;

  constructor() {
    this.google = new GoogleOAuthService();
    this.session = new SessionManager();

    // Startup diagnostics
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      console.warn(
        "[Auth] Google OAuth credentials not configured. " +
        "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
      );
    } else {
      console.log("[Auth] Google OAuth configured ✓");
    }
  }

  /**
   * Authenticate an Express request by verifying the session cookie
   * and loading the user from the database.
   *
   * This is the primary entry point used by the tRPC context creator.
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookieValue = this.session.extractCookie(req);
    const session = await this.session.verify(cookieValue);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    // Look up user by Google sub (stored in openId field for compatibility)
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(session.sub);

    if (!user) {
      // User exists in session but not in DB — edge case (DB was reset?)
      // Re-create the user record from session data
      console.warn("[Auth] User in session but not in DB, re-creating:", session.sub);
      await db.upsertUser({
        openId: session.sub,
        name: session.name || null,
        email: session.email || null,
        loginMethod: "google",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(session.sub);
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last sign-in timestamp
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }

  /**
   * Build the OAuth callback URL from the request origin.
   */
  getCallbackUrl(req: Request): string {
    // Use PUBLIC_URL if set, otherwise derive from request
    if (ENV.publicUrl) {
      return `${ENV.publicUrl}/api/oauth/callback`;
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return `${protocol}://${host}/api/oauth/callback`;
  }
}

export const sdk = new SDKServer();
