import { v } from 'convex/values';
import { api } from './_generated/api';
import { mutation, query } from './_generated/server';

export const listCourse = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;

    const courses = await ctx.db
      .query('Course')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();

    return courses;
  },
});

export const createCourse = mutation({
  args: {
    prompt: v.string(),
    stages: v.array(
      v.object({
        title: v.string(),
        purpose: v.string(),
        include: v.array(v.string()),
        outcome: v.string(),
        discussion_prompt: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;

    const now = Date.now();
    const courseId = await ctx.db.insert('Course', {
      prompt: args.prompt,
      userId,
      createdAt: now,
      stages: args.stages,
    });
    return courseId;
  },
});

export const searchChats = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    const courses = await ctx.db
      .query('Course')
      .withSearchIndex('search_title', (q) =>
        q.search('prompt', args.query).eq('userId', userId)
      )
      .take(20);

    return courses;
  },
});

export const getAllCourses = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    const courses = await ctx.db
      .query('Course')
      .order('desc')
      .collect();

    // Manual pagination since Convex doesn't have built-in skip/limit
    const paginatedCourses = courses.slice(offset, offset + limit);

    return {
      courses: paginatedCourses,
      total: courses.length,
      hasMore: offset + limit < courses.length
    };
  },
});

export const searchAllCourses = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const limit = args.limit ?? 20;

    const courses = await ctx.db
      .query('Course')
      .withSearchIndex('search_title', (q) =>
        q.search('prompt', args.query)
      )
      .take(limit);

    return courses;
  },
});

export const getPublicCourse = query({
  args: { courseId: v.id('Course') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { error: 'Authentication required', course: null };
    }

    const course = await ctx.db.get(args.courseId);

    if (!course) {
      return { error: 'Course not found', course: null };
    }

    // No ownership check - allow viewing any public course
    return { error: null, course };
  },
});

export const getCourse = query({
  args: { courseId: v.id('Course') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log('getCourse called without authentication');
      return { error: 'Authentication required', course: null };
    }
    const userId = identity.subject;

    const course = await ctx.db.get(args.courseId);

    if (!course) {
      return { error: 'Course not found', course: null };
    }

    // Check ownership - user must own the course
    if (course.userId !== userId) {
      return {
        error: 'You are not authorized to view this course',
        course: null,
      };
    }

    return { error: null, course };
  },
});
