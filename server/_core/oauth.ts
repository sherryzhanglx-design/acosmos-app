import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { notifyOwner } from "./notification";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      const { isNewUser } = await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Send notification for new user registration
      if (isNewUser) {
        const userName = userInfo.name || 'Anonymous';
        const userEmail = userInfo.email || 'No email provided';
        const loginMethod = userInfo.loginMethod ?? userInfo.platform ?? 'Unknown';
        
        // Get total user count directly from users table
        const totalUsers = await db.getTotalUserCount();
        
        notifyOwner({
          title: `🎉 New User Registration - A.Cosmos`,
          content: `A new user has joined A.Cosmos!\n\n` +
            `**User Details:**\n` +
            `- Name: ${userName}\n` +
            `- Email: ${userEmail}\n` +
            `- Login Method: ${loginMethod}\n` +
            `- Registration Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST\n\n` +
            `**Platform Stats:**\n` +
            `- Total Users: ${totalUsers}\n\n` +
            `Welcome them to their journey of self-discovery! ✨`
        }).catch(err => {
          console.warn('[OAuth] Failed to send new user notification:', err);
        });
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
