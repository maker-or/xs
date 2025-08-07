import { z } from 'zod';

const SlideSchema = z.object({
  name: z
    .string()
    .describe("Unique slide identifier, e.g., 'slide 1', 'slide 2'"),
  title: z
    .string()
    .describe('Main title of the slide that introduces the key concept'),

  subTitles: z
    .string()
    .describe('A brief subtitle or summary of the slide content (optional)'),

  svg: z
    .string()
    .optional()
    .describe(
      'SVG diagram content to support visual learning. Should be valid SVG markup.'
    ),

  content: z
    .string()
    .describe(
      'Main explanation in markdown or plain text (max 180 words, clear and concise)'
    ),

  links: z
    .array(z.string().regex(/^https?:\/\/[^\s$.?#].[^\s]*$/))
    .optional()
    .describe(
      'List of URLs for relevant platforms like LeetCode, HackerRank, etc.'
    ),

  youtubeSearchText: z
    .string()
    .optional()
    .describe('Search query shown to user to explore more on YouTube'),

  code: z
    .object({
      language: z
        .string()
        .describe('Programming language used in the code block'),
      content: z.string().describe('Code snippet'),
    })
    .optional()
    .describe('A short code snippet'),

  tables: z.string().optional().describe('Optional table in markdown'),

  bulletPoints: z
    .array(z.string())
    .optional()
    .describe('Key points or summary lines'),

  flashcardData: z
    .array(
      z
        .object({
          question: z.string().describe('Flashcard question'),
          answer: z.string().describe('Flashcard answer'),
        })
        .strict()
    )
    .optional()
    .describe('Flashcard Q&A pairs'),

  testQuestions: z
    .array(
      z
        .object({
          question: z.string().describe('MCQ test question'),
          options: z.array(z.string()).describe('MCQ test options'),
          answer: z.string().describe('MCQ test answer'),
        })
        .strict()
    )
    .optional()
    .describe('MCQ test questions'),

  type: z
    .enum([
      'markdown',
      'code',
      'video',
      'quiz',
      'table',
      'flashcard',
      'test',
      'svg',
    ])
    .describe('The layout type of this slide'),
});

export const SlidesSchema = z.array(SlideSchema);

export const AgentOutputSchema = z
  .object({
    slides: SlidesSchema,
  })
  .strict();
