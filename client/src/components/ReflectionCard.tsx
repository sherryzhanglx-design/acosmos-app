import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, MessageCircle } from "lucide-react";

// Card data structure
export interface ReflectionCardData {
  id: string;
  imageUrl: string;
  text: string;
  tags: string[];
}

// Anya's reflection card deck (7 cards)
const REFLECTION_CARDS: ReflectionCardData[] = [
  {
    id: "card-001",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/bAINhTkhxWpwXEFC.png",
    text: "We spend much of our lives trying to please others, and much of the rest carrying the weight of their worries. You are allowed to step out of the role. You have stayed long enough.",
    tags: ["boundaries", "self-care", "letting-go"],
  },
  {
    id: "card-002",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/oXasCkvdUOnJSULh.png",
    text: "Some see only weeds.\nOthers see the beginning of a wish.",
    tags: ["perspective", "awareness", "calm"],
  },
  {
    id: "card-003",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/DMtvptxHOIlqpSet.png",
    text: "The cave you are afraid to enter\nholds the light you have been searching for.",
    tags: ["fear", "inner-light", "reflection"],
  },
  {
    id: "card-004",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/VrTRFQFgaJcpddHB.png",
    text: "Here is a subtle truth:\nwhat you love reveals who you are.",
    tags: ["identity", "values", "self-awareness"],
  },
  {
    id: "card-005",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/hqCLNqEcClkycBDB.png",
    text: "If you long for healing,\nbegin by allowing yourself to be unwell.",
    tags: ["healing", "acceptance", "self-compassion"],
  },
  {
    id: "card-006",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/cFFsQbsdVyLZAiLY.png",
    text: "When you release the \"I am\" you cling to,\nyou become who you were always capable of being.",
    tags: ["identity", "letting-go", "becoming"],
  },
  {
    id: "card-007",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/ADJvRrCuJiVyQUzA.png",
    text: "If everything around you feels dark,\nlook a little closer—\nthere may be light in you.",
    tags: ["hope", "inner-light", "grounding"],
  },
];

interface ReflectionCardProps {
  onReflect: (card: ReflectionCardData) => void;
  onClose: () => void;
}

export function ReflectionCardDrawer({ onReflect, onClose }: ReflectionCardProps) {
  const [currentCard, setCurrentCard] = useState<ReflectionCardData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const drawCard = () => {
    setIsDrawing(true);
    // Simulate a brief delay for the "drawing" effect
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * REFLECTION_CARDS.length);
      setCurrentCard(REFLECTION_CARDS[randomIndex]);
      setIsDrawing(false);
    }, 500);
  };

  const handleReflect = () => {
    if (currentCard) {
      onReflect(currentCard);
    }
  };

  const handleDrawAnother = () => {
    setCurrentCard(null);
    drawCard();
  };

  // Initial state - show draw button
  if (!currentCard && !isDrawing) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10">
        <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Reflection Cards</h3>
        <p className="text-white/60 text-sm text-center mb-4 max-w-xs">
          Draw a card to pause and reflect. Let the imagery speak to you.
        </p>
        <Button
          onClick={drawCard}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Draw a reflection card
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          className="mt-2 text-white/50 hover:text-white/80"
        >
          Maybe later
        </Button>
      </div>
    );
  }

  // Drawing animation
  if (isDrawing) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10">
        <div className="animate-pulse">
          <Sparkles className="w-12 h-12 text-amber-400" />
        </div>
        <p className="text-white/60 mt-4">Drawing your card...</p>
      </div>
    );
  }

  // Card display
  return (
    <div className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 max-w-sm mx-auto">
      {/* Card Image */}
      <div className="relative w-full aspect-[3/5] rounded-xl overflow-hidden mb-4 shadow-2xl">
        <img
          src={currentCard?.imageUrl}
          alt="Reflection card"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Text */}
      <p className="text-white/90 text-center text-sm italic px-2 mb-4 leading-relaxed">
        "{currentCard?.text}"
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col w-full gap-2">
        <Button
          onClick={handleReflect}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Reflect with Anya
        </Button>
        <Button
          variant="outline"
          onClick={handleDrawAnother}
          className="w-full border-white/20 text-white/80 hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Draw another
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-white/50 hover:text-white/80"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

// Button to trigger the card drawer
interface DrawCardButtonProps {
  onClick: () => void;
}

export function DrawCardButton({ onClick }: DrawCardButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Draw a reflection card
    </Button>
  );
}
