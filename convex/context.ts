'use node';

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { v } from 'convex/values';
import { z } from 'zod';
import { api } from './_generated/api';
import { action } from './_generated/server';
import { PostHog } from 'posthog-node';
import { withTracing } from '@posthog/ai';
import crypto from 'node:crypto'; // ensure available in your runtime

export const StageSchema = z.object({
  title: z.string().min(2, 'Stage title is required'),
  purpose: z.string().min(2, 'Stage purpose is required'),
  include: z.array(z.string()).min(1, 'At least one topic/activity must be included'),
  outcome: z.string().min(2, 'Learning outcome is required'),
  discussion_prompt: z.string(),
});

export const CourseSchema = z.object({
  stages: z.array(StageSchema).min(2, 'A course must have at least 2 stages.'),
});

export const contextgather = action({
  args: {
    messages: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error('Not authenticated');

    const userId = userIdentity.subject;
    const openRouterKey = process.env.OPENROUTER_API_KEY || '';
    if (!openRouterKey) {
      throw new Error('OpenRouter API key is required. Please add your API key in settings.');
    }
    if (!openRouterKey.startsWith('sk-')) {
      throw new Error("Invalid OpenRouter API key format. Key should start with 'sk-'");
    }

    // Initialize PostHog for this request
    const phClient = new PostHog(process.env.POSTHOG_KEY!, {
      host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
    });

    // Generate a run_id to correlate with the later agent pipeline
    const runId = crypto.randomUUID();

    // OpenRouter client
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openRouterKey,
    });

    // Traced model for LLM observability
    const tracedModel = withTracing(openrouter('google/gemini-2.5-flash-lite'), phClient, {
      posthogDistinctId: userId,
      posthogProperties: {
        run_id: runId,
        phase: 'contextgather',
        source: 'sphereai-agent',
      },
      // redactInput: true,
      // redactOutput: true,
    });

    // Mark run start for the context-gathering phase
    phClient.capture({
      distinctId: userId,
      event: '$ai_run_start',
      properties: {
        run_id: runId,
        phase: 'contextgather',
        prompt_length: args.messages?.length ?? 0,
      },
    });

    try {
      const result = await generateObject({
        model: tracedModel, // observed generation
        system: `You are an expert AI curriculum designer...`,
        prompt: args.messages,
        schema: CourseSchema,
      });

      const generatedResponse = result.object;
      const stages = generatedResponse?.stages;

      if (!stages || !Array.isArray(stages) || stages.length < 2) {
        // Emit validation failure for visibility
        phClient.capture({
          distinctId: userId,
          event: '$ai_context_validation_error',
          properties: {
            run_id: runId,
            phase: 'contextgather',
            reason: 'Missing or insufficient stages',
          },
        });
        throw new Error('Generated syllabus is invalid: missing or insufficient stages.');
      }

      // Persist the course with run_id so the next pipeline step can correlate
      const CourseId = await ctx.runMutation(api.course.createCourse, {
        prompt: args.messages,
        stages,
        // Add run_id to the Course if your schema allows it
        // runId,
      });

      // Mark successful end
      phClient.capture({
        distinctId: userId,
        event: '$ai_run_end',
        properties: {
          run_id: runId,
          phase: 'contextgather',
          success: true,
          stages_count: stages.length,
          course_id: CourseId,
        },
      });

      return { CourseId, runId };
    } catch (error) {
      phClient.capture({
        distinctId: userId,
        event: '$ai_context_error',
        properties: {
          run_id: runId,
          phase: 'contextgather',
          error_message: error instanceof Error ? error.message : String(error),
          error_name: error instanceof Error ? error.name : 'UnknownError',
        },
      });

      if (error instanceof Error) {
        throw new Error(`Chat completion failed: ${error.message}`);
      }
      throw new Error('Chat completion failed with unknown error');
    } finally {
      await phClient.shutdown();
    }
  },
});
