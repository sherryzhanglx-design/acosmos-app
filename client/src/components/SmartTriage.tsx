import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MessageCircle, ArrowRight, Sparkles, Send, Loader2 } from "lucide-react";

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  avatar: string | null;
  color: string | null;
  icon: string | null;
}

interface SmartTriageProps {
  roles: Role[];
  isAuthenticated: boolean;
  onStartConversation: (slug: string) => void;
}

export default function SmartTriage({ roles, isAuthenticated, onStartConversation }: SmartTriageProps) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const triageMutation = trpc.triage.recommend.useMutation({
    onSuccess: () => {
      // Scroll to result after a short delay for animation
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  });

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || triageMutation.isPending) return;
    setSubmitted(true);
    triageMutation.mutate({ concern: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setInput("");
    setSubmitted(false);
    triageMutation.reset();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Find role data for the recommendation
  const primaryRole = triageMutation.data?.primary
    ? roles.find(r => r.slug === triageMutation.data!.primary.slug)
    : null;
  const secondaryRole = triageMutation.data?.secondary
    ? roles.find(r => r.slug === triageMutation.data!.secondary!.slug)
    : null;

  return (
    <div className="max-w-xl mx-auto">
      {/* Dialogue Bubble */}
      <div className="relative">
        {/* The warm question */}
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              What's on your mind today?
            </p>
            <p className="text-white/40 text-xs mt-1">
              Share what you're feeling or thinking — I'll match you with the right guide.
            </p>
          </div>
        </div>

        {/* Input area */}
        {!submitted ? (
          <div className="relative group">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm 
              focus-within:border-amber-500/30 focus-within:bg-white/[0.06] transition-all duration-300
              hover:border-white/15">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="I've been feeling stuck in my career..."
                rows={3}
                className="w-full bg-transparent text-white/90 placeholder-white/25 px-4 pt-4 pb-2 
                  resize-none outline-none text-sm md:text-base leading-relaxed"
                maxLength={1000}
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-white/20 text-xs">
                  {input.length > 0 ? `${input.length}/1000` : "Press Enter to send"}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                    ${input.trim() 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20' 
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Show the user's submitted message */
          <div className="flex justify-end mb-6">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm bg-amber-500/15 border border-amber-500/20">
              <p className="text-white/80 text-sm leading-relaxed">{input}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {triageMutation.isPending && (
          <div className="flex items-start gap-3 mt-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-white/50 text-sm">Finding the right guide for you...</span>
            </div>
          </div>
        )}

        {/* Recommendation result */}
        {triageMutation.data && !triageMutation.isPending && (
          <div ref={resultRef} className="mt-4 space-y-4">
            {/* Primary recommendation */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 flex items-center justify-center border border-amber-500/20">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {triageMutation.data.primary.reason || "I think this Guardian can help you."}
                </p>

                {/* Primary Guardian Card */}
                <button
                  onClick={() => onStartConversation(triageMutation.data!.primary.slug)}
                  className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-amber-500/20 
                    bg-gradient-to-r from-amber-500/[0.08] to-transparent backdrop-blur-sm
                    hover:border-amber-500/40 hover:from-amber-500/[0.12] transition-all duration-300
                    cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden">
                    {primaryRole?.avatar ? (
                      <img 
                        src={primaryRole.avatar} 
                        alt={primaryRole.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-500/20 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                      {(triageMutation.data.primary as any).name || primaryRole?.name || "Guardian"}
                    </h4>
                    <p className="text-white/40 text-xs mt-0.5">
                      {primaryRole?.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0 flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-medium">Start</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Secondary recommendation */}
                {secondaryRole && triageMutation.data.secondary && (
                  <div className="mt-3">
                    <p className="text-white/40 text-xs mb-2">
                      {triageMutation.data.secondary.reason}
                    </p>
                    <button
                      onClick={() => onStartConversation(triageMutation.data!.secondary!.slug)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/8 
                        bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300
                        cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {secondaryRole.avatar ? (
                          <img src={secondaryRole.avatar} alt={secondaryRole.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white/50" />
                          </div>
                        )}
                      </div>
                      <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                        Or talk to {secondaryRole.name}
                      </span>
                      <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reset / try again */}
            <div className="text-center pt-2">
              <button
                onClick={handleReset}
                className="text-white/30 text-xs hover:text-white/50 transition-colors underline underline-offset-2"
              >
                Ask about something else
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {triageMutation.isError && (
          <div className="mt-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Sparkles className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white/60 text-sm mb-2">
                Something went wrong. You can try again, or browse the Guardians below.
              </p>
              <button
                onClick={handleReset}
                className="text-amber-400 text-sm hover:text-amber-300 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
