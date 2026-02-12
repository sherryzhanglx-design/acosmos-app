/**
 * Magic Link Authentication Service
 *
 * Provides passwordless email login via one-time-use tokens.
 * Tokens are signed JWTs with a short expiration (15 minutes).
 * Emails are sent via the Resend API.
 */

import { Resend } from "resend";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

// ─── Constants ──────────────────────────────────────────────────────────────

const MAGIC_LINK_EXPIRY_MINUTES = 15;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MagicLinkPayload {
  email: string;
  purpose: "magic_link";
}

// ─── Magic Link Service ─────────────────────────────────────────────────────

class MagicLinkService {
  private resend: Resend | null = null;

  private getResend(): Resend {
    if (!this.resend) {
      if (!ENV.resendApiKey) {
        throw new Error("RESEND_API_KEY is not configured");
      }
      this.resend = new Resend(ENV.resendApiKey);
    }
    return this.resend;
  }

  private getSecretKey() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  /**
   * Generate a signed magic link token for the given email.
   * The token is a JWT that expires in 15 minutes.
   */
  async generateToken(email: string): Promise<string> {
    const secretKey = this.getSecretKey();
    const expirationSeconds = Math.floor(
      (Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000) / 1000
    );

    return new SignJWT({
      email: email.toLowerCase().trim(),
      purpose: "magic_link",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /**
   * Verify a magic link token and return the email address.
   * Returns null if the token is invalid or expired.
   */
  async verifyToken(token: string): Promise<string | null> {
    try {
      const secretKey = this.getSecretKey();
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      const raw = payload as Record<string, unknown>;

      if (raw.purpose !== "magic_link") {
        console.warn("[MagicLink] Token has wrong purpose:", raw.purpose);
        return null;
      }

      const email = raw.email as string;
      if (!email || typeof email !== "string") {
        console.warn("[MagicLink] Token missing email");
        return null;
      }

      return email;
    } catch (error) {
      console.warn("[MagicLink] Token verification failed:", String(error));
      return null;
    }
  }

  /**
   * Build the full magic link URL.
   */
  buildMagicLinkUrl(baseUrl: string, token: string): string {
    return `${baseUrl}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`;
  }

  /**
   * Send a magic link email to the user via Resend.
   */
  async sendEmail(email: string, magicLinkUrl: string): Promise<void> {
    const resend = this.getResend();

    const { error } = await resend.emails.send({
      from: "login@acosmos.app",
      to: email,
      subject: "Sign in to A.Cosmos",
      html: this.buildEmailHtml(magicLinkUrl),
    });

    if (error) {
      console.error("[MagicLink] Failed to send email:", error);
      throw new Error(`Failed to send magic link email: ${error.message}`);
    }

    console.log("[MagicLink] Email sent to:", email);
  }

  /**
   * Build the HTML email body.
   */
  private buildEmailHtml(magicLinkUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width: 480px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: 3px; margin: 0;">
                A.Cosmos
              </h1>
              <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0;">
                AI-Guided Self-Reflection & Life Exploration
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px 32px;">
              <h2 style="color: #ffffff; font-size: 20px; font-weight: 500; margin: 0 0 12px 0; text-align: center;">
                Sign in to A.Cosmos
              </h2>
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 28px 0; text-align: center;">
                Click the button below to sign in. This link will expire in ${MAGIC_LINK_EXPIRY_MINUTES} minutes.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${magicLinkUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 14px 40px; border-radius: 12px;">
                      Continue to A.Cosmos
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 28px 0 0 0; text-align: center;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="color: #4b5563; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} A.Cosmos by LifeMaster
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}

export const magicLink = new MagicLinkService();
