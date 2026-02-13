import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation, useParams } from "wouter";
import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass,
  Send, Mic, ArrowLeft, MoreVertical, Loader2,
  History, X, Volume2, Square, Loader,
  type LucideIcon
} from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { ReflectionCardDrawer, DrawCardButton, type ReflectionCardData } from "@/components/ReflectionCard";
import { PhaseClosureNotice, hasPhaseClosureSignal, removePhaseClosureSignal } from "@/components/PhaseClosureNotice";


const iconMap: Record<string, LucideIcon> = {
  Briefcase, Crown, Heart, Leaf, Sparkles, Compass
};

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  isVoiceInput?: boolean;
}

export default function Chat() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ roleSlug?: string; id?: string }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showCardDrawer, setShowCardDrawer] = useState(false);
  const [cardHistory, setCardHistory] = useState<ReflectionCardData[]>([]);
  const [showCardHistory, setShowCardHistory] = useState(false);
  const [selectedHistoryCard, setSelectedHistoryCard] = useState<ReflectionCardData | null>(null);
  const [showPhaseClosureNotice, setShowPhaseClosureNotice] = useState(false);
  const [phaseClosureShownThisSession, setPhaseClosureShownThisSession] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  
  // Session summary: inactivity timer ref
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationIdRef = useRef<number | null>(null);
  const messagesCountRef = useRef<number>(0);
  const summaryGeneratedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);
  useEffect(() => { messagesCountRef.current = messages.length; }, [messages]);
  useEffect(() => { summaryGeneratedRef.current = summaryGenerated; }, [summaryGenerated]);

  // TTS state
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [loadingTTSMessageId, setLoadingTTSMessageId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: roles } = trpc.roles.list.useQuery();
  const { data: existingConversation } = trpc.conversations.get.useQuery(
    { id: Number(params.id) },
    { enabled: !!params.id && isAuthenticated }
  );
  
  const createConversation = trpc.conversations.create.useMutation();
  // sendMessage kept as fallback; primary path is streaming via /api/chat/stream
  const sendMessage = trpc.chat.send.useMutation();
  // Voice transcription uses direct REST endpoint /api/transcribe
  
  // Card history - persistent storage
  const { data: persistentCardHistory } = trpc.cardHistory.list.useQuery(
    { guide: 'Anya' },
    { enabled: isAuthenticated && selectedRole?.slug === 'anxiety' }
  );
  const saveCardToHistory = trpc.cardHistory.save.useMutation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Load existing conversation
  useEffect(() => {
    if (existingConversation) {
      setConversationId(existingConversation.id);
      setSelectedRole(existingConversation.role);
      setMessages(existingConversation.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        isVoiceInput: m.isVoiceInput === 1
      })));
    }
  }, [existingConversation]);

  // Set role from URL param
  useEffect(() => {
    if (params.roleSlug && roles && !params.id) {
      const role = roles.find(r => r.slug === params.roleSlug);
      if (role) setSelectedRole(role);
    }
  }, [params.roleSlug, roles, params.id]);

  // Load persistent card history from database
  useEffect(() => {
    if (persistentCardHistory && persistentCardHistory.length > 0) {
      const loadedCards: ReflectionCardData[] = persistentCardHistory.map(card => ({
        id: card.cardId,
        text: card.cardText,
        imageUrl: card.cardImageUrl,
        tags: (card.tags as string[]) || [],
        guide: card.guide,
      }));
      setCardHistory(loadedCards);
    }
  }, [persistentCardHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSend = async (text: string, isVoice = false) => {
    if (!text.trim() || isLoading || streamingMessageId !== null) return;
    
    const userMessage = text.trim();
    setInput("");
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      isVoiceInput: isVoice
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      let convId = conversationId;
      
      // Create conversation if needed
      if (!convId && selectedRole) {
        const result = await createConversation.mutateAsync({
          roleId: selectedRole.id,
          title: userMessage.slice(0, 50)
        });
        convId = result.id;
        setConversationId(convId);
      }

      if (!convId) {
        toast.error("Please select a guide first");
        setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
        setIsLoading(false);
        return;
      }

      // Add placeholder assistant message for streaming
      const assistantMsgId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: "assistant",
        content: ""
      }]);
      setStreamingMessageId(assistantMsgId);
      setIsLoading(false); // Hide typing dots since we show streaming text

      // Stream the response via SSE
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          message: userMessage,
          isVoiceInput: isVoice,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === "chunk") {
              fullText += data.content;
              // Update the streaming message content
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: fullText }
                  : m
              ));
            } else if (data.type === "done") {
              // Final content from server (already saved to DB)
              const finalContent = data.content || fullText;
              
              // Check for phase closure signal
              if (hasPhaseClosureSignal(finalContent) && !phaseClosureShownThisSession) {
                setShowPhaseClosureNotice(true);
                setPhaseClosureShownThisSession(true);
              }
              
              const displayContent = removePhaseClosureSignal(finalContent);
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: displayContent }
                  : m
              ));
            } else if (data.type === "error") {
              toast.error("Failed to generate response. Please try again.");
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      setStreamingMessageId(null);
      
      // Reset inactivity timer after each message exchange
      resetInactivityTimer();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      // Remove both user message and empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id && m.content !== ""));
      setStreamingMessageId(null);
      setIsLoading(false);
    }
  };

  // --- Session Summary Logic ---
  const triggerSessionSummary = useCallback(async (convId: number) => {
    if (summaryGeneratedRef.current) return;
    if (messagesCountRef.current < 2) return;
    
    summaryGeneratedRef.current = true;
    setSummaryGenerated(true);
    
    try {
      await fetch("/api/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId }),
      });
      console.log("[SessionSummary] Summary generation triggered for conversation", convId);
    } catch (error) {
      console.error("[SessionSummary] Failed to trigger summary:", error);
      // Reset so it can retry
      summaryGeneratedRef.current = false;
      setSummaryGenerated(false);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      const convId = conversationIdRef.current;
      if (convId && !summaryGeneratedRef.current) {
        triggerSessionSummary(convId);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }, [triggerSessionSummary]);

  // Page close / navigate away: trigger summary via sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      const convId = conversationIdRef.current;
      if (convId && !summaryGeneratedRef.current && messagesCountRef.current >= 2) {
        // Use sendBeacon for reliable delivery on page close
        navigator.sendBeacon(
          "/api/session-summary",
          new Blob(
            [JSON.stringify({ conversationId: convId })],
            { type: "application/json" }
          )
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Also trigger summary when navigating away within the app (component unmount)
  useEffect(() => {
    return () => {
      const convId = conversationIdRef.current;
      if (convId && !summaryGeneratedRef.current && messagesCountRef.current >= 2) {
        fetch("/api/session-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        
        // Send audio directly to server for transcription (no S3 upload needed)
        try {
          setIsLoading(true);
          const arrayBuffer = await audioBlob.arrayBuffer();
          
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: new Uint8Array(arrayBuffer)
          });
          
          if (!response.ok) {
            throw new Error("Transcription request failed");
          }
          
          const { text } = await response.json();
          if (text) {
            handleSend(text, true);
          }
        } catch (error) {
          console.error("Transcription failed:", error);
          toast.error("Voice transcription failed. Please try again or type your message.");
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  // TTS: Check if current guardian has voice enabled
  const isTTSAvailable = selectedRole?.slug === "transformation"; // Axel only for now

  // TTS: Play or stop audio for a message
  const handlePlayTTS = useCallback(async (messageId: number, text: string) => {
    // If already playing this message, stop it
    if (playingMessageId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingMessageId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setLoadingTTSMessageId(messageId);
    setPlayingMessageId(null);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          guardianSlug: selectedRole?.slug,
        }),
      });

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingMessageId(null);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
      };

      audio.onerror = (e) => {
        // Only show error if we're not already playing successfully
        // Some browsers fire a transient error during loading that resolves on its own
        if (audioRef.current?.paused && !audioRef.current?.ended) {
          setPlayingMessageId(null);
          setLoadingTTSMessageId(null);
        }
      };

      setLoadingTTSMessageId(null);
      setPlayingMessageId(messageId);
      await audio.play();
    } catch (error) {
      console.error("TTS failed:", error);
      toast.error("Voice playback is not available right now");
      setLoadingTTSMessageId(null);
      setPlayingMessageId(null);
    }
  }, [playingMessageId, selectedRole?.slug]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  // Handle reflection card selection (Anya only)
  const handleCardReflect = (card: ReflectionCardData) => {
    setShowCardDrawer(false);
    // Add to local history (avoid duplicates)
    setCardHistory(prev => {
      const exists = prev.some(c => c.id === card.id);
      if (exists) return prev;
      return [...prev, card];
    });
    // Save to database for persistence
    saveCardToHistory.mutate({
      cardId: card.id,
      cardText: card.text,
      cardImageUrl: card.imageUrl,
      tags: card.tags,
      guide: 'Anya',
    });
    // Format the card payload as a message to Anya
    const cardMessage = `[Reflection Card]\n\nCard: ${card.id}\nText: "${card.text}"\nTags: ${card.tags.join(", ")}\n\nI drew this reflection card and would like to explore it with you.`;
    handleSend(cardMessage);
  };

  // Role selection view
  if (!selectedRole && !params.id) {
    return (
      <div className="min-h-screen cinematic-bg flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            Who would you like to speak with?
          </h2>
          <p className="text-white/60 text-center mb-8">
            Choose a guide that resonates with your current journey
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles?.map((role) => {
              const IconComponent = iconMap[role.icon || "Sparkles"] || Sparkles;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className="group p-5 rounded-xl glass-card text-left transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/50"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <IconComponent className="w-6 h-6" color={role.color || undefined} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                      <p className="text-white/50 text-sm line-clamp-1">{role.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = selectedRole ? (iconMap[selectedRole.icon || "Sparkles"] || Sparkles) : Sparkles;

  // Get unique background class for each coach
  const getCoachBgClass = () => {
    switch (selectedRole?.slug) {
      case 'career': return 'coach-bg-andy';
      case 'anxiety': return 'coach-bg-anya';
      case 'relationships': return 'coach-bg-alma';
      case 'mirror': return 'coach-bg-axel';
      default: return 'cinematic-bg';
    }
  };

  return (
    <div className={`h-screen flex flex-col ${getCoachBgClass()}`}>
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-white/10 glass-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            
            {selectedRole && (
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: `${selectedRole.color}20` }}
                >
                  {selectedRole.avatar ? (
                    <img src={selectedRole.avatar} alt={selectedRole.name} className="w-[85%] h-[85%] object-contain object-center" />
                  ) : (
                    <IconComponent className="w-5 h-5" color={selectedRole.color || undefined} />
                  )}
                </div>
                <div>
                  <h1 className="text-white font-medium">{selectedRole.name}</h1>
                  <p className="text-white/50 text-xs">AI Guide</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/history")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="View conversation history"
            >
              <History className="w-5 h-5 text-white/70" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <MoreVertical className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div 
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: `${selectedRole?.color}20` }}
              >
                {selectedRole?.avatar ? (
                  <img src={selectedRole.avatar} alt={selectedRole.name} className="w-[85%] h-[85%] object-contain object-center" />
                ) : (
                  <IconComponent className="w-10 h-10" color={selectedRole?.color || undefined} />
                )}
              </div>
              {/* Custom welcome messages for each guide */}
              {selectedRole?.slug === 'career' ? (
                // Andy's welcome
                <>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    I'm Andy.
                  </h2>
                  <p className="text-white/60 max-w-md mx-auto mb-4">
                    I help you think about career and life direction — not by giving answers, but by helping you see what's already there.
                  </p>
                  <p className="text-white/50 max-w-md mx-auto text-sm">
                    You don't need to know where to start. Just tell me what's on your mind.
                  </p>
                </>
              ) : selectedRole?.slug === 'anxiety' ? (
                // Anya's welcome (grounding/boundaries)
                showCardDrawer ? (
                  <ReflectionCardDrawer
                    onReflect={handleCardReflect}
                    onClose={() => setShowCardDrawer(false)}
                  />
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-white mb-3">
                      I'm Anya.
                    </h2>
                    <p className="text-white/60 max-w-md mx-auto mb-4">
                      I'm here to walk beside you — not to fix or calm, but to help you find where you stand.
                    </p>
                    <p className="text-white/50 max-w-md mx-auto text-sm">
                      What's weighing on you? Take your time.
                    </p>
                    <DrawCardButton onClick={() => setShowCardDrawer(true)} />
                  </>
                )
              ) : selectedRole?.slug === 'relationships' ? (
                // Alma's welcome (love/intimacy)
                <>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    I'm Alma.
                  </h2>
                  <p className="text-white/60 max-w-md mx-auto mb-4">
                    I'm here to help you see what's happening in your relationships — not to judge, not to fix, just to help you understand.
                  </p>
                  <p className="text-white/50 max-w-md mx-auto text-sm">
                    What's on your heart? Take your time.
                  </p>
                </>
              ) : selectedRole?.slug === 'transformation' ? (
                // Axel's welcome
                <>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    I'm Axel.
                  </h2>
                  <p className="text-white/60 max-w-md mx-auto mb-4">
                    I don't do comfort. I point at patterns you might prefer not to see.
                  </p>
                  <p className="text-white/60 max-w-md mx-auto mb-4">
                    You decide what to do with them. We can stop anytime.
                  </p>
                  <p className="text-white/50 max-w-md mx-auto text-sm">
                    What's on your mind?
                  </p>
                </>
              ) : (
                // Default welcome for other guides (Alan, Atlas, Amos, Annie)
                <>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    Welcome to your session
                  </h2>
                  <p className="text-white/60 max-w-md mx-auto">
                    I'm here with you. Take a breath, settle in, and share whatever is present for you right now.
                  </p>
                </>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-4 rounded-2xl ${
                  message.role === "user" 
                    ? "message-user" 
                    : "message-assistant"
                }`}
              >
                {message.isVoiceInput && (
                  <div className="flex items-center gap-1 text-teal-light text-xs mb-2">
                    <Mic className="w-3 h-3" />
                    Voice message
                  </div>
                )}
                <div className="text-white/90 leading-relaxed">
                  {message.role === "assistant" ? (
                    message.content ? (
                      <Streamdown
                        parseIncompleteMarkdown={streamingMessageId === message.id}
                        isAnimating={streamingMessageId === message.id}
                      >
                        {message.content}
                      </Streamdown>
                    ) : streamingMessageId === message.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-light typing-dot" />
                        <div className="w-2 h-2 rounded-full bg-teal-light typing-dot" />
                        <div className="w-2 h-2 rounded-full bg-teal-light typing-dot" />
                      </div>
                    ) : (
                      <Streamdown>{message.content}</Streamdown>
                    )
                  ) : (
                    message.content
                  )}
                </div>
                {/* TTS Play Button - Only for assistant messages when TTS is available */}
                {message.role === "assistant" && isTTSAvailable && (
                  <div className="flex items-center mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handlePlayTTS(message.id, message.content)}
                      disabled={loadingTTSMessageId === message.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all duration-200 ${
                        playingMessageId === message.id
                          ? "bg-amber-500/20 text-amber-400"
                          : loadingTTSMessageId === message.id
                          ? "bg-white/5 text-white/40 cursor-wait"
                          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
                      }`}
                      title={playingMessageId === message.id ? "Stop playback" : "Listen to response"}
                    >
                      {loadingTTSMessageId === message.id ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : playingMessageId === message.id ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="message-assistant px-5 py-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-light typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-teal-light typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-teal-light typing-dot" />
                </div>
              </div>
            </div>
          )}

          {/* Phase Closure Notice */}
          {showPhaseClosureNotice && selectedRole && roles && (
            <PhaseClosureNotice
              currentCoachSlug={selectedRole.slug}
              availableCoaches={roles.filter((r: any) => 
                ['career', 'anxiety', 'relationships', 'transformation'].includes(r.slug)
              ).map((r: any) => ({
                slug: r.slug,
                name: r.name,
                description: r.description
              }))}
              onDismiss={() => setShowPhaseClosureNotice(false)}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Voice Input Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={(isLoading || streamingMessageId !== null) && !isRecording}
              className={`relative flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${
                isRecording 
                  ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title={isRecording ? "Tap to stop recording" : "Tap to start recording"}
            >
              <Mic className="w-5 h-5" />
              {isRecording && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
            {isRecording && (
              <span className="text-red-400 text-xs animate-pulse self-center">Recording...</span>
            )}

            {/* Draw Card Button - Only for Anya (anxiety) */}
            {selectedRole?.slug === "anxiety" && (
              <>
                <button
                  onClick={() => setShowCardDrawer(true)}
                  disabled={isLoading || streamingMessageId !== null}
                  className="flex-shrink-0 p-3 rounded-xl transition-all duration-300 bg-white/5 text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-400 border border-amber-500/20"
                  title="Draw a reflection card"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                {/* Card History Button - Only show if there are cards in history */}
                {cardHistory.length > 0 && (
                  <button
                    onClick={() => setShowCardHistory(true)}
                    disabled={isLoading || streamingMessageId !== null}
                    className="flex-shrink-0 p-3 rounded-xl transition-all duration-300 bg-white/5 text-teal/80 hover:bg-teal/10 hover:text-teal border border-teal/20 relative"
                    title="View card history"
                  >
                    <History className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-teal text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {cardHistory.length}
                    </span>
                  </button>
                )}
              </>
            )}

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind..."
                disabled={isLoading || streamingMessageId !== null}
                rows={1}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-all"
                style={{ maxHeight: "150px" }}
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading || streamingMessageId !== null}
              className="flex-shrink-0 p-3 h-auto bg-gradient-to-r from-teal to-teal-light hover:opacity-90 disabled:opacity-50 rounded-xl"
            >
              {(isLoading || streamingMessageId !== null) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-center text-white/30 text-xs mt-3">
            Your conversations are private and secure
          </p>
        </div>
      </div>

      {/* Card Drawer Modal - For drawing cards during conversation */}
      {showCardDrawer && selectedRole?.slug === 'anxiety' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowCardDrawer(false)}
              className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <ReflectionCardDrawer
              onReflect={handleCardReflect}
              onClose={() => setShowCardDrawer(false)}
            />
          </div>
        </div>
      )}

      {/* Card History Modal */}
      {showCardHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-teal" />
                <h3 className="text-lg font-semibold text-white">Your Drawn Cards</h3>
                <span className="text-white/50 text-sm">({cardHistory.length} cards)</span>
              </div>
              <button
                onClick={() => {
                  setShowCardHistory(false);
                  setSelectedHistoryCard(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {selectedHistoryCard ? (
                /* Full card view */
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setSelectedHistoryCard(null)}
                    className="self-start mb-4 text-white/60 hover:text-white flex items-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to all cards
                  </button>
                  <div className="max-w-sm">
                    <img
                      src={selectedHistoryCard.imageUrl}
                      alt="Reflection card"
                      className="w-full rounded-xl shadow-2xl"
                    />
                    <p className="text-center text-white/80 mt-4 italic">
                      "{selectedHistoryCard.text}"
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      {selectedHistoryCard.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Grid view */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {cardHistory.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedHistoryCard(card)}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all hover:scale-105"
                    >
                      <img
                        src={card.imageUrl}
                        alt="Reflection card"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-xs line-clamp-2">
                          {card.text.split('\n')[0]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
