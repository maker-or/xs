import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { repo } from "~/server/db/schema";

const years = ["1", "2", "3", "4"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string; subject: string }> },
) {
  try {
    console.log("got to kk route");
    const { year, subject } = await params;
    if (!years.includes(year)) throw new Error("Year not defined");

    console.log("got sub:", subject);
    const search = await db
      .select({
        filename: repo.filename,
        year: repo.year, // Include the URL in the selection
        subject: repo.subject,
        fileurl: repo.fileurl,
        tags: repo.tags,
      })
      .from(repo)
      .where(and(eq(repo.year, year), eq(repo.subject, subject)));
    console.log(search);
    // const url = new URL(req.url);
    // console.log(url.searchParams);
    return NextResponse.json({ files: JSON.stringify(search) });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}
// export async function GET(){
//     return NextResponse.json({messg: 'sucess'})
// }
