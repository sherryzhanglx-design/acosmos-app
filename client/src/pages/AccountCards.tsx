import { useState } from 'react';
import AccountLayout from "@/components/AccountLayout";
import { trpc } from "@/lib/trpc";
import { Sparkles, Calendar, Search, X, Download } from "lucide-react";

type CardTab = 'all' | 'growth' | 'metaphor';

export default function AccountCards() {
  const [activeTab, setActiveTab] = useState<CardTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuardian, setSelectedGuardian] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  // Fetch growth cards (from new growthCards table)
  const { data: growthCards = [], isLoading: loadingGrowth } = trpc.growthCards.listMine.useQuery(
    selectedGuardian ? { guardianSlug: selectedGuardian } : undefined
  );

  // Fetch metaphor cards (from cardHistory)
  const { data: metaphorCards = [], isLoading: loadingMetaphor } = trpc.cardHistory.list.useQuery(
    selectedGuardian ? { guide: selectedGuardian } : undefined
  );

  const isLoading = loadingGrowth || loadingMetaphor;

  // Filter cards based on active tab
  const displayCards = activeTab === 'growth' 
    ? growthCards 
    : activeTab === 'metaphor' 
    ? metaphorCards 
    : [...growthCards, ...metaphorCards];

  // Search filter (type-safe)
  const filteredCards = displayCards.filter(card => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Growth card properties
    if ('keyInsight' in card) {
      return (
        card.keyInsight?.toLowerCase().includes(query) ||
        card.topic?.toLowerCase().includes(query) ||
        card.guardian?.toLowerCase().includes(query)
      );
    }
    
    // Metaphor card properties
    if ('cardText' in card) {
      return (
        card.cardText?.toLowerCase().includes(query) ||
        card.guide?.toLowerCase().includes(query)
      );
    }
    
    return false;
  });

  const guardians = [
    { slug: '', name: 'All Guides' },
    { slug: 'Andy', name: 'Andy' },
    { slug: 'Anya', name: 'Anya' },
    { slug: 'Alma', name: 'Alma' },
    { slug: 'Axel', name: 'Axel' },
  ];

  const handleDownload = (imageUrl: string, cardName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${cardName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'all'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            All Cards ({growthCards.length + metaphorCards.length})
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'growth'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Growth Cards ({growthCards.length})
          </button>
          <button
            onClick={() => setActiveTab('metaphor')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'metaphor'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Metaphor Cards ({metaphorCards.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent"
            />
          </div>

          {/* Guide Filter */}
          <select
            value={selectedGuardian}
            onChange={(e) => setSelectedGuardian(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-amber-500/50 focus:border-transparent"
          >
            {guardians.map(g => (
              <option key={g.slug} value={g.slug} className="bg-slate-900">{g.name}</option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/60">Loading your cards...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCards.length === 0 && (
          <div className="glass-card p-12 rounded-xl border border-white/10 text-center">
            <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No cards yet
            </h3>
            <p className="text-white/60">
              Complete a conversation to generate your first growth card
            </p>
          </div>
        )}

        {/* Growth Cards Grid */}
        {!isLoading && filteredCards.length > 0 && (activeTab === 'all' || activeTab === 'growth') && growthCards.length > 0 && (
          <div>
            {activeTab === 'all' && <h3 className="text-xl font-semibold text-white mb-4">Growth Cards</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {growthCards.filter(card => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  card.keyInsight?.toLowerCase().includes(query) ||
                  card.topic?.toLowerCase().includes(query) ||
                  card.guardian?.toLowerCase().includes(query)
                );
              }).map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="glass-card p-0 rounded-xl border border-white/10 hover:border-amber-500/50 transition-all overflow-hidden group cursor-pointer"
                >
                  {/* Card Image */}
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

                  {/* Card Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-amber-400">
                        {card.cardTypeName}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(card.conversationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2 mb-2">
                      {card.keyInsight}
                    </p>
                    <p className="text-xs text-white/40">
                      with {card.guardian}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metaphor Cards Grid */}
        {!isLoading && filteredCards.length > 0 && (activeTab === 'all' || activeTab === 'metaphor') && metaphorCards.length > 0 && (
          <div className={activeTab === 'all' ? 'mt-8' : ''}>
            {activeTab === 'all' && <h3 className="text-xl font-semibold text-white mb-4">Metaphor Cards</h3>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {metaphorCards.filter(card => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  card.cardText?.toLowerCase().includes(query) ||
                  card.guide?.toLowerCase().includes(query)
                );
              }).map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="glass-card rounded-xl border border-white/10 hover:border-amber-500/50 transition-all overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={card.cardImageUrl}
                      alt={card.cardText}
                      className="w-full h-full object-cover"
                      loading="lazy"
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
          </div>
        )}

        {/* Card Detail Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto p-4">
              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Card Image */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">
                <img
                  src={selectedCard.imageUrl || selectedCard.cardImageUrl}
                  alt={selectedCard.cardTypeName || selectedCard.cardText}
                  className="w-full h-auto"
                />
              </div>

              {/* Download Button */}
              {(selectedCard.imageUrl || selectedCard.cardImageUrl) && (
                <div className="flex justify-center">
                  <button
                    onClick={() => handleDownload(
                      selectedCard.imageUrl || selectedCard.cardImageUrl,
                      selectedCard.cardTypeName || 'card'
                    )}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download Card
                  </button>
                </div>
              )}

              {/* Card Details */}
              {selectedCard.userNote && (
                <div className="mt-6 glass-card rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Your Note</h3>
                  <p className="text-white/80">{selectedCard.userNote}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
