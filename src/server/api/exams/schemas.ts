import { z } from 'zod';
// Removed unused import: difficultyEnum

// Base schema for validating exam creation
export const examCreateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().optional(),
  num_questions: z.number().int().min(1, "Number of questions must be at least 1"),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  starts_at: z.string().transform(str => new Date(str)),
  ends_at: z.string().transform(str => new Date(str)),
  allowed_users: z.array(z.string()).optional(),
  organization_id: z.string(),
}).refine(data => {
  const startDate = new Date(data.starts_at);
  const endDate = new Date(data.ends_at);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["ends_at"],
});

// Schema for validating the exam submission
export const examSubmitSchema = z.object({
  exam_id: z.string().uuid(),
  answers: z.array(z.object({
    question_id: z.number().int(),
    selected_option: z.string(),
  })),
});

// Schema for validating user identification from CSV
export const userIdentifierSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  type: z.enum(['email', 'rollNumber']),
});

// Types derived from the schemas
export type ExamCreate = z.infer<typeof examCreateSchema>;
export type ExamSubmit = z.infer<typeof examSubmitSchema>;
export type UserIdentifier = z.infer<typeof userIdentifierSchema>;

// Schema for question generation by LLM
export const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correct_answer: z.number().int().min(0),
});

export const questionsArraySchema = z.array(questionSchema);

// Schema for exam result
export const examResultSchema = z.object({
  id: z.string().uuid(),
  exam_id: z.string().uuid(),
  user_id: z.string(),
  score: z.number().int(),
  submitted_at: z.string().transform(str => new Date(str)),
  answers: z.array(z.object({
    question_id: z.number().int(),
    selected_option: z.string(),
  })),
});
