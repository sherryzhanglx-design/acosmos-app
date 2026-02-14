/**
 * Growth Card Renderer
 * 
 * Generates beautiful, shareable Growth Cards using server-side Canvas rendering.
 * Each card includes:
 * - Guardian-specific gradient background
 * - Key insight text
 * - Optional "What you saw" and "One step to try" sections
 * - Keywords/tags
 * - Date and Guardian name
 */

import { createCanvas, GlobalFonts, SKRSContext2D } from '@napi-rs/canvas';
import { CardBackground, getBackgroundById } from './cardBackgrounds';

export interface CardRenderOptions {
  // Content
  guardian: string; // e.g., "Andy", "Anya"
  cardTypeName: string; // e.g., "Growth Card", "静心卡"
  keyInsight: string;
  whatYouSaw?: string;
  actionCommitted?: string;
  keywords?: string[];
  date: string; // e.g., "2026.2.15"
  
  // Design
  backgroundId: string;
  width?: number; // Default: 1200px
  height?: number; // Default: 1600px
}

/**
 * Render a gradient background on canvas
 */
function renderGradientBackground(
  ctx: SKRSContext2D,
  width: number,
  height: number,
  background: CardBackground
) {
  let gradient;
  
  if (background.gradient.type === 'linear') {
    const angle = background.gradient.angle || 0;
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate gradient line endpoints based on angle
    const x0 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y0 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x1 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 + (Math.sin(angleRad) * height) / 2;
    
    gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  } else {
    // Radial gradient
    const centerX = (background.gradient.centerX || 0.5) * width;
    const centerY = (background.gradient.centerY || 0.5) * height;
    const radius = Math.max(width, height);
    
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  }
  
  // Add color stops
  const colors = background.gradient.colors;
  colors.forEach((color, index) => {
    const stop = index / (colors.length - 1);
    gradient.addColorStop(stop, color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Wrap text to fit within a given width
 */
function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Render Growth Card to PNG buffer
 */
export async function renderGrowthCard(options: CardRenderOptions): Promise<Buffer> {
  const width = options.width || 1200;
  const height = options.height || 1600;
  
  // Get background template
  const background = getBackgroundById(options.backgroundId);
  if (!background) {
    throw new Error(`Background not found: ${options.backgroundId}`);
  }
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Render background
  renderGradientBackground(ctx, width, height, background);
  
  // Set text rendering properties
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const padding = 80;
  const contentWidth = width - padding * 2;
  let y = padding;
  
  // 1. Card Type Name (top-left, small)
  ctx.fillStyle = background.accentColor;
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(`[${options.cardTypeName}]`, padding, y);
  y += 80;
  
  // 2. Key Insight (main content, large and prominent)
  ctx.fillStyle = background.textColor;
  ctx.font = 'bold 56px sans-serif';
  const insightLabel = 'Today\'s insight: ';
  ctx.fillText(insightLabel, padding, y);
  y += 80;
  
  ctx.font = '48px sans-serif';
  const insightLines = wrapText(ctx, options.keyInsight, contentWidth);
  for (const line of insightLines) {
    ctx.fillText(line, padding, y);
    y += 70;
  }
  y += 40;
  
  // 3. What You Saw (optional, for Andy)
  if (options.whatYouSaw) {
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('What you saw: ', padding, y);
    y += 60;
    
    ctx.font = '36px sans-serif';
    const sawLines = wrapText(ctx, options.whatYouSaw, contentWidth);
    for (const line of sawLines) {
      ctx.fillText(line, padding, y);
      y += 55;
    }
    y += 40;
  }
  
  // 4. One Step to Try (action item)
  if (options.actionCommitted) {
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('One step to try: ', padding, y);
    y += 60;
    
    ctx.font = '36px sans-serif';
    const actionLines = wrapText(ctx, options.actionCommitted, contentWidth);
    for (const line of actionLines) {
      ctx.fillText(line, padding, y);
      y += 55;
    }
    y += 40;
  }
  
  // 5. Keywords (if available)
  if (options.keywords && options.keywords.length > 0) {
    ctx.font = 'bold 36px sans-serif';
    const keywordsText = `Keywords: ${options.keywords.join(' · ')}`;
    ctx.fillText(keywordsText, padding, y);
    y += 80;
  }
  
  // 6. Footer: Date and Guardian name (bottom)
  const footerY = height - padding - 100;
  ctx.font = '32px sans-serif';
  ctx.fillText(options.date, padding, footerY);
  ctx.fillText(`Conversation with ${options.guardian}`, padding, footerY + 50);
  
  // Render to PNG buffer
  return canvas.toBuffer('image/png');
}

/**
 * Render Growth Card and convert to WebP for storage efficiency
 * (WebP compression reduces file size by ~70% compared to PNG)
 */
export async function renderGrowthCardWebP(options: CardRenderOptions): Promise<Buffer> {
  // Note: @napi-rs/canvas doesn't support WebP encoding directly
  // For now, we'll use PNG. In production, you can add sharp package for WebP conversion:
  // const pngBuffer = await renderGrowthCard(options);
  // const webpBuffer = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer();
  // return webpBuffer;
  
  return renderGrowthCard(options);
}
