import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { repo } from "~/server/db/schema";

interface FileResponse {
  doId: number;
  filename: string;
  subject: string;
  tags: string[];
  fileurl: string;
  year: string;
  branch: string;
}

interface DbFile {
  doId: number;
  filename: string;
  subject: string;
  tags: string | string[];
  fileurl: string;
  year: string;
  branch: string;
}

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: { year: string; branch: string; subject: string };
  }
): Promise<NextResponse<{ files: DbFile[] } | { error: string }>> {
  try {
    const { year, branch, subject } = params;

    const files = await db
      .select()
      .from(repo)
      .where(
        and(
          eq(repo.year, year),
          eq(repo.branch, branch),
          eq(repo.subject, subject),
        ),
      ) as DbFile[];

    const formattedFiles: DbFile[] = files.map((file) => ({
      ...file,
      tags: typeof file.tags === 'string' 
        ? file.tags.split(',').map((tag: string) => tag.trim())
        : Array.isArray(file.tags)
        ? file.tags
        : [],
    }));

    return NextResponse.json({ files: formattedFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}