import { z } from 'zod';

export type gallery_tasks = {
  taskId: number;
  userId: string;
  task: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;

};


export type Result = Record<string, string | number>;

export type Config = unknown;


export const explanationSchema = z.object({
  section: z.string(),
  explanation: z.string(),
});

export type QueryExplanation = z.infer<typeof explanationSchema>;