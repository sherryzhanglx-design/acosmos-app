import { useState } from "react";
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

/**
 * Email icon for the magic link input.
 */
function EmailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  google_denied: "You cancelled the sign-in. Feel free to try again when you're ready.",
  missing_code: "Something went wrong during sign-in. Please try again.",
  invalid_user: "Could not verify your Google account. Please try again.",
  callback_failed: "Sign-in failed due to a server error. Please try again later.",
  missing_token: "The sign-in link is invalid. Please request a new one.",
  invalid_token: "This sign-in link has expired or already been used. Please request a new one.",
  magic_link_failed: "Sign-in failed. Please request a new link and try again.",
};

type MagicLinkState = "idle" | "sending" | "sent" | "error";

export default function Login() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const errorCode = params.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "An unexpected error occurred." : null;

  // Magic Link state
  const [email, setEmail] = useState("");
  const [magicLinkState, setMagicLinkState] = useState<MagicLinkState>("idle");
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    const returnTo = params.get("returnTo") || "/";
    window.location.href = `/api/oauth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setMagicLinkState("sending");
    setMagicLinkError(null);

    try {
      const response = await fetch("/api/auth/magic-link/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setMagicLinkState("sent");
    } catch (err) {
      setMagicLinkState("error");
      setMagicLinkError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
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

          {/* Error Message (from URL params) */}
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

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Magic Link Form */}
          {magicLinkState === "sent" ? (
            /* Success state — email sent */
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
                <EmailIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-indigo-200 text-sm font-medium">
                Check your email
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                We sent a sign-in link to <span className="text-white/80">{email}</span>.
                Click the link in the email to continue.
              </p>
              <button
                onClick={() => {
                  setMagicLinkState("idle");
                  setEmail("");
                }}
                className="text-indigo-400 hover:text-indigo-300 text-xs underline underline-offset-2 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* Email input form */
            <form onSubmit={handleMagicLink} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EmailIcon className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (magicLinkState === "error") {
                      setMagicLinkState("idle");
                      setMagicLinkError(null);
                    }
                  }}
                  placeholder="Enter your email address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  disabled={magicLinkState === "sending"}
                  required
                />
              </div>

              {/* Magic Link Error */}
              {magicLinkError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs">
                  {magicLinkError}
                </div>
              )}

              <button
                type="submit"
                disabled={magicLinkState === "sending" || !email.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                {magicLinkState === "sending" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Sending link...</span>
                  </>
                ) : (
                  <span>Continue with Email</span>
                )}
              </button>
            </form>
          )}

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
