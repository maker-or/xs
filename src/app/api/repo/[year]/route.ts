import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from '~/server/db';
import { repo } from "~/server/db/schema";
//import { years } from '~/utils/constants'; // Adjust the import path as necessary
const years = ['1', '2', '3', '4'];
export async function GET(req: NextRequest, { params }: { params: Promise<{ year: string }> }) {
    try {
        const year = (await params).year;
        if (!years.includes(year)) throw new Error('Year not defined');

        const search = await db
            .select({
                filename: repo.filename,
                year: repo.year,
                subject: repo.subject
            })
            .from(repo)
            .where(eq(repo.year, year));

        return NextResponse.json({ message: 'success', files: JSON.stringify(search) });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error });
    }
}