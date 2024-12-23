import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

// Create table function
export const createTable = pgTableCreator((name) => `gallery_${name}`);

// Define the folders table first
export const folders = createTable(
  "folders",
  {
    folderId: integer("folderId").primaryKey(),
    folderName: varchar("folderName", { length: 256 }).notNull(),           // Name of the folder
    userId: varchar("userId", { length: 1024 }).notNull(),                 // ID of the user who created the folder
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),                                                           // Timestamp for folder creation
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),                                                     // Timestamp for folder updates
    ),
  },
  (folders) => ({
    userIndex: index("user_idx").on(folders.userId),                      // Index on userId for faster lookups
  })
);

// files
export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),            // Auto-incrementing post ID
    name: varchar("name", { length: 256 }).notNull(),                     // Name of the post
    userId: varchar("userId", { length: 1024 }).notNull(),               // ID of the user who created the post
    folderId: integer("folderId").notNull().references(() => folders.folderId), // Foreign key reference
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),                                                           // Timestamp for post creation
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),                                                     // Timestamp for post updates
    ),
    url: varchar("url", { length: 1024 }).notNull(),                      // URL of the post
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),                        // Index on post name for faster lookups
  }),
);

//planner
export const tasks = createTable(
  "tasks",
  {
    tasksId: integer("taskId").primaryKey().generatedAlwaysAsIdentity(),   // Auto-incrementing task ID
    userId: varchar("userId", { length: 1024 }).notNull(),                // ID of the user who created the task
    task: varchar("task", { length: 255 }).notNull(),                     // Task description or title
    date: varchar("date").notNull(),
    month:varchar("month").notNull(),
    year:varchar("year").notNull(),                                   // Date when the task is created or due
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),                                                           // Timestamp for task creation
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),                                                    // Timestamp for task updates
    ),
  },
  (tasks) => ({
    userIndex: index("use_idx").on(tasks.userId),                       // Index on userId for faster lookups
  })
);


//todo or task
export const dod = createTable(
  "dod",
  {
    doId: integer("doId").primaryKey().generatedAlwaysAsIdentity(),  // Auto-incrementing task ID
    userId: varchar("userId", { length: 1024 }).notNull(),                // ID of the user who created the task
    task: varchar("task", { length: 255 }).notNull(),
    completed:varchar("completed",{ length: 255 }).notNull(),              // Task description or title                                       // Date when the task is created or due
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),                                                           // Timestamp for task creation
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),                                                    // Timestamp for task updates
    ),
  },
  (dod) => ({
    userIndex: index("dod_idx").on(dod.userId),                       // Index on userId for faster lookups
  })
);