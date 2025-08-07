import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createstage = mutation({
  args: {
    title: v.string(),
    courseId: v.id('Course'),
    slides: v.array(
      v.object({
        name: v.string(),
        title: v.string(),
        subTitles: v.optional(v.string()),
        svg: v.optional(v.string()),
        content: v.string(),
        links: v.optional(v.array(v.string())),
        youtubeSearchText: v.optional(v.string()),
        code: v.optional(
          v.object({
            language: v.string(),
            content: v.string(),
          })
        ),
        tables: v.optional(v.string()),
        bulletPoints: v.optional(v.array(v.string())),
        flashcardData: v.optional(
          v.array(
            v.object({
              question: v.string(),
              answer: v.string(),
            })
          )
        ),
        testQuestions: v.optional(
          v.array(
            v.object({
              question: v.string(),
              options: v.array(v.string()),
              answer: v.string(),
            })
          )
        ),
        type: v.string(), // If you want enum: v.union([v.literal("markdown"), v.literal("code"), ...])
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;

    const now = Date.now();
    const stageId = await ctx.db.insert('Stage', {
      title: args.title,
      userId,
      createdAt: now,
      slides: args.slides,
      courseId: args.courseId,
    });
    return stageId;
  },
});

export const getStage = query({
  args: {
    courseId: v.id('Course'),
    stageId: v.id('Stage'),
  },
  handler: async (ctx, args) => {
    // Ensure the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;

    // Fetch the course and check user ownership
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return { error: 'Course not found', stage: null };
    }
    if (course.userId !== userId) {
      return { error: 'Unauthorized access', stage: null };
    }

    // Fetch the stage for this course and stageId
    const stage = await ctx.db.get(args.stageId);
    if (!stage || String(stage.courseId) !== String(args.courseId)) {
      return {
        error: 'Stage not found or not part of this course',
        stage: null,
      };
    }

    return { error: null, stage };
  },
});

export const getstageIds = query({
  args: { courseId: v.id('Course') },
  handler: async (ctx, args) => {
    // Auth check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;

    // Get the course and check ownership
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return { error: 'Course not found', stageIds: [] };
    }
    if (course.userId !== userId) {
      return { error: 'Unauthorized access', stageIds: [] };
    }

    // Get all stages with this courseId, ordered by creation time
    const stages = await ctx.db
      .query('Stage')
      .withIndex('by_course', (q) => q.eq('courseId', args.courseId))
      .order('asc')
      .collect();

    // Extract the `_id` from each stage document
    const stageIds = stages.map((stage) => stage._id);

    return { error: null, stageIds };
  },
});
