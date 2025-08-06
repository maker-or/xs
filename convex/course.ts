import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const listCourse = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const courses = await ctx.db
      .query("Course")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const now = Date.now();
    const courseId = await ctx.db.insert("Course", {
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
      .query("Course")
      .withSearchIndex("search_title", (q) =>
        q.search("prompt", args.query).eq("userId", userId),
      )
      .take(20);

    return courses;
  },
});

export const getCourse = query({
  args: { courseId: v.id("Course") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("getCourse called without authentication");
      return { error: "Authentication required", course: null };
    }
    const userId = identity.subject;

    const course = await ctx.db.get(args.courseId);

    if (!course) {
      return { error: "Course not found", course: null };
    }

    // Check ownership - user must own the course
    if (course.userId !== userId) {
      return { error: "You are not authorized to view this course", course: null };
    }

    return { error: null, course };
  },
});
