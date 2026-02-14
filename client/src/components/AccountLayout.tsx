import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

interface Tab {
  id: string;
  label: string;
  path: string;
}

const tabs: Tab[] = [
  { id: "dashboard", label: "Dashboard", path: "/account/dashboard" },
  { id: "cards", label: "Cards", path: "/account/cards" },
  { id: "conversations", label: "Conversations", path: "/account/conversations" },
  { id: "settings", label: "Settings", path: "/account/settings" },
  { id: "billing", label: "Billing", path: "/account/billing" },
];

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const [location, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Determine current tab based on path
  const currentTab = tabs.find((t) => location === t.path)?.id || "dashboard";

  const handleBack = () => {
    // Go back to previous page, or home if no history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen cinematic-bg flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cinematic-bg">
      {/* Top Bar */}
      <header className="border-b border-white/10 glass-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <h1 className="text-xl font-bold text-white">A.Cosmos</h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 -mb-px">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
                    currentTab === tab.id
                      ? "border-amber-500 text-amber-500"
                      : "border-transparent text-white/60 hover:text-white/90"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
