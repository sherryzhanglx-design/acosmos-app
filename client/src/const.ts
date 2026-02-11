export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the login page URL.
 *
 * With Google OAuth, the actual redirect to Google happens server-side
 * via /api/oauth/google. The client simply navigates to /login which
 * shows the sign-in UI with the Google button.
 */
export const getLoginUrl = () => "/login";
