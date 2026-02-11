import { useLocation, useSearch } from "wouter";

/**
 * Google "G" logo as inline SVG — official brand colors.
 */
function GoogleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  google_denied: "You cancelled the sign-in. Feel free to try again when you're ready.",
  missing_code: "Something went wrong during sign-in. Please try again.",
  invalid_user: "Could not verify your Google account. Please try again.",
  callback_failed: "Sign-in failed due to a server error. Please try again later.",
};

export default function Login() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const errorCode = params.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "An unexpected error occurred." : null;

  const handleGoogleLogin = () => {
    // Redirect to our backend endpoint which initiates the Google OAuth flow
    const returnTo = params.get("returnTo") || "/";
    window.location.href = `/api/oauth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] text-white">
      <div className="max-w-md w-full mx-4 text-center space-y-8">
        {/* Logo / Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-light tracking-wider">A.Cosmos</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            AI-Guided Self-Reflection & Life Exploration
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white/90">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sign in to continue your journey of self-discovery
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/10"
          >
            <GoogleLogo />
            <span>Continue with Google</span>
          </button>

          <div className="border-t border-white/10 pt-4">
            <p className="text-gray-500 text-xs leading-relaxed">
              By signing in, you agree to our terms of service and privacy policy.
              Your data is encrypted and never shared.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
