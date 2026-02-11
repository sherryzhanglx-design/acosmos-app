import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { 
  Layers, Send, ArrowLeft, Loader2, Info, X
} from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface RoundtableData {
  selectedConversationIds: number[];
  importedText: string | null;
}

export default function ApexChat() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [roundtableData, setRoundtableData] = useState<RoundtableData | null>(null);
  const [showContextInfo, setShowContextInfo] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: roles } = trpc.roles.list.useQuery();
  const apexRole = roles?.find(r => r.slug === 'apex' || r.slug === 'wisdom');
  
  const createConversation = trpc.conversations.create.useMutation();
  const sendApexMessage = trpc.apex.sendWithContext.useMutation();

  // Load roundtable data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('apex_roundtable_data');
    if (stored) {
      try {
        const data = JSON.parse(stored) as RoundtableData;
        setRoundtableData(data);
      } catch (e) {
        console.error("Failed to parse roundtable data:", e);
      }
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

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

  // Fetch selected conversation details for display
  const { data: selectedConversations } = trpc.apex.getSelectedConversations.useQuery(
    { conversationIds: roundtableData?.selectedConversationIds || [] },
    { enabled: !!roundtableData && roundtableData.selectedConversationIds.length > 0 }
  );

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage = text.trim();
    setInput("");
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      let convId = conversationId;
      
      // Create conversation if needed (use apex or wisdom role)
      if (!convId && apexRole) {
        const result = await createConversation.mutateAsync({
          roleId: apexRole.id,
          title: "Apex Roundtable: " + userMessage.slice(0, 40)
        });
        convId = result.id;
        setConversationId(convId);
      }

      if (!convId) {
        toast.error("Could not start Apex session");
        setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
        setIsLoading(false);
        return;
      }

      // Send message with context (only on first message)
      const response = await sendApexMessage.mutateAsync({
        conversationId: convId,
        message: userMessage,
        selectedConversationIds: isFirstMessage ? roundtableData?.selectedConversationIds : undefined,
        importedText: isFirstMessage ? roundtableData?.importedText || undefined : undefined,
      });

      setIsFirstMessage(false);

      // Add assistant response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: response.content
      }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const totalContext = (roundtableData?.selectedConversationIds?.length || 0) + (roundtableData?.importedText ? 1 : 0);

  return (
    <div className="h-screen flex flex-col cosmos-bg">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-purple-500/20 glass-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/reflection")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/xbtIIkDcKxYigZDq.jpg" alt="Apex" className="w-[140%] h-[140%] object-cover object-top" />
              </div>
              <div>
                <h1 className="text-white font-medium">Apex · The Roundtable</h1>
                <p className="text-purple-300/60 text-xs">High-Level Integrative Guide</p>
              </div>
            </div>
          </div>
          
          {totalContext > 0 && (
            <button 
              onClick={() => setShowContextInfo(!showContextInfo)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 text-sm hover:bg-purple-500/20 transition-colors"
            >
              <Info className="w-4 h-4" />
              {totalContext} source{totalContext !== 1 ? 's' : ''} loaded
            </button>
          )}
        </div>
      </header>

      {/* Context Info Banner */}
      {showContextInfo && totalContext > 0 && messages.length === 0 && (
        <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-purple-300 text-sm font-medium mb-2">
                  Materials you've brought to this Roundtable:
                </p>
                <div className="space-y-1">
                  {selectedConversations?.map(conv => (
                    <div key={conv.id} className="text-white/60 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>{conv.coachName}: {conv.title}</span>
                      <span className="text-white/30">({conv.messages.length} messages)</span>
                    </div>
                  ))}
                  {roundtableData?.importedText && (
                    <div className="text-white/60 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span>Imported text ({roundtableData.importedText.length} characters)</span>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowContextInfo(false)}
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/xbtIIkDcKxYigZDq.jpg" alt="Apex" className="w-[140%] h-[140%] object-cover object-top" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Welcome to the Roundtable
              </h2>
              <p className="text-white/60 max-w-md mx-auto mb-6">
                I'm Apex. I'm here to help you look across what has already unfolded — 
                not to replay, but to integrate.
              </p>
              {totalContext > 0 ? (
                <p className="text-purple-300/70 text-sm max-w-md mx-auto">
                  I can see the materials you've brought. What made you choose these particular pieces? 
                  What are you hoping to understand more clearly?
                </p>
              ) : (
                <p className="text-white/40 text-sm max-w-md mx-auto">
                  You haven't selected any conversations to bring. 
                  <button 
                    onClick={() => navigate("/reflection")}
                    className="text-purple-400 hover:text-purple-300 ml-1"
                  >
                    Go back to select materials.
                  </button>
                </p>
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
                    ? "bg-purple-500/20 border border-purple-500/30" 
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="text-white/90 leading-relaxed">
                  {message.role === "assistant" ? (
                    <Streamdown>{message.content}</Streamdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-purple-500/20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What would you like to explore?"
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${
                input.trim() && !isLoading
                  ? "bg-purple-500 text-white hover:bg-purple-400"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-center text-white/30 text-xs mt-3">
            Apex holds space for integration, not speed. Take your time.
          </p>
        </div>
      </div>
    </div>
  );
}
