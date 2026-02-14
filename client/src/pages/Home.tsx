import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import CosmicBreath from "@/components/CosmicBreath";
import GoldenGlow from "@/components/GoldenGlow";
import SmartTriage from "@/components/SmartTriage";
import { 
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass, Globe, Brain,
  ArrowRight, MessageCircle, History, ChevronDown, Layers,
  Mail, Shield, HelpCircle, FileText, Users, Lock, CreditCard,
  X, Smartphone, Linkedin, Youtube,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass, Globe, Brain
};

const ACTIVE_GUARDIANS = ["career", "anxiety", "relationships", "transformation"];
const COMING_SOON_GUARDIANS = ["leadership", "legacy", "family", "emotions"];
const MOBILE_TIP_SHOWN_KEY = 'acosmos_mobile_tip_shown';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: roles, isLoading: rolesLoading } = trpc.roles.list.useQuery();
  const [showMobileTip, setShowMobileTip] = useState(false);
  const [hoveredGuardian, setHoveredGuardian] = useState<string | null>(null);
  
  // Scroll-driven fade-in refs
  const narrativeRef = useRef<HTMLElement>(null);
  const guardiansRef = useRef<HTMLElement>(null);
  const [narrativeVisible, setNarrativeVisible] = useState(false);
  const [guardiansIntroVisible, setGuardiansIntroVisible] = useState(false);

  // Mobile tip logic
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const hasSeenTip = localStorage.getItem(MOBILE_TIP_SHOWN_KEY);
      if (isMobile && !hasSeenTip) {
        setShowMobileTip(true);
      }
    }
  }, [isAuthenticated, loading]);

  const dismissMobileTip = () => {
    setShowMobileTip(false);
    localStorage.setItem(MOBILE_TIP_SHOWN_KEY, 'true');
  };

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === narrativeRef.current && entry.isIntersecting) {
            setNarrativeVisible(true);
          }
          if (entry.target === guardiansRef.current && entry.isIntersecting) {
            setGuardiansIntroVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (narrativeRef.current) observer.observe(narrativeRef.current);
    if (guardiansRef.current) observer.observe(guardiansRef.current);

    return () => observer.disconnect();
  }, []);

  // Sort roles
  const { activeRoles, comingSoonRoles } = useMemo(() => {
    if (!roles) return { activeRoles: [], comingSoonRoles: [] };
    const active = ACTIVE_GUARDIANS
      .map(slug => roles.find(r => r.slug === slug))
      .filter(Boolean);
    const comingSoon = COMING_SOON_GUARDIANS
      .map(slug => roles.find(r => r.slug === slug))
      .filter(Boolean);
    return { activeRoles: active, comingSoonRoles: comingSoon };
  }, [roles]);

  const handleRoleSelect = useCallback((slug: string, isComingSoon: boolean) => {
    if (isComingSoon) return;
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    navigate(`/chat/${slug}`);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen relative" style={{ background: "transparent" }}>
      {/* Cosmic Breath Background — fixed, behind everything */}
      <CosmicBreath />

      {/* Mobile Session Tip Banner */}
      {showMobileTip && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-sm border-t border-amber-500/20">
          <div className="max-w-lg mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">Stay logged in on mobile</h4>
                <p className="text-white/60 text-xs leading-relaxed mb-2">
                  To keep your conversations saved, make sure your browser isn't set to clear cookies. 
                  Avoid using Private/Incognito mode.
                </p>
                <button
                  onClick={() => navigate('/support')}
                  className="text-amber-400 text-xs hover:text-amber-300 underline"
                >
                  Learn more in FAQ
                </button>
              </div>
              <button
                onClick={dismissMobileTip}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation — fixed top */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/brjZCKejzRbtntrI.jpg" 
              alt="A.Cosmos" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shadow-lg shadow-amber-500/20"
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-amber-400 hover:bg-white/5 px-2 sm:px-3"
                  onClick={() => navigate("/history")}
                >
                  <History className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">History</span>
                </Button>
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black text-xs sm:text-sm font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:inline text-white/90 text-sm">{user?.name || "User"}</span>
                </div>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-medium border-0 shadow-lg shadow-amber-500/30"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — Hero: "A.Cosmos / Illuminate the stars within you"
          ═══════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-28 pb-4 px-6 flex flex-col justify-center" style={{ minHeight: '60vh' }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Radiant golden energy glow behind title + subtitle */}
          <div className="relative" style={{ minHeight: '180px' }}>
            <div className="absolute pointer-events-none" style={{
              top: '50%',
              left: '50%',
              width: '700px',
              height: '500px',
              transform: 'translate(-50%, -50%)',
            }}>
              <GoldenGlow />
            </div>
            <h1 className="relative text-5xl md:text-7xl font-bold mb-5 tracking-tight" style={{ zIndex: 1 }}>
              <span className="text-gold-gradient">A.Cosmos</span>
            </h1>
            <p className="relative text-xl md:text-2xl text-white/90 mb-8 font-light italic" style={{ zIndex: 1 }}>
              Illuminate the stars within you
            </p>
          </div>
          
          {/* Body copy — consolidated narrative */}
          <div className="max-w-2xl mx-auto mb-4">
            <p className="text-base md:text-lg text-white/60 leading-relaxed mb-6">
              Inside each of us lies a luminous cosmos.
              <br />
              Every planet mirrors an aspect of our life — career, love, emotions, identity.
            </p>
            <p className="text-base md:text-lg text-white/50 leading-relaxed mb-6">
              When life shifts, some of these may feel lost in the dark.
            </p>
            <p className="text-base md:text-lg text-white/50 leading-relaxed mb-6">
              A.Cosmos is a circle of AI guides,
              <br />
              each one here to help you see what you can't see alone.
            </p>
            <p className="text-base md:text-lg text-amber-400/70 font-light">
              Choose a guide. Begin a conversation with yourself.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — Smart Triage
          ═══════════════════════════════════════════════════ */}
      <section 
        ref={narrativeRef}
        className="relative z-10 pt-4 pb-12 md:pt-6 md:pb-16 px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          {/* Smart Triage Dialogue Bubble */}
          <div 
            className="transition-all duration-1000 ease-out"
            style={{
              opacity: narrativeVisible ? 1 : 0,
              transform: narrativeVisible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <SmartTriage 
              roles={roles || []} 
              isAuthenticated={isAuthenticated}
              onStartConversation={(slug) => {
                if (!isAuthenticated) {
                  window.location.href = getLoginUrl();
                  return;
                }
                navigate(`/chat/${slug}`);
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — "Your Constellation of Guides"
          Guardian cards
          ═══════════════════════════════════════════════════ */}
      <section 
        ref={guardiansRef}
        className="relative z-10 py-16 md:py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div 
            className="text-center mb-12 transition-all duration-1000 ease-out"
            style={{
              opacity: guardiansIntroVisible ? 1 : 0,
              transform: guardiansIntroVisible ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Your Constellation of Guides
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm md:text-base">
              Wherever you are, whenever you need, they're here<br />— quietly standing by.
            </p>
          </div>

          {rolesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Active Guardians — Top Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {activeRoles.map((role: any) => {
                  const IconComponent = iconMap[role.icon || "Sparkles"] || Sparkles;
                  const isHovered = hoveredGuardian === role.slug;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.slug, false)}
                      onMouseEnter={() => setHoveredGuardian(role.slug)}
                      onMouseLeave={() => setHoveredGuardian(null)}
                      className={`group relative p-5 rounded-2xl text-center transition-all duration-500 
                        border cursor-pointer backdrop-blur-sm
                        ${isHovered 
                          ? 'scale-[1.05] border-amber-500/40 bg-white/10 shadow-[0_0_40px_rgba(191,163,106,0.15)]' 
                          : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/15'
                        }`}
                    >
                      {/* Glow effect on hover */}
                      <div 
                        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                          background: `radial-gradient(circle at 50% 30%, ${role.color}20 0%, transparent 70%)`
                        }}
                      />
                      
                      <div 
                        className={`w-20 h-20 mx-auto flex items-center justify-center mb-3 
                          transition-all duration-500
                          ${isHovered ? 'scale-110' : ''}`}
                      >
                        {role.avatar ? (
                          <img 
                            src={role.avatar} 
                            alt={role.name}
                            className={`w-full h-full object-contain object-center transition-transform duration-500 ${isHovered ? 'scale-105' : ''}`}
                          />
                        ) : (
                          <IconComponent 
                            className={`w-8 h-8 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
                            style={{ color: role.color || '#f59e0b' }}
                          />
                        )}
                      </div>
                      
                      <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${isHovered ? 'text-amber-400' : 'text-white'}`}>
                        {role.name}
                      </h3>
                      
                      <p className={`text-sm font-medium tracking-wide transition-colors ${isHovered ? 'text-amber-400/80' : 'text-white/50'}`}>
                        {{
                          career: 'Career',
                          anxiety: 'Emotions',
                          relationships: 'Love',
                          transformation: 'Blind Spots',
                          leadership: 'Leadership',
                          legacy: '2nd Act',
                          family: 'Family',
                          emotions: 'Grief',
                        }[role.slug as string] || role.description}
                      </p>

                      {/* Enter indicator */}
                      <div className={`mt-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-xs text-amber-400/80 flex items-center justify-center gap-1">
                          Enter <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Coming Soon Guardians — Bottom Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {comingSoonRoles.map((role: any) => {
                  const IconComponent = iconMap[role.icon || "Sparkles"] || Sparkles;
                  return (
                    <div
                      key={role.id}
                      onMouseEnter={() => setHoveredGuardian(role.slug)}
                      onMouseLeave={() => setHoveredGuardian(null)}
                      className="group relative p-5 rounded-2xl text-center border border-white/5 opacity-50 cursor-default backdrop-blur-sm bg-white/[0.02]"
                    >
                      {/* Lock overlay */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white/50" />
                        </div>
                      </div>
                      
                      <div 
                        className="w-20 h-20 mx-auto flex items-center justify-center mb-3
                          grayscale-[30%]"
                      >
                        {role.avatar ? (
                          <img 
                            src={role.avatar} 
                            alt={role.name}
                            className="w-full h-full object-contain object-center opacity-70"
                          />
                        ) : (
                          <IconComponent 
                            className="w-8 h-8 opacity-50"
                            style={{ color: role.color || '#f59e0b' }}
                          />
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white/70 mb-1">
                        {role.name}
                      </h3>
                      
                      <p className="text-white/40 text-sm font-medium tracking-wide">
                        {{
                          career: 'Career',
                          anxiety: 'Emotions',
                          relationships: 'Love',
                          transformation: 'Blind Spots',
                          leadership: 'Leadership',
                          legacy: '2nd Act',
                          family: 'Family',
                          emotions: 'Grief',
                        }[role.slug as string] || role.description}
                      </p>

                      <div className="mt-3">
                        <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
     </div>
   </section>

      {/* Apex Module — Preserved for future update */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => isAuthenticated ? navigate("/chat") : window.location.href = getLoginUrl()}
              className="group p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/50 border border-white/8 backdrop-blur-sm bg-white/[0.04]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                Guided Reflection
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Engage in meaningful, distraction-free conversations with your AI guide.
              </p>
            </button>

            <button
              onClick={() => isAuthenticated ? navigate("/reflection") : window.location.href = getLoginUrl()}
              className="group p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 border border-white/8 backdrop-blur-sm bg-white/[0.04]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                Reflection & Integration
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Meet Apex — synthesize insights across guardians for deeper understanding.
              </p>
              <span className="inline-block mt-2 text-xs text-purple-400/80 bg-purple-500/10 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/50 hover:text-amber-400 text-sm transition-colors">Features</a></li>
                <li><a href="#" className="text-white/50 hover:text-amber-400 text-sm transition-colors">Guardians</a></li>
                <li><a href="#" className="text-white/50 hover:text-amber-400 text-sm transition-colors">Pricing</a></li>
                <li><a href="#" className="text-white/50 hover:text-amber-400 text-sm transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/support")} className="text-white/50 hover:text-amber-400 text-sm transition-colors flex items-center gap-2"><HelpCircle className="w-3 h-3" />Help Center</button></li>
                <li><a href="mailto:support@lifemaster.coach" className="text-white/50 hover:text-amber-400 text-sm transition-colors flex items-center gap-2"><Mail className="w-3 h-3" />Contact Us</a></li>
                <li><a href="#" className="text-white/50 hover:text-amber-400 text-sm transition-colors flex items-center gap-2"><Users className="w-3 h-3" />Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/terms")} className="text-white/50 hover:text-amber-400 text-sm transition-colors flex items-center gap-2"><FileText className="w-3 h-3" />Terms of Use</button></li>
                <li><button onClick={() => navigate("/privacy")} className="text-white/50 hover:text-amber-400 text-sm transition-colors flex items-center gap-2"><Shield className="w-3 h-3" />Privacy Policy</button></li>
                <li><button onClick={() => navigate("/purchase-terms")} className="text-white/50 hover:text-amber-400 text-sm transition-colors flex items-center gap-2"><CreditCard className="w-3 h-3" />Purchase Terms</button></li>
                <li><button onClick={() => navigate("/support")} className="text-white/50 hover:text-amber-400 text-sm transition-colors">FAQ</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/50 hover:text-amber-400 text-sm transition-colors">Our Story</a></li>
                <li><a href="#" className="text-white/50 hover:text-amber-400 text-sm transition-colors">Our Approach</a></li>
              </ul>
            </div>
          </div>

          {/* Safety Statement */}
          <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/50 text-xs leading-relaxed text-center">
              A.Cosmos provides AI-powered guided reflection and life exploration. It is not therapy, medical advice, or a substitute for professional support. If you are experiencing an emergency or crisis, please contact local emergency services or a qualified professional.
            </p>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/brjZCKejzRbtntrI.jpg" 
                alt="A.Cosmos" 
                className="w-8 h-8 rounded-lg object-cover opacity-80"
              />
              <span className="text-white/40 text-sm">A.Cosmos — Illuminate the stars within you</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com/in/sherryzhang-lifemaster" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/40 hover:text-amber-400 transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@A.CosmosbyLifeMaster" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/40 hover:text-amber-400 transition-colors"
                aria-label="Subscribe on YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            
            <p className="text-white/30 text-sm">
              © 2026 LifeMaster Development LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
