/**
 * Card Background Templates for Growth Cards
 * 
 * Each background is defined as a gradient configuration that can be rendered
 * on server-side Canvas. Backgrounds are designed to be:
 * - Visually distinct but cohesive
 * - Premium and aesthetic
 * - Text-readable (sufficient contrast)
 * - Guardian-specific (color-coded)
 */

export interface CardBackground {
  id: string;
  name: string;
  guardianSlug?: string; // Optional: specific to a guardian
  gradient: {
    type: 'linear' | 'radial';
    colors: string[]; // Array of color stops
    angle?: number; // For linear gradients (degrees)
    centerX?: number; // For radial gradients (0-1)
    centerY?: number; // For radial gradients (0-1)
  };
  textColor: string; // Primary text color for readability
  accentColor: string; // Accent color for highlights
}

/**
 * Card background templates
 * Each Guardian has 2-3 background variations
 */
export const CARD_BACKGROUNDS: CardBackground[] = [
  // Andy (Career) - Warm, structured, clarity-focused
  {
    id: 'andy-clarity',
    name: 'Clarity',
    guardianSlug: 'career',
    gradient: {
      type: 'linear',
      colors: ['#1e3a8a', '#3b82f6', '#60a5fa'], // Deep blue to bright blue
      angle: 135,
    },
    textColor: '#ffffff',
    accentColor: '#fbbf24',
  },
  {
    id: 'andy-structure',
    name: 'Structure',
    guardianSlug: 'career',
    gradient: {
      type: 'linear',
      colors: ['#065f46', '#10b981', '#34d399'], // Deep green to bright green
      angle: 45,
    },
    textColor: '#ffffff',
    accentColor: '#fbbf24',
  },

  // Anya (Anxiety) - Calm, grounding, soothing
  {
    id: 'anya-grounding',
    name: 'Grounding',
    guardianSlug: 'anxiety',
    gradient: {
      type: 'linear',
      colors: ['#4c1d95', '#7c3aed', '#a78bfa'], // Deep purple to lavender
      angle: 90,
    },
    textColor: '#ffffff',
    accentColor: '#fcd34d',
  },
  {
    id: 'anya-stillness',
    name: 'Stillness',
    guardianSlug: 'anxiety',
    gradient: {
      type: 'radial',
      colors: ['#1e293b', '#475569', '#64748b'], // Deep slate to light slate
      centerX: 0.5,
      centerY: 0.3,
    },
    textColor: '#ffffff',
    accentColor: '#a78bfa',
  },

  // Alma (Relationships) - Warm, intimate, heart-centered
  {
    id: 'alma-intimacy',
    name: 'Intimacy',
    guardianSlug: 'relationships',
    gradient: {
      type: 'linear',
      colors: ['#9f1239', '#e11d48', '#fb7185'], // Deep rose to pink
      angle: 120,
    },
    textColor: '#ffffff',
    accentColor: '#fde047',
  },
  {
    id: 'alma-connection',
    name: 'Connection',
    guardianSlug: 'relationships',
    gradient: {
      type: 'linear',
      colors: ['#7c2d12', '#ea580c', '#fb923c'], // Deep orange to bright orange
      angle: 60,
    },
    textColor: '#ffffff',
    accentColor: '#fef3c7',
  },

  // Axel (Transformation) - Deep, mysterious, introspective
  {
    id: 'axel-transformation',
    name: 'Transformation',
    guardianSlug: 'transformation',
    gradient: {
      type: 'radial',
      colors: ['#0f172a', '#1e293b', '#334155'], // Deep navy to slate
      centerX: 0.3,
      centerY: 0.7,
    },
    textColor: '#ffffff',
    accentColor: '#818cf8',
  },
  {
    id: 'axel-mirror',
    name: 'Mirror',
    guardianSlug: 'transformation',
    gradient: {
      type: 'linear',
      colors: ['#312e81', '#4f46e5', '#6366f1'], // Deep indigo to bright indigo
      angle: 180,
    },
    textColor: '#ffffff',
    accentColor: '#fbbf24',
  },

  // Generic/Fallback backgrounds (for future guardians or mixed sessions)
  {
    id: 'cosmic-night',
    name: 'Cosmic Night',
    gradient: {
      type: 'radial',
      colors: ['#0c4a6e', '#0369a1', '#0284c7'], // Deep cyan to bright cyan
      centerX: 0.5,
      centerY: 0.5,
    },
    textColor: '#ffffff',
    accentColor: '#fde047',
  },
  {
    id: 'starlight',
    name: 'Starlight',
    gradient: {
      type: 'linear',
      colors: ['#1e1b4b', '#3730a3', '#4f46e5'], // Deep indigo to bright indigo
      angle: 45,
    },
    textColor: '#ffffff',
    accentColor: '#fbbf24',
  },
];

/**
 * Get a random background for a specific guardian
 */
export function getBackgroundForGuardian(guardianSlug: string): CardBackground {
  const guardianBackgrounds = CARD_BACKGROUNDS.filter(
    bg => bg.guardianSlug === guardianSlug
  );
  
  if (guardianBackgrounds.length > 0) {
    // Randomly select one of the guardian-specific backgrounds
    return guardianBackgrounds[Math.floor(Math.random() * guardianBackgrounds.length)];
  }
  
  // Fallback to generic backgrounds
  const genericBackgrounds = CARD_BACKGROUNDS.filter(bg => !bg.guardianSlug);
  return genericBackgrounds[Math.floor(Math.random() * genericBackgrounds.length)];
}

/**
 * Get background by ID
 */
export function getBackgroundById(id: string): CardBackground | undefined {
  return CARD_BACKGROUNDS.find(bg => bg.id === id);
}
