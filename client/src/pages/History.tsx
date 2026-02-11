import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { 
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass,
  ArrowLeft, MessageCircle, Calendar, Trash2, ChevronRight,
  type LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const iconMap: Record<string, LucideIcon> = {
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass
};

export default function History() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: conversations, isLoading, refetch } = trpc.conversations.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const archiveConversation = trpc.conversations.archive.useMutation({
    onSuccess: () => {
      toast.success("Conversation archived");
      refetch();
    },
    onError: () => {
      toast.error("Failed to archive conversation");
    }
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== new Date(date).getFullYear() ? "numeric" : undefined
    });
  };

  return (
    <div className="min-h-screen cinematic-bg">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <h1 className="text-xl font-semibold text-white">Conversation History</h1>
          </div>
          
          <Button
            onClick={() => navigate("/chat")}
            className="bg-gradient-to-r from-amber-500 to-orange hover:opacity-90"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl glass-card animate-pulse" />
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const IconComponent = conv.role 
                ? (iconMap[conv.role.icon || "Sparkles"] || Sparkles)
                : Sparkles;
              
              return (
                <div
                  key={conv.id}
                  className="group relative rounded-xl glass-card overflow-hidden transition-all duration-300 hover:border-amber-500/30"
                >
                  <button
                    onClick={() => navigate(`/conversation/${conv.id}`)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start gap-4">
                      {/* Role Avatar */}
                      <div 
                        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: `${conv.role?.color || "#0891b2"}20` }}
                      >
                        {conv.role?.avatar ? (
                          <img src={conv.role.avatar} alt={conv.role.name} className="w-[85%] h-[85%] object-contain object-center" />
                        ) : (
                          <IconComponent 
                            className="w-6 h-6" 
                            color={conv.role?.color || "#0891b2"} 
                          />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white/50 text-sm">
                            {conv.role?.name || "Guide"}
                          </span>
                          <span className="text-white/30">•</span>
                          <span className="text-white/40 text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(conv.updatedAt)}
                          </span>
                        </div>
                        
                        <h3 className="text-white font-medium truncate pr-8">
                          {conv.title || "Untitled conversation"}
                        </h3>
                        
                        {conv.summary && (
                          <p className="text-white/50 text-sm mt-1 line-clamp-2">
                            {conv.summary}
                          </p>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="flex-shrink-0 w-5 h-5 text-white/30 group-hover:text-teal-light transition-colors" />
                    </div>
                  </button>
                  
                  {/* Archive Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="absolute top-5 right-14 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-4 h-4 text-white/50 hover:text-red-400" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Archive this conversation?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This conversation will be moved to your archive. You can restore it later if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => archiveConversation.mutate({ id: conv.id })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-teal/20 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-teal-light" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              No conversations yet
            </h2>
            <p className="text-white/60 max-w-md mx-auto mb-8">
              Start your first conversation to begin your journey of self-discovery and growth.
            </p>
            <Button
              onClick={() => navigate("/chat")}
              className="bg-gradient-to-r from-amber-500 to-orange hover:opacity-90"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Your First Session
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
