import AccountLayout from "@/components/AccountLayout";
import { trpc } from "@/lib/trpc";
import { Sparkles, Calendar } from "lucide-react";

export default function AccountCards() {
  const { data: sessionSummaries } = trpc.sessionSummaries.listMine.useQuery();
  const { data: cardHistory } = trpc.cardHistory.list.useQuery({ guide: "Anya" });

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Cards</h2>
          <p className="text-white/60">
            Your collection of growth insights and reflections
          </p>
        </div>

        {/* Growth Cards Section */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Growth Cards
          </h3>
          
          {sessionSummaries && sessionSummaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="glass-card p-6 rounded-xl border border-white/10 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs text-white/40">
                      {summary.guardian}
                    </span>
                  </div>

                  <h4 className="text-white font-medium mb-2 line-clamp-2">
                    {summary.topic || "Growth Insight"}
                  </h4>

                  {summary.keyInsight && (
                    <p className="text-white/60 text-sm mb-3 line-clamp-3">
                      {summary.keyInsight}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(summary.sessionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-xl border border-white/10 text-center">
              <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 mb-2">No Growth Cards yet</p>
              <p className="text-white/40 text-sm">
                Complete conversations with your Guardians to collect insights
              </p>
            </div>
          )}
        </div>

        {/* Metaphor Cards Section */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Metaphor Cards
          </h3>
          
          {cardHistory && cardHistory.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cardHistory.map((card) => (
                <div
                  key={card.id}
                  className="glass-card rounded-xl border border-white/10 hover:border-amber-500/50 transition-all overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={card.cardImageUrl}
                      alt={card.cardText}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">
                        {card.cardText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-xl border border-white/10 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🎴</span>
              </div>
              <p className="text-white/60 mb-2">No Metaphor Cards drawn yet</p>
              <p className="text-white/40 text-sm">
                Draw reflection cards during your conversations with Anya
              </p>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
