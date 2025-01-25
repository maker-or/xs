import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
// import {
//   pgTable,
//   serial,
//   text,
//   timestamp,
//   uniqueIndex,
// } from "drizzle-orm/pg-core";
import * as schema from "./schema";

// Use this object to send drizzle queries to your DB
const sql = neon(process.env.POSTGRES_URL!);
export const db = drizzle(sql, { schema });
