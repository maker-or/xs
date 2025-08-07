import { v } from 'convex/values';
// import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Chat branching functionality
export const createBranch = mutation({
  args: {
    chatId: v.id('chats'),
    fromMessageId: v.id('messages'),
    branchName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId.subject) {
      throw new Error('Unauthorized');
    }

    const fromMessage = await ctx.db.get(args.fromMessageId);
    if (!fromMessage || fromMessage.chatId !== args.chatId) {
      throw new Error('Message not found');
    }

    // Deactivate all other branches for this chat first
    const allBranches = await ctx.db
      .query('branches')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .collect();

    for (const branch of allBranches) {
      await ctx.db.patch(branch._id, { isActive: false });
    }

    // Create branch record
    const branchId = await ctx.db.insert('branches', {
      chatId: args.chatId,
      fromMessageId: args.fromMessageId,
      name: args.branchName || `Branch ${Date.now()}`,
      createdAt: Date.now(),
      isActive: true,
    });

    return branchId;
  },
});

export const getBranches = query({
  args: { chatId: v.id('chats') },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || (chat.userId !== userId.subject && !chat.isShared)) {
      return [];
    }

    const branches = await ctx.db
      .query('branches')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .order('desc')
      .collect();

    return branches;
  },
});

export const switchToBranch = mutation({
  args: {
    branchId: v.optional(v.id('branches')),
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId.subject) {
      throw new Error('Unauthorized');
    }

    // Deactivate all branches for this chat
    const allBranches = await ctx.db
      .query('branches')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .collect();

    for (const branch of allBranches) {
      await ctx.db.patch(branch._id, { isActive: false });
    }

    // If switching to a specific branch, activate it
    if (args.branchId) {
      const targetBranch = await ctx.db.get(args.branchId);
      if (!targetBranch) throw new Error('Branch not found');

      await ctx.db.patch(args.branchId, { isActive: true });
      return targetBranch;
    }

    // Switching to main thread (no active branch)
    return;
  },
});

export const getActiveBranch = query({
  args: { chatId: v.id('chats') },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) return null;

    const chat = await ctx.db.get(args.chatId);
    if (!chat || (chat.userId !== userId.subject && !chat.isShared)) {
      return null;
    }

    const activeBranch = await ctx.db
      .query('branches')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    return activeBranch;
  },
});

export const getBranchMessages = query({
  args: {
    chatId: v.id('chats'),
    branchId: v.optional(v.id('branches')),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || (chat.userId !== userId.subject && !chat.isShared)) {
      return [];
    }

    if (!args.branchId) {
      // Return main thread messages (no branchId)
      return await ctx.db
        .query('messages')
        .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
        .filter((q) => q.eq(q.field('isActive'), true))
        .filter((q) => q.eq(q.field('branchId'), undefined))
        .order('asc')
        .collect();
    }

    const branch = await ctx.db.get(args.branchId);
    if (!branch) return [];

    // Get messages up to the branch point (from main thread)
    const branchPoint = await ctx.db.get(branch.fromMessageId);
    if (!branchPoint) return [];

    const beforeBranchMessages = await ctx.db
      .query('messages')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .filter((q) => q.eq(q.field('branchId'), undefined))
      .filter((q) => q.lte(q.field('createdAt'), branchPoint.createdAt))
      .order('asc')
      .collect();

    // Get messages specific to this branch
    const branchMessages = await ctx.db
      .query('messages')
      .withIndex('by_branch', (q) => q.eq('branchId', args.branchId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .order('asc')
      .collect();

    return [...beforeBranchMessages, ...branchMessages];
  },
});

export const chatHasBranches = query({
  args: { chatId: v.id('chats') },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) return false;

    const chat = await ctx.db.get(args.chatId);
    if (!chat || (chat.userId !== userId.subject && !chat.isShared)) {
      return false;
    }

    const branches = await ctx.db
      .query('branches')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .first();

    return !!branches;
  },
});
