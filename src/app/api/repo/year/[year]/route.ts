// src/app/api/repo/year/[year]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from '~/server/db';
import { repo } from "~/server/db/schema";

const years = ['1','2','3','4'];

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
    try {
        const { year } = params;
        if(!years.includes(year)) throw new Error('Year not defined');

        const files = await db
        .select({ 
            branch: repo.branch
        })
        .from(repo)
        .where(eq(repo.year, year))
        .groupBy(repo.branch);
        
        console.log(files);
        return NextResponse.json(files);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error });
    }
}