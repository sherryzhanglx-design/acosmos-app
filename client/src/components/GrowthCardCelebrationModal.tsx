/**
 * Growth Card Celebration Modal
 * 
 * Displays a beautiful, celebratory modal when a growth card is generated.
 * Features:
 * - Full-screen card preview
 * - Download button
 * - View in gallery button
 * - Celebration animation
 */

import { X, Download, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

interface GrowthCardCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardImageUrl: string;
  cardId: number;
  guardian: string;
  cardTypeName: string;
}

export function GrowthCardCelebrationModal({
  isOpen,
  onClose,
  cardImageUrl,
  cardId,
  guardian,
  cardTypeName,
}: GrowthCardCelebrationModalProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleDownload = () => {
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = cardImageUrl;
    link.download = `growth-card-${guardian}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewGallery = () => {
    onClose();
    setLocation('/account/cards');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Celebration Header */}
        <div className="text-center mb-6 animate-in slide-in-from-top duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-100 font-medium">Growth Card Created!</span>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Your {cardTypeName} is Ready
          </h2>
          <p className="text-gray-300">
            A beautiful reminder of your conversation with {guardian}
          </p>
        </div>

        {/* Card Preview */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6 animate-in zoom-in duration-500 delay-100">
          <img
            src={cardImageUrl}
            alt={`${cardTypeName} from conversation with ${guardian}`}
            className="w-full h-auto"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-500 delay-200">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Download Card
          </button>
          <button
            onClick={handleViewGallery}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-200"
          >
            View in Gallery
          </button>
        </div>

        {/* Subtle hint */}
        <p className="text-center text-gray-400 text-sm mt-6 animate-in fade-in duration-500 delay-300">
          Your card has been saved to My Cards
        </p>
      </div>
    </div>
  );
}
