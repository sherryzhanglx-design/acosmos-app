import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AccountLayout from "@/components/AccountLayout";
import { Search, MessageCircle, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AccountConversations() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuardian, setSelectedGuardian] = useState<string>("all");

  const { data: conversations } = trpc.conversations.listMine.useQuery();
  const { data: roles } = trpc.roles.list.useQuery();

  // Filter conversations
  const filteredConversations = conversations?.filter((conv) => {
    const matchesSearch =
      !searchQuery ||
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.summary?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGuardian =
      selectedGuardian === "all" ||
      conv.roleId === parseInt(selectedGuardian);

    return matchesSearch && matchesGuardian;
  });

  // Group by time periods
  const groupByTime = (convs: typeof conversations) => {
    if (!convs) return { today: [], yesterday: [], thisWeek: [], earlier: [] };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      today: convs.filter((c) => new Date(c.createdAt) >= today),
      yesterday: convs.filter(
        (c) => new Date(c.createdAt) >= yesterday && new Date(c.createdAt) < today
      ),
      thisWeek: convs.filter(
        (c) => new Date(c.createdAt) >= weekAgo && new Date(c.createdAt) < yesterday
      ),
      earlier: convs.filter((c) => new Date(c.createdAt) < weekAgo),
    };
  };

  const grouped = groupByTime(filteredConversations);

  const renderConversationGroup = (title: string, convs: typeof conversations) => {
    if (!convs || convs.length === 0) return null;

    return (
      <div key={title} className="mb-8">
        <h3 className="text-white/60 text-sm font-medium mb-3">{title}</h3>
        <div className="space-y-2">
          {convs.map((conv) => {
            const role = roles?.find((r) => r.id === conv.roleId);
            return (
              <button
                key={conv.id}
                onClick={() => navigate(`/conversation/${conv.id}`)}
                className="w-full p-4 rounded-lg glass-card border border-white/10 hover:border-amber-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-white/50 flex-shrink-0" />
                      <h4 className="text-white font-medium truncate group-hover:text-amber-400 transition-colors">
                        {conv.title || "Untitled Conversation"}
                      </h4>
                    </div>
                    {conv.summary && (
                      <p className="text-white/50 text-sm line-clamp-2 mt-1">
                        {conv.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span>with {role?.name || "Guardian"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Conversations</h2>
          <p className="text-white/60">
            Review your journey through past dialogues
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <select
            value={selectedGuardian}
            onChange={(e) => setSelectedGuardian(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All Guides</option>
            {roles?.map((role) => (
              <option key={role.id} value={role.id.toString()}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Conversations List */}
        <div>
          {filteredConversations && filteredConversations.length > 0 ? (
            <>
              {renderConversationGroup("Today", grouped.today)}
              {renderConversationGroup("Yesterday", grouped.yesterday)}
              {renderConversationGroup("This Week", grouped.thisWeek)}
              {renderConversationGroup("Earlier", grouped.earlier)}
            </>
          ) : (
            <div className="text-center py-16 glass-card rounded-xl border border-white/10">
              <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">
                {searchQuery || selectedGuardian !== "all"
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
              <p className="text-white/40 text-sm">
                {searchQuery || selectedGuardian !== "all"
                  ? "Try adjusting your search or filter"
                  : "Start a conversation with one of your Guides"}
              </p>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
