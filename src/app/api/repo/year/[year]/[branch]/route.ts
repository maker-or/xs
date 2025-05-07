// src/app/api/repo/year/[year]/[branch]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from '~/server/db';
import { repo } from "~/server/db/schema";

const years = ['1','2','3','4'];

export async function GET(
  request: NextRequest,
  context: unknown
) {
    try {
        // Safely extract params with type checking
        const params = context && typeof context === 'object' && 'params' in context
          ? (context as { params: { year: string; branch: string } }).params
          : null;

        if (!params) {
          return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        const { year, branch } = params;
        
        if(!years.includes(year)) throw new Error('Year not defined');

        const files = await db
        .select({ 
            subject: repo.subject  
        })
        .from(repo)
        .where(and(eq(repo.year, year), eq(repo.branch, branch)))
        .groupBy(repo.subject);
        
        console.log(files);
        return NextResponse.json(files);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error });
    }
}