import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { User, LayoutDashboard, CreditCard, MessageCircle, Settings, LogOut, Sparkles } from "lucide-react";

export default function UserAvatarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    // Trigger logout (you may need to implement this in your auth system)
    window.location.href = "/login";
  };

  // Get user initials for avatar
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-500/30 border border-amber-500/50 flex items-center justify-center text-white font-medium text-sm hover:border-amber-400 transition-all"
        title="Account menu"
      >
        {getInitials(user?.name)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 glass-card border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          {/* User Info Section */}
          <div className="p-4 border-b border-white/10">
            <p className="text-white font-medium truncate">{user?.name || "User"}</p>
            <p className="text-white/50 text-sm truncate">{user?.email || ""}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigate("/account/dashboard")}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>My Growth Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigate("/account/cards")}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <Sparkles className="w-4 h-4" />
              <span>My Cards</span>
            </button>

            <button
              onClick={() => handleNavigate("/account/conversations")}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Conversations</span>
            </button>

            <button
              onClick={() => handleNavigate("/account/settings")}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleNavigate("/account/billing")}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="border-t border-white/10 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:bg-white/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
