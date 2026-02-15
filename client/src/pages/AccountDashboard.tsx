import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AccountLayout from "@/components/AccountLayout";
import { MessageCircle, Clock, Heart, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function AccountDashboard() {
  const { user } = useAuth();
  
  const [, setLocation] = useLocation();
  
  // Fetch user stats
  const { data: conversations } = trpc.conversations.listMine.useQuery();
  const { data: sessionSummaries } = trpc.sessionSummaries.listMine.useQuery();
  const { data: growthCards } = trpc.growthCards.listMine.useQuery();

  // Calculate basic stats
  const totalConversations = conversations?.length || 0;
  const totalSummaries = sessionSummaries?.length || 0;
  
  // Calculate total conversation time (rough estimate based on message count)
  const totalHours = Math.floor((totalSummaries * 20) / 60); // Assume 20min per session

  return (
    <AccountLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || "Explorer"}
          </h2>
          <p className="text-white/60">
            Your personal growth journey at a glance
          </p>
        </div>

        {/* Your Growth Journey Card */}
        <div className="glass-card p-8 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">
            Your Growth Journey
          </h3>
          
          <div className="text-center py-8">
            <div className="text-white/60 mb-4">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-4xl">⭐</span>
              </div>
              <p className="text-lg">You are exploring your inner cosmos</p>
            </div>
            
            <div className="mt-6 text-white/80">
              <p className="text-2xl font-bold">{totalHours}+ hours</p>
              <p className="text-sm text-white/50">of inner exploration</p>
            </div>
          </div>

          <div className="mt-6 text-center text-white/50 text-sm italic">
            "Every conversation is a step toward understanding yourself."
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-white/80 font-medium">Conversations</h4>
            </div>
            <p className="text-3xl font-bold text-white">{totalConversations}</p>
            <p className="text-white/50 text-sm mt-1">Total dialogues</p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-white/80 font-medium">Time Invested</h4>
            </div>
            <p className="text-3xl font-bold text-white">{totalHours}h</p>
            <p className="text-white/50 text-sm mt-1">Reflection time</p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-white/80 font-medium">Growth Cards</h4>
            </div>
            <p className="text-3xl font-bold text-white">{growthCards?.length || 0}</p>
            <p className="text-white/50 text-sm mt-1">Cards collected</p>
          </div>
        </div>

        {/* Recent Growth Cards */}
        {growthCards && growthCards.length > 0 && (
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Recent Growth Cards
              </h3>
              <button
                onClick={() => setLocation('/account/cards')}
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                View All →
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {growthCards.slice(0, 3).map((card) => (
                <div
                  key={card.id}
                  onClick={() => setLocation('/account/cards')}
                  className="group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all"
                >
                  {card.imageUrl && (
                    <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                      <img
                        src={card.imageUrl}
                        alt={card.cardTypeName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-3 bg-white/5">
                    <p className="text-sm font-semibold text-amber-400 mb-1">
                      {card.cardTypeName}
                    </p>
                    <p className="text-xs text-white/60">
                      {new Date(card.conversationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Activity
          </h3>
          
          {sessionSummaries && sessionSummaries.length > 0 ? (
            <div className="space-y-3">
              {sessionSummaries.slice(0, 5).map((summary) => (
                <div
                  key={summary.id}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white/90 font-medium">
                        {summary.topic || "Conversation"}
                      </p>
                      <p className="text-white/50 text-sm mt-1">
                        with {summary.guardian} •{" "}
                        {new Date(summary.sessionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              <p>No recent activity yet.</p>
              <p className="text-sm mt-2">
                Start a conversation with one of your Guides to begin your
                journey.
              </p>
            </div>
          )}
        </div>

        {/* Continue Your Journey */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            Continue Your Journey
          </h3>
          <p className="text-white/60 mb-4">
            Choose a Guide to continue your exploration
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors"
          >
            Start a Conversation
          </a>
        </div>
      </div>
    </AccountLayout>
  );
}
