import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();

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

        {/* Status Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white/90">
              Authentication System Upgrading
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We are migrating to an independent authentication system. 
              The login feature will be available shortly.
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-gray-500 text-xs">
              If you need immediate access, please contact the administrator.
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
