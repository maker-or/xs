import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  pgTableCreator,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Create table function
export const createTable = pgTableCreator((name) => `gallery_${name}`);

// Define the folders table first
export const folders = createTable(
  'folders',
  {
    folderId: integer('folderId').primaryKey(),
    folderName: varchar('folderName', { length: 256 }).notNull(), // Name of the folder
    userId: varchar('userId', { length: 1024 }).notNull(), // ID of the user who created the folder
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Timestamp for folder creation
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date() // Timestamp for folder updates
    ),
  },
  (folders) => ({
    userIndex: index('user_idx').on(folders.userId), // Index on userId for faster lookups
  })
);

// files
export const posts = createTable(
  'post',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(), // Auto-incrementing post ID
    name: varchar('name', { length: 256 }).notNull(), // Name of the post
    userId: varchar('userId', { length: 1024 }).notNull(), // ID of the user who created the post
    folderId: integer('folderId')
      .notNull()
      .references(() => folders.folderId), // Foreign key reference
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Timestamp for post creation
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date() // Timestamp for post updates
    ),
    url: varchar('url', { length: 1024 }).notNull(), // URL of the post
  },
  (example) => ({
    nameIndex: index('name_idx').on(example.name), // Index on post name for faster lookups
  })
);

//planner
export const tasks = createTable(
  'tasks',
  {
    tasksId: integer('taskId').primaryKey().generatedAlwaysAsIdentity(), // Auto-incrementing task ID
    userId: varchar('userId', { length: 1024 }).notNull(), // ID of the user who created the task
    task: varchar('task', { length: 255 }).notNull(), // Task description or title
    date: varchar('date').notNull(),
    month: varchar('month').notNull(),
    year: varchar('year').notNull(), // Date when the task is created or due
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Timestamp for task creation
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date() // Timestamp for task updates
    ),
  },
  (tasks) => ({
    userIndex: index('use_idx').on(tasks.userId), // Index on userId for faster lookups
  })
);

//todo or task
export const dod = createTable(
  'dod',
  {
    doId: integer('doId').primaryKey().generatedAlwaysAsIdentity(), // Auto-incrementing task ID
    userId: varchar('userId', { length: 1024 }).notNull(), // ID of the user who created the task
    task: varchar('task', { length: 255 }).notNull(),
    completed: varchar('completed', { length: 255 }).notNull(), // Task description or title                                       // Date when the task is created or due
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Timestamp for task creation
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date() // Timestamp for task updates
    ),
  },
  (dod) => ({
    userIndex: index('dod_idx').on(dod.userId), // Index on userId for faster lookups
  })
);

export const repo = createTable(
  'repo',
  {
    doId: integer('rId').primaryKey().generatedAlwaysAsIdentity(), // Auto-incrementing task ID
    userId: varchar('userId', { length: 1024 }).notNull(), // ID of the user who created the task
    filename: varchar('filename', { length: 255 }).notNull(),
    fileurl: varchar('fileurl', { length: 255 }).notNull(),
    tags: text('tags').notNull(),
    //tags: json("tags").$type<string[]>().notNull().default([]),
    year: varchar('year', { length: 255 }).notNull(),
    branch: varchar('branch', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 255 }).notNull(),
    type: varchar('type', { length: 255 }).notNull(), // Task description or title                                       // Date when the task is created or due
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Timestamp for task creation
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date() // Timestamp for task updates
    ),
  },
  (repo) => ({
    userIndex: index('repo_idx').on(repo.userId), // Index on userId for faster lookups
  })
);

export const chats = createTable(
  'chats',
  {
    chId: integer('chId').primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar('userId', { length: 1024 }).notNull(),
    messages: text('messages').notNull(), // Using text for longer messages storage
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (chats) => ({
    userIndex: index('chats_user_idx').on(chats.userId),
  })
);

export const users = pgTable(
  'users',
  {
    userid: varchar('id', { length: 128 }).primaryKey(),
    email: varchar('email', { length: 256 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(), // "student", "teacher", etc.
    organisation_id: varchar('organisation_id', { length: 128 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (users) => ({
    emailIndex: index('users_idx').on(users.userid), // Index on email for faster lookups
  })
);

// Exam difficulty enum
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

// Exams table
export const exams = createTable(
  'exams',
  {
    id: uuid('id').defaultRandom().primaryKey(), // UUID as primary key
    subject: varchar('subject', { length: 255 }).notNull(),
    topic: varchar('topic', { length: 255 }),
    num_questions: integer('num_questions').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    duration: integer('duration').notNull(), // in minutes
    question_time_limit: integer('question_time_limit').default(30), // in seconds, default 30 seconds per question
    starts_at: timestamp('starts_at', { withTimezone: true }).notNull(),
    ends_at: timestamp('ends_at', { withTimezone: true }).notNull(),
    questions:
      json('questions').$type<
        Array<{
          question: string;
          options: string[];
          correct_answer: string;
        }>
      >(), // Store questions, options, and correct answers
    allowed_users: text('allowed_users').array().notNull(), // Array of Clerk user IDs
    created_by: varchar('created_by', { length: 128 }).notNull(), // Teacher's Clerk ID
    organization_id: varchar('organization_id', { length: 128 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (exams) => ({
    orgIndex: index('exams_org_idx').on(exams.organization_id),
    creatorIndex: index('exams_creator_idx').on(exams.created_by),
    timeIndex: index('exams_time_idx').on(exams.starts_at, exams.ends_at),
  })
);

// Results table
export const results = createTable(
  'results',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    exam_id: uuid('exam_id')
      .notNull()
      .references(() => exams.id),
    user_id: varchar('user_id', { length: 128 }).notNull(),
    answers:
      json('answers').$type<
        Array<{
          question_id: number;
          selected_option: string;
        }>
      >(), // Store user's answers
    score: integer('score').notNull(),
    submitted_at: timestamp('submitted_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (results) => ({
    examIndex: index('results_exam_idx').on(results.exam_id),
    userIndex: index('results_user_idx').on(results.user_id),
    examUserIndex: index('results_exam_user_idx').on(
      results.exam_id,
      results.user_id
    ),
    // Add unique constraint to prevent duplicate submissions
    examUserUnique: unique('results_exam_user_unique').on(
      results.exam_id,
      results.user_id
    ),
  })
);
