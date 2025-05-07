// src/app/api/repo/year/[year]/[branch]/[subject]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { repo } from "~/server/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string; branch: string; subject: string } }
) {
  const { year, branch, subject } = params;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as
      | "notes"
      | "questionPapers";

    const files = await db
      .select()
      .from(repo)
      .where(
        and(
          eq(repo.year, year),
          eq(repo.branch, branch),
          eq(repo.subject, subject),
          eq(repo.type, category || "notes"),
        )
      );

    const data = files
      .filter(el => el?.tags && typeof el.tags === "string")
      .map((el) => {
        try {
          return JSON.parse(el.tags) as string[];
        } catch (error) {
          console.error(`Failed to parse tags: ${el.tags}`, error);
          return [] as string[];
        }
      });

    const flattenedData = data.flat();
    const uniqueTags = [...new Set(flattenedData)];

    return NextResponse.json({ files, tags: uniqueTags });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}