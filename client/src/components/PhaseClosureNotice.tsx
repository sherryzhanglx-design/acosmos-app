import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Sparkles, Users, Clock, Smartphone, X, ChevronRight 
} from "lucide-react";

interface Coach {
  slug: string;
  name: string;
  description: string;
}

interface PhaseClosureNoticeProps {
  currentCoachSlug: string;
  availableCoaches: Coach[];
  onDismiss: () => void;
}

export function PhaseClosureNotice({ 
  currentCoachSlug, 
  availableCoaches,
  onDismiss 
}: PhaseClosureNoticeProps) {
  const [, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out current coach from available options
  const otherCoaches = availableCoaches.filter(c => c.slug !== currentCoachSlug);

  return (
    <div className="mx-auto max-w-2xl mt-4 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/10">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">
                A moment to pause
              </p>
              <p className="text-white/60 text-xs mt-1">
                You've reached a natural resting point. Here are some options:
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Options */}
        <div className="px-5 pb-4 space-y-2">
          {/* Option 1: Explore other coaches */}
          {otherCoaches.length > 0 && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-teal-400" />
                  <span className="text-white/80 text-sm">Explore a different perspective</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
              
              {isExpanded && (
                <div className="mt-2 pl-10 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {otherCoaches.map(coach => (
                    <button
                      key={coach.slug}
                      onClick={() => navigate(`/chat/${coach.slug}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <div>
                        <span className="text-white/90 text-sm font-medium">{coach.name}</span>
                        <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{coach.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Option 2: Return later */}
          <button
            onClick={onDismiss}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-white/80 text-sm">Return when you're ready</span>
              <p className="text-white/50 text-xs mt-0.5">Your conversation will be here</p>
            </div>
          </button>

          {/* Option 3: App coming soon hint */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-70">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-white/60 text-sm">A.Cosmos App coming soon</span>
              <p className="text-white/40 text-xs mt-0.5">For deeper, ongoing companionship</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Check if a message contains the phase closure signal
 */
export function hasPhaseClosureSignal(content: string): boolean {
  return content.includes("[PHASE_CLOSURE]");
}

/**
 * Remove the phase closure signal from message content for display
 */
export function removePhaseClosureSignal(content: string): string {
  return content.replace(/\[PHASE_CLOSURE\]/g, "").trim();
}
