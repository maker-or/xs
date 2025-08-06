import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';

// Resumable chat streams
export const createResumableStream = internalMutation({
  args: {
    chatId: v.id('chats'),
    messageId: v.id('messages'),
    model: v.string(),
    messages: v.array(
      v.object({
        role: v.union(
          v.literal('user'),
          v.literal('assistant'),
          v.literal('system')
        ),
        content: v.string(),
      })
    ),
    checkpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();

    if (!userId) throw new Error('Not authenticated');
    const id = userId.subject;

    const streamId = await ctx.db.insert('resumableStreams', {
      chatId: args.chatId,
      messageId: args.messageId,
      userId: id,
      model: args.model,
      messages: args.messages,
      checkpoint: args.checkpoint || '',
      isActive: true,
      isPaused: false,
      progress: 0,
      totalTokens: 0,
      createdAt: Date.now(),
      lastResumed: Date.now(),
    });

    return streamId;
  },
});

export const pauseStream = mutation({
  args: { streamId: v.id('resumableStreams') },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const stream = await ctx.db.get(args.streamId);
    if (!stream || stream.userId !== userId.subject) {
      throw new Error('Stream not found or unauthorized');
    }

    await ctx.db.patch(args.streamId, {
      isPaused: true,
      lastPaused: Date.now(),
    });
  },
});

export const resumeStream = mutation({
  args: {
    streamId: v.id('resumableStreams'),
    fromCheckpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const stream = await ctx.db.get(args.streamId);
    if (!stream || stream.userId !== userId.subject) {
      throw new Error('Stream not found or unauthorized');
    }

    await ctx.db.patch(args.streamId, {
      isPaused: false,
      isActive: true,
      lastResumed: Date.now(),
      checkpoint: args.fromCheckpoint || stream.checkpoint,
    });

    return stream;
  },
});

export const updateStreamProgress = internalMutation({
  args: {
    streamId: v.id('resumableStreams'),
    progress: v.number(),
    checkpoint: v.string(),
    tokens: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, {
      progress: args.progress,
      checkpoint: args.checkpoint,
      totalTokens: args.tokens,
      lastUpdated: Date.now(),
    });
  },
});

export const getResumableStream = query({
  args: { streamId: v.id('resumableStreams') },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) return null;

    const stream = await ctx.db.get(args.streamId);
    if (!stream || stream.userId !== userId.subject) {
      return null;
    }

    return stream;
  },
});

export const getActiveStreams = query({
  args: { chatId: v.id('chats') },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) return [];

    const streams = await ctx.db
      .query('resumableStreams')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .filter((q) => q.eq(q.field('userId'), userId.subject))
      .filter((q) => q.eq(q.field('isActive'), true))
      .order('desc')
      .collect();

    return streams;
  },
});

export const completeStream = mutation({
  args: { streamId: v.id('resumableStreams') },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const stream = await ctx.db.get(args.streamId);
    if (!stream || stream.userId !== userId.subject) {
      throw new Error('Stream not found or unauthorized');
    }

    await ctx.db.patch(args.streamId, {
      isActive: false,
      isPaused: false,
      progress: 100,
      completedAt: Date.now(),
    });
  },
});

export const completeStreamInternal = internalMutation({
  args: { streamId: v.id('resumableStreams') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, {
      isActive: false,
      isPaused: false,
      progress: 100,
      completedAt: Date.now(),
    });
  },
});
