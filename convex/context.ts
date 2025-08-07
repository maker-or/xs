'use node';

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { v } from 'convex/values';
import { z } from 'zod';
import { api } from './_generated/api';
import { action } from './_generated/server';

export const StageSchema = z.object({
  title: z.string().min(2, 'Stage title is required'),
  purpose: z.string().min(2, 'Stage purpose is required'),
  include: z
    .array(z.string())
    .min(1, 'At least one topic/activity must be included'),
  outcome: z.string().min(2, 'Learning outcome is required'),
  discussion_prompt: z.string(),
});

export const CourseSchema = z.object({
  stages: z.array(StageSchema).min(2, 'A course must have at least 2 stages.'),
});
export const contextgather = action({
  args: {
    messages: v.string(), // Current message content
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('📝 Full args received:', JSON.stringify(args, null, 2));

    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const openRouterKey = process.env.OPENROUTER_API_KEY || '';

    if (!openRouterKey) {
      throw new Error(
        'OpenRouter API key is required. Please add your API key in settings.'
      );
    }

    // Validate API key format
    if (!openRouterKey.startsWith('sk-')) {
      throw new Error(
        "Invalid OpenRouter API key format. Key should start with 'sk-'"
      );
    }

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openRouterKey,
    });

    try {
      const result = await generateObject({
        model: openrouter('google/gemini-2.5-flash-lite'),
        system: `You are an expert AI curriculum designer.
        When a student provides a learning topic or question, you will instantly design a multi-stage educational plan. Each stage must correspond to a key phase in an effective learning sequence, such as:
        ->Prerequisites: Knowledge or skills the student should ideally have mastered before the main topic.
        ->Foundations/Basic Concepts: The essential building blocks and terminology that underpin the topic.
        ->Principles/Objectives: The main goals, guiding ideas, or key objectives for mastering the subject.
        ->Theoretical Foundation/Derivation: The theory, formal derivations, and mathematical framework beneath the topic.
        ->Implementation: Concrete steps, algorithms, or code/procedures to realize the theory in practice.
        ->Practical Application: Real-world uses, best practices, and application contexts.
        ->Specialization/Extensions: Further avenues for advanced study, ongoing research, or related fields.
        ->For each student query, decide what stages are needed for a logical and comprehensive learning journey, following (where appropriate) an effective order: Prerequisites → Foundations → Principles/Objectives → Theoretical Foundations/Derivations → Implementation → Practical Application → Specialization.
        ->If a Prerequisite stage is included, list what prior topics are needed and be explicit about knowledge assumed.
        make sure all the stages are connected they togther form one complete course
        ->The course can have multiple stages, in minum we need to have two stages
        -> Always resume relavent name as the stage title not like Prerequisites,Foundations


        For every output, return a stages array, where each object has all the following fields:
        ->title (string): Stage name (e.g., "Basic Concepts of Transformers").
        ->purpose (string): The rationale for including this stage—a brief explanation of how it fits into the overall learning path.
        ->include (array of strings): 3–7 bullet points listing key topics, skills, ideas, or activities.
        ->outcome (string): What a student will be able to do/understand after completing this stage.
        ->discussion_prompt (string, optional): Socratic or open-ended prompt for class/chatbot discussion.`,
        prompt: args.messages,
        schema: CourseSchema,
      });
      console.log('AI response created successfully');

      // Access the generated object directly
      const generatedResponse = result.object;
      const fullContent = generatedResponse.stages;

      console.log('Generated response:', generatedResponse);

      // Create a message
      if (fullContent) {
        const CourseId = await ctx.runMutation(api.course.createCourse, {
          prompt: args.messages,
          stages: fullContent,
        });
        return {
          CourseId,
        };
      }
    } catch (error) {
      console.error('AI generation error:', error);

      // Provide more detailed error information
      if (error instanceof Error) {
        throw new Error(`Chat completion failed: ${error.message}`);
      }
      throw new Error('Chat completion failed with unknown error');
    }
  },
});
