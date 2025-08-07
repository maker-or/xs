// src/app/api/repo/year/[year]/[branch]/[subject]/route.ts

import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { repo } from '~/server/db/schema';

const years = ['1', '2', '3', '4'];

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ year: string; branch: string; subject: string }>;
  }
) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const params = await context.params;
    const { year, branch, subject } = params;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'notes';

    if (!years.includes(year)) {
      throw new Error('Year not defined');
    }

    const files = await db
      .select({
        doId: repo.doId, // Changed from repo.id to repo.doId
        filename: repo.filename,
        subject: repo.subject,
        tags: repo.tags,
        fileurl: repo.fileurl,
        year: repo.year,
        branch: repo.branch,
      })
      .from(repo)
      .where(
        and(
          eq(repo.year, year),
          eq(repo.branch, branch),
          eq(repo.subject, subject)
          // Removed category filter since it doesn't exist in schema
          // We can add it back once the column is added to the schema
        )
      );

    // Filter by category client-side until schema is updated
    // This is a temporary solution
    const categoryFilteredFiles =
      category === 'notes'
        ? files.filter(
            (file) =>
              file.filename.toLowerCase().includes('note') ||
              !file.filename.toLowerCase().includes('question')
          )
        : files.filter((file) =>
            file.filename.toLowerCase().includes('question')
          );

    // Extract all unique tags from the files
    const allTags = new Set<string>();
    categoryFilteredFiles.forEach((file) => {
      if (Array.isArray(file.tags)) {
        file.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return NextResponse.json({
      files: categoryFilteredFiles,
      tags: Array.from(allTags),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
