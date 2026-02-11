export const ENV = {
  // Google OAuth 2.0
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",

  // Session & Security
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Admin identification (Google sub ID of the owner)
  ownerGoogleId: process.env.OWNER_GOOGLE_ID ?? "",

  // OpenAI API — primary AI provider
  openaiApiKey: process.env.OPENAI_API_KEY ?? process.env.OpenAIAPIKey4Manus ?? "",

  // Public URL for OAuth redirect (auto-detected if not set)
  publicUrl: process.env.PUBLIC_URL ?? "",

  // Legacy — kept for backward compatibility during migration
  /** @deprecated Use ownerGoogleId instead */
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  /** @deprecated No longer used */
  appId: process.env.VITE_APP_ID ?? "",
  /** @deprecated No longer used */
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  /** @deprecated No longer used */
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  /** @deprecated No longer used */
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
