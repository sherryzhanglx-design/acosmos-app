import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AccountLayout from "@/components/AccountLayout";
import { CreditCard, Calendar, Check } from "lucide-react";

export default function AccountBilling() {
  const { user } = useAuth();
  const { data: usage } = trpc.usage.me.useQuery();

  // Calculate free trial days remaining (assuming 30-day trial)
  const trialDaysRemaining = usage?.subscriptionEndsAt
    ? Math.ceil(
        (new Date(usage.subscriptionEndsAt).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 30;

  const currentTier = usage?.tier || "free";

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Billing</h2>
          <p className="text-white/60">Manage your subscription and billing</p>
        </div>

        {/* Current Plan */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Current Plan</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-lg capitalize">
                  {currentTier === "free" ? "Free Trial" : `${currentTier} Plan`}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {currentTier === "free" && trialDaysRemaining > 0
                    ? `${trialDaysRemaining} days remaining in your trial`
                    : "Active subscription"}
                </p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium">
                Active
              </div>
            </div>

            {usage?.subscriptionEndsAt && (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {currentTier === "free" ? "Trial ends" : "Renews"} on{" "}
                  {new Date(usage.subscriptionEndsAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            This Month's Usage
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-white/60 text-sm mb-1">Conversations</p>
              <p className="text-2xl font-bold text-white">
                {usage?.monthlyConversations || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-white/60 text-sm mb-1">Messages</p>
              <p className="text-2xl font-bold text-white">
                {usage?.monthlyMessages || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-white/60 text-sm mb-1">Total Lifetime</p>
              <p className="text-2xl font-bold text-white">
                {usage?.totalConversations || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade Plans */}
        {currentTier === "free" && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Upgrade Your Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Plan */}
              <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-amber-500/50 transition-all">
                <h4 className="text-xl font-bold text-white mb-2">Basic</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">$9.99</span>
                  <span className="text-white/60">/month</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Unlimited conversations</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>All 4 Guides</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Growth Cards & Insights</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Weekly Growth Summary</span>
                  </li>
                </ul>

                <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                  Upgrade to Basic
                </button>
              </div>

              {/* Premium Plan */}
              <div className="glass-card p-6 rounded-xl border-2 border-amber-500/50 hover:border-amber-500 transition-all relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                  POPULAR
                </div>
                
                <h4 className="text-xl font-bold text-white mb-2">Premium</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">$19.99</span>
                  <span className="text-white/60">/month</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/80 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Export & share features</span>
                  </li>
                </ul>

                <button className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
