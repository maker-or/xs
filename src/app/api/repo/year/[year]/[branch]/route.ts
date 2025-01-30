import { NextRequest, NextResponse } from "next/server";
import {and, eq } from "drizzle-orm";
import { db } from '~/server/db';
import { repo } from "~/server/db/schema";


const years = ['1','2','3','4'];

export async function GET(req:NextRequest, { params }: { params: Promise<{ year: string; branch: string  }> }) {
    try {
        const year = (await params).year;
        const branch = (await params).branch;
        if(!years.includes(year)) throw new Error('Year not defined');


        const files = await db
        .select({ 
            subject: repo.subject  
        })
        .from(repo)
        .where(and(eq(repo.year,year), eq(repo.branch,branch)))
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