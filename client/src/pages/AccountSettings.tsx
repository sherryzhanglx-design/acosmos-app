import { useAuth } from "@/_core/hooks/useAuth";
import AccountLayout from "@/components/AccountLayout";
import { User, Mail, Shield, Bell } from "lucide-react";

export default function AccountSettings() {
  const { user } = useAuth();

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-white/60">Manage your account preferences</p>
        </div>

        {/* Profile Section */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Name</label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
                {user?.name || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Email</label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
                {user?.email || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                Login Method
              </label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
                {user?.loginMethod || "Google OAuth"}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-white/50 text-sm">
                  Receive updates about your growth journey
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500/50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Weekly Summary</p>
                <p className="text-white/50 text-sm">
                  Get a weekly digest of your conversations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500/50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Privacy</h3>
          </div>

          <div className="space-y-3">
            <p className="text-white/60 text-sm">
              Your conversations are private and secure. We use end-to-end
              encryption to protect your data.
            </p>
            <div className="flex gap-3">
              <a
                href="/privacy"
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-white/30">•</span>
              <a
                href="/terms"
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
