import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { 
  Layers, ArrowLeft, MessageCircle, 
  Upload, Brain, Zap, Check, ChevronDown, ChevronUp,
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass, Globe,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass, Globe, Brain
};

interface ConversationForSelection {
  id: number;
  title: string;
  roleId: number;
  roleName?: string;
  roleSlug?: string;
  roleColor?: string;
  roleIcon?: string;
  createdAt: Date;
  messageCount?: number;
}

export default function Reflection() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedConversations, setSelectedConversations] = useState<number[]>([]);
  const [expandedGuides, setExpandedGuides] = useState<string[]>([]);
  const [importText, setImportText] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch user's conversations
  const { data: conversations, isLoading: conversationsLoading } = trpc.conversations.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch roles for grouping
  const { data: roles } = trpc.roles.list.useQuery();

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Group conversations by guide
  const conversationsByGuide = useMemo(() => {
    if (!conversations || !roles) return {};
    
    const grouped: Record<string, ConversationForSelection[]> = {};
    
    conversations.forEach((conv: any) => {
      const role = roles.find((r: any) => r.id === conv.roleId);
      if (role) {
        const key = role.slug;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push({
          id: conv.id,
          title: conv.title || "Untitled conversation",
          roleId: conv.roleId,
          roleName: role.name,
          roleSlug: role.slug,
          roleColor: role.color ?? undefined,
          roleIcon: role.icon ?? undefined,
          createdAt: new Date(conv.createdAt),
          messageCount: conv.messageCount || 0
        });
      }
    });
    
    return grouped;
  }, [conversations, roles]);

  const toggleConversation = (id: number) => {
    setSelectedConversations(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const toggleGuideExpanded = (slug: string) => {
    setExpandedGuides(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const handleEnterRoundtable = () => {
    // Store selected conversations and import text in sessionStorage
    const roundtableData = {
      selectedConversationIds: selectedConversations,
      importedText: importText.trim() || null
    };
    sessionStorage.setItem('apex_roundtable_data', JSON.stringify(roundtableData));
    navigate("/apex");
  };

  const totalSelected = selectedConversations.length + (importText.trim() ? 1 : 0);

  return (
    <div className="min-h-screen cosmos-bg">
      {/* Animated stars overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-1 h-1 bg-purple-300/60 rounded-full animate-pulse" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
        <div className="absolute w-0.5 h-0.5 bg-purple-200/40 rounded-full animate-pulse" style={{ top: '25%', left: '80%', animationDelay: '0.5s' }} />
        <div className="absolute w-1 h-1 bg-purple-300/50 rounded-full animate-pulse" style={{ top: '60%', left: '10%', animationDelay: '1s' }} />
        <div className="absolute w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style={{ top: '75%', left: '70%', animationDelay: '1.5s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-b from-black/40 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-purple-400 hover:bg-white/5"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/brjZCKejzRbtntrI.jpg" 
              alt="A.Cosmos" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-lg font-semibold text-white">A.Cosmos</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center overflow-hidden">
                  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/xbtIIkDcKxYigZDq.jpg" alt="Apex" className="w-[140%] h-[140%] object-cover object-top" />
                </div>
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 blur-xl -z-10" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Apex · The Roundtable
            </h1>
            
            <p className="text-lg text-purple-300/90 mb-6 italic">
              A higher vantage point for what you've already explored.
            </p>
            
            <div className="max-w-xl mx-auto space-y-3 text-white/60 text-sm leading-relaxed">
              <p>
                Apex is not another conversation.<br />
                It's a space to step back — and look across what has already unfolded.
              </p>
              <p className="text-white/50">
                You don't bring everything. You bring what matters now.
              </p>
            </div>
          </div>

          {/* Conversation Selector */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">
                Bring What You Choose
              </h2>
              {totalSelected > 0 && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                  {totalSelected} selected
                </span>
              )}
            </div>
            
            <p className="text-white/50 text-sm mb-6">
              Select past conversations from your guardians, or import sessions from elsewhere.
            </p>

            {conversationsLoading ? (
              <div className="text-center py-8 text-white/40">
                Loading your conversations...
              </div>
            ) : Object.keys(conversationsByGuide).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 mb-4">No conversations yet.</p>
                <Button
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300"
                  onClick={() => navigate("/chat")}
                >
                  Start a conversation with a Guardian
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(conversationsByGuide).map(([slug, convs]) => {
                  const firstConv = convs[0];
                  const IconComponent = iconMap[firstConv?.roleIcon || "Sparkles"] || Sparkles;
                  const isExpanded = expandedGuides.includes(slug);
                  const selectedInGroup = convs.filter(c => selectedConversations.includes(c.id)).length;
                  
                  return (
                    <div key={slug} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      {/* Guide Header */}
                      <button
                        onClick={() => toggleGuideExpanded(slug)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${firstConv?.roleColor}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color: firstConv?.roleColor }} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-white font-medium">{firstConv?.roleName}</h3>
                            <p className="text-white/40 text-xs">{convs.length} conversation{convs.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedInGroup > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                              {selectedInGroup} selected
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-white/40" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-white/40" />
                          )}
                        </div>
                      </button>
                      
                      {/* Conversations List */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-2">
                          {convs.map(conv => {
                            const isSelected = selectedConversations.includes(conv.id);
                            return (
                              <button
                                key={conv.id}
                                onClick={() => toggleConversation(conv.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                  isSelected 
                                    ? 'bg-purple-500/20 border border-purple-500/30' 
                                    : 'hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isSelected 
                                    ? 'bg-purple-500 border-purple-500' 
                                    : 'border-white/30'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="text-white/90 text-sm truncate">{conv.title}</p>
                                  <p className="text-white/40 text-xs">
                                    {conv.createdAt.toLocaleDateString()}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Import Option */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-3 text-white/60 hover:text-purple-400 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Import text from A.Cosmos App or elsewhere</span>
                {importText.trim() && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                    Added
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden border border-purple-500/20">
                <h3 className="text-xl font-medium text-white mb-4">Import Conversation Text</h3>
                <p className="text-white/50 text-sm mb-4">
                  Paste conversation excerpts or notes from your A.Cosmos mobile app or any other source.
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your conversation text here..."
                  className="w-full h-64 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                    onClick={() => setShowImportModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-purple-500 hover:bg-purple-400 text-white"
                    onClick={() => setShowImportModal(false)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* A Gentle Note */}
          <div className="text-center mb-8">
            <div className="max-w-xl mx-auto p-5 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <p className="text-white/40 text-sm leading-relaxed">
                <span className="text-purple-300/60 font-medium">A Gentle Note</span><br /><br />
                The Roundtable experience is intentionally limited.<br />
                It's meant for moments when reflection asks for more than speed.
              </p>
            </div>
          </div>

          {/* Enter Button */}
          <div className="text-center mb-12">
            <Button
              size="lg"
              disabled={totalSelected === 0}
              className={`px-8 py-6 text-lg font-medium border-0 shadow-lg transition-all ${
                totalSelected > 0
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-purple-500/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
              onClick={handleEnterRoundtable}
            >
              <Layers className="w-5 h-5 mr-2" />
              {totalSelected > 0 
                ? `Enter the Roundtable with ${totalSelected} selection${totalSelected !== 1 ? 's' : ''}`
                : 'Select conversations to continue'
              }
            </Button>
          </div>

          {/* Secondary Option - De-emphasized */}
          <div className="text-center opacity-40 hover:opacity-60 transition-opacity">
            <p className="text-white/40 text-xs mb-2">Or continue your journey with</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white/60 hover:bg-white/5 text-xs"
              onClick={() => navigate("/chat")}
            >
              <Zap className="w-3 h-3 mr-1" />
              Guided Reflection Sessions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
