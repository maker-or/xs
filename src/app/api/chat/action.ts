"use server";
import { sql } from "@vercel/postgres";
import { type Result } from "~/lib/types";
import { generateObject } from 'ai';
import { z } from 'zod';
import { explanationSchema } from '~/lib/types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { auth } from "@clerk/nextjs/server";





const google = createGoogleGenerativeAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.GEMINI_API_KEY
});

const model = google('models/gemini-1.5-pro-latest', {
    safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ],
});


/**
 * Executes a SQL query and returns the result data
 * @param {string} query - The SQL query to execute
 * @returns {Promise<Result[]>} Array of query results
 * @throws {Error} If query is not a SELECT statement or table doesn't exist
 */
export const runGeneratedSQLQuery = async (query: string) => {
    "use server";

    // Ensure the query is a SELECT statement. Otherwise, throw an error
    if (
        !query.trim().startsWith("SELECT") ||
        query.trim().toLowerCase().includes("drop") ||
        query.trim().toLowerCase().includes("delete") ||
        query.trim().toLowerCase().includes("insert") ||
        query.trim().toLowerCase().includes("update") ||
        query.trim().toLowerCase().includes("alter") ||
        query.trim().toLowerCase().includes("truncate") ||
        query.trim().toLowerCase().includes("create") ||
        query.trim().toLowerCase().includes("grant") ||
        query.trim().toLowerCase().includes("revoke")
    ) {
        throw new Error("Only SELECT queries are allowed");
    }


    const { userId } = auth();
    console.log(userId)
    let data: unknown;  
    try {
        data = await sql.query(query);
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('relation "gallery_task" does not exist')) {
            console.log(
                "Table does not exist, creating and seeding it with dummy data now ggggg...",
            );
            throw Error("Table does not exist vuuy");
        } else {
            throw e;
        }
    }

    return (data as { rows: Result[] }).rows;
};

/* ...rest of the file... */

export const generateQuery = async (input: string) => {
    'use server';
    const { userId } = auth();
    console.log(userId)
    try {
        const result = await generateObject({
            model: model,
            system: `You are a postgres expert and drizzle orm. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows:
            gallery_tasks = {
              "taskId": integer,
              "userId": varchar("userId", { length: 1024 }).notNull(),
              "task": varchar("task", { length: 255 }).notNull(),
              "date": varchar("date").notNull(),
              "createdAt": timestamp,
              "updatedAt": timestamp
            }`,
            prompt: `Generate the SQL query necessary to retrieve the data the user wants: ${input}. Ensure that:
            - The column "userId" is ${userId} is always enclosed in double quotes.
            - The "date" column is of type varchar and contains values in the 'DD' format (day of the month as two digits).
            - If the query involves the current date, use TO_CHAR(CURRENT_DATE, 'DD') [for date like 03 wite it as 3] to match the "date" column format.
            - The SQL query should follow standard Postgres syntax and avoid unsafe operations like DELETE, DROP, or INSERT.`,

            
            schema: z.object({
                query: z.string(),
            }),
        });
        return result.object.query; 
    } catch (e) {
        console.error(e);
        throw new Error('Failed to generate query');
    }
};




export const explainQuery = async (input: string, sqlQuery: string) => {
    'use server';
    try {
        const result = await generateObject({
            model: model,
            system: `You are a SQL (postgres) expert. ...`,
            prompt: `Explain the SQL query you generated to retrieve the data the user wanted...
            make that the response it will formated and human understandable . keep it short and sweet. use numeric value to represent if you have more that one point and list them below each other
            dont use ** when genrating the response

      User Query:
      ${input}

      Generated SQL Query:
      ${sqlQuery}`,
            schema: explanationSchema,
            output: 'array'
        });
        return result.object;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to generate query');
    }
};