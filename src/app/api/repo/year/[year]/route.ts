import { NextRequest, NextResponse } from "next/server";
import {eq } from "drizzle-orm";
import { db } from '~/server/db';
import { repo } from "~/server/db/schema";


const years = ['1','2','3','4'];

export async function GET(req:NextRequest, { params }: { params: Promise<{ year: string }> }) {
    try {
        const year = (await params).year;
        if(!years.includes(year)) throw new Error('Year not defined');


        const files = await db
        .select({ 
            subject: repo.subject
        })
        .from(repo)
        .where(eq(repo.year,year))
        .groupBy(repo.subject);
        console.log(files)
        // const url = new URL(req.url);
        // console.log(url.searchParams);
        return NextResponse.json(files)
    } catch (error) {
        console.log(error);
        return NextResponse.json({error})
    }
}