import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { repo } from "~/server/db/schema";

//const years = ['1','2','3','4'];

export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ year: string; branch: string; subject: string }> },
) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    console.log("helloo  searchParams:", category);

    const year = (await params).year;
    const branch = (await params).branch;
    const subject = (await params).subject;

    console.log({ year, branch, subject, category });
    //  if(!years.includes(year)) throw new Error('Year not defined');

    const files = await db
      .select()
      .from(repo)
      .where(
        and(
          eq(repo.year, year),
          eq(repo.branch, branch),
          eq(repo.subject, subject),
          eq(repo.type, category || "notes"),
        ),
      );
    console.log(files);
    // const url = new URL(req.url);
    // console.log(url.searchParams);
    return NextResponse.json(files);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}
