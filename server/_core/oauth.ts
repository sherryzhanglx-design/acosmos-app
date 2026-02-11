/**
 * Google OAuth 2.0 Routes
 *
 * Two endpoints:
 *   GET /api/oauth/google    — Redirect user to Google's consent screen
 *   GET /api/oauth/callback  — Handle the authorization code callback
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  /**
   * GET /api/oauth/google
   *
   * Initiates the Google OAuth flow by redirecting the user to Google's
   * authorization endpoint. The `returnTo` query parameter can specify
   * where to redirect after successful login (defaults to "/").
   */
  app.get("/api/oauth/google", (req: Request, res: Response) => {
    const returnTo = getQueryParam(req, "returnTo") || "/";
    const callbackUrl = sdk.getCallbackUrl(req);

    // Encode the return path in state so we can redirect after callback
    const state = Buffer.from(JSON.stringify({ returnTo })).toString("base64url");

    const authUrl = sdk.google.getAuthorizationUrl(callbackUrl, state);

    console.log("[OAuth] Redirecting to Google. Callback URL:", callbackUrl);
    res.redirect(302, authUrl);
  });

  /**
   * GET /api/oauth/callback
   *
   * Google redirects here after the user grants consent.
   * We exchange the authorization code for tokens, fetch user info,
   * create/update the user in our database, issue a session cookie,
   * and redirect to the application.
   */
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const stateParam = getQueryParam(req, "state");
    const error = getQueryParam(req, "error");

    // Handle Google-side errors (user denied consent, etc.)
    if (error) {
      console.warn("[OAuth] Google returned error:", error);
      res.redirect(302, "/login?error=google_denied");
      return;
    }

    if (!code) {
      console.warn("[OAuth] Missing authorization code");
      res.redirect(302, "/login?error=missing_code");
      return;
    }

    // Decode return path from state
    let returnTo = "/";
    if (stateParam) {
      try {
        const stateData = JSON.parse(
          Buffer.from(stateParam, "base64url").toString("utf-8")
        );
        returnTo = stateData.returnTo || "/";
      } catch {
        // Invalid state — ignore and default to "/"
      }
    }

    try {
      const callbackUrl = sdk.getCallbackUrl(req);

      // Step 1: Exchange code for tokens
      const tokens = await sdk.google.exchangeCodeForTokens(code, callbackUrl);

      // Step 2: Fetch user profile from Google
      const googleUser = await sdk.google.getUserInfo(tokens.access_token);

      if (!googleUser.sub) {
        console.error("[OAuth] Google user info missing 'sub'");
        res.redirect(302, "/login?error=invalid_user");
        return;
      }

      console.log("[OAuth] Google user authenticated:", {
        sub: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
      });

      // Step 3: Create or update user in database
      // Google's `sub` is stored in the `openId` field for backward compatibility
      const { isNewUser } = await db.upsertUser({
        openId: googleUser.sub,
        name: googleUser.name || null,
        email: googleUser.email || null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Auto-assign admin role to owner
      if (ENV.ownerGoogleId && googleUser.sub === ENV.ownerGoogleId) {
        await db.upsertUser({
          openId: googleUser.sub,
          role: "admin",
        });
      }

      if (isNewUser) {
        console.log("[OAuth] New user registered:", googleUser.email);

        // Get total user count for logging
        const totalUsers = await db.getTotalUserCount();
        console.log(`[OAuth] Total users: ${totalUsers}`);
      }

      // Step 4: Create session JWT
      const sessionToken = await sdk.session.createToken({
        sub: googleUser.sub,
        name: googleUser.name || "",
        email: googleUser.email || "",
      });

      // Step 5: Set session cookie and redirect
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      console.log("[OAuth] Login successful, redirecting to:", returnTo);
      res.redirect(302, returnTo);
    } catch (err) {
      console.error("[OAuth] Callback failed:", err);
      res.redirect(302, "/login?error=callback_failed");
    }
  });
}
