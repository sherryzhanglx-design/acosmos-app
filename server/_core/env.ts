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

  // Resend (Magic Link email)
  resendApiKey: process.env.RESEND_API_KEY ?? "",

  // Public URL for OAuth redirect (auto-detected if not set)
  publicUrl: process.env.PUBLIC_URL ?? "",

  // AWS S3 for Growth Card storage (optional, falls back to local storage)
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME ?? "",
  awsS3Region: process.env.AWS_S3_REGION ?? "us-east-1",

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
