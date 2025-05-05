import { NextResponse, NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { repo } from "~/server/db/schema";

//const years = ['1','2','3','4'];

export async function GET(
  request: NextRequest,
  context: { params: { year: string; branch: string; subject: string } }
) {
  const { year, branch, subject } = context.params;
  // now year, branch, subject are typed strings
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as
    | "notes"
    | "questionPapers";
    console.log("helloo  searchParams:", category);

    // year, branch, subject already available

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

    console.log("all files:", files);

    const data = files
      .filter(el => el?.tags && typeof el.tags === 'string')
      .map((el) => {
        try {
          // Each tag field is likely an array of strings in JSON format
          return JSON.parse(el.tags) as string[];
        } catch (error) {
          console.error(`Failed to parse tags: ${el.tags}`, error);
          return [] as string[];
        }
      });
    // At this point, data is string[][] (array of arrays of strings)
    const flattenedData = data.flat();
    const uniqueTags = [...new Set(flattenedData)];
    
    console.log("tags:");
    // const url = new URL(req.url);
    // console.log(url.searchParams);
    return NextResponse.json({ files, tags: uniqueTags });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}