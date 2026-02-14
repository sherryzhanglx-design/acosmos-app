/**
 * Growth Cards tRPC Router
 * 
 * Handles:
 * - Generating growth cards from session summaries
 * - Listing user's growth cards
 * - Viewing individual cards
 * - Adding notes to cards
 */

import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { 
  createGrowthCard, 
  getUserGrowthCards, 
  getGrowthCardById,
  getGrowthCardByConversationId,
  updateGrowthCard,
  getUserGrowthCardCount 
} from './db';
import { renderGrowthCard } from './cardRenderer';
import { getBackgroundForGuardian } from './cardBackgrounds';
import { saveGrowthCardImage } from './s3Storage';

/**
 * Guardian slug mapping
 */
const GUARDIAN_SLUG_MAP: Record<string, string> = {
  'Andy': 'career',
  'Anya': 'anxiety',
  'Alma': 'relationships',
  'Axel': 'transformation',
};

/**
 * Card type name mapping
 */
const CARD_TYPE_MAP: Record<string, string> = {
  'Andy': 'Growth Card',
  'Anya': '静心卡',
  'Alma': '关系卡',
  'Axel': '认知卡',
};

export const growthCardsRouter = router({
  /**
   * Generate a growth card from a session summary
   */
  generate: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      sessionSummaryId: z.number(),
      guardian: z.string(),
      topic: z.string().optional(),
      keyInsight: z.string(),
      whatYouSaw: z.string().optional(),
      actionCommitted: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      emotionalState: z.string().optional(),
      conversationDate: z.string(), // ISO date string
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if card already exists for this conversation
      const existing = await getGrowthCardByConversationId(input.conversationId, ctx.user.id);
      if (existing) {
        return { id: existing.id, imageUrl: existing.imageUrl };
      }
      
      // Get guardian slug and card type name
      const guardianSlug = GUARDIAN_SLUG_MAP[input.guardian] || 'career';
      const cardTypeName = CARD_TYPE_MAP[input.guardian] || 'Growth Card';
      
      // Select background
      const background = getBackgroundForGuardian(guardianSlug);
      
      // Format date
      const date = new Date(input.conversationDate);
      const dateStr = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
      
      // Render card
      const imageBuffer = await renderGrowthCard({
        guardian: input.guardian,
        cardTypeName,
        keyInsight: input.keyInsight,
        whatYouSaw: input.whatYouSaw,
        actionCommitted: input.actionCommitted,
        keywords: input.keywords,
        date: dateStr,
        backgroundId: background.id,
      });
      
      // Save image (automatically uses S3 if configured, otherwise local storage)
      const imageUrl = await saveGrowthCardImage(
        imageBuffer,
        ctx.user.id,
        input.conversationId,
        'png'
      );
      
      // Save to database
      const cardId = await createGrowthCard({
        userId: ctx.user.id,
        conversationId: input.conversationId,
        sessionSummaryId: input.sessionSummaryId,
        guardian: input.guardian,
        guardianSlug,
        cardTypeName,
        topic: input.topic,
        keyInsight: input.keyInsight,
        whatYouSaw: input.whatYouSaw,
        actionCommitted: input.actionCommitted,
        keywords: input.keywords,
        emotionalState: input.emotionalState,
        backgroundId: background.id,
        imageUrl,
        imageFormat: 'png',
        conversationDate: new Date(input.conversationDate),
      });
      
      return { id: cardId, imageUrl };
    }),
  
  /**
   * List all growth cards for the current user
   */
  listMine: protectedProcedure
    .input(z.object({
      guardianSlug: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return getUserGrowthCards(ctx.user.id, input?.guardianSlug);
    }),
  
  /**
   * Get a single growth card by ID
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return getGrowthCardById(input.id, ctx.user.id);
    }),
  
  /**
   * Get growth card by conversation ID
   */
  getByConversationId: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return getGrowthCardByConversationId(input.conversationId, ctx.user.id);
    }),
  
  /**
   * Add a note to a growth card
   */
  addNote: protectedProcedure
    .input(z.object({
      id: z.number(),
      note: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updateGrowthCard(input.id, ctx.user.id, { userNote: input.note });
      return { success: true };
    }),
  
  /**
   * Get total count of growth cards (for dashboard)
   */
  count: protectedProcedure.query(async ({ ctx }) => {
    return getUserGrowthCardCount(ctx.user.id);
  }),
});
