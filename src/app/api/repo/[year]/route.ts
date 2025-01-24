import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {eq, ilike } from "drizzle-orm";
import { db } from '~/server/db';
import { repo } from "~/server/db/schema";


const years = ['1','2','3','4'];

export async function GET(req:NextRequest, { params }: { params: Promise<{ year: string }> }) {
    try {
        const year = (await params).year;
        if(!years.includes(year)) throw new Error('Year not defined');


        const search = await db
        .select({ 
            filename: repo.filename,
            year: repo.year,  // Include the URL in the selection
            subject: repo.subject
        })
        .from(repo)
        .where(eq(repo.year,year));
        console.log(search)
        // const url = new URL(req.url);
        // console.log(url.searchParams);
        return NextResponse.json({message:'success',files: JSON.stringify(search)})
    } catch (error) {
        console.log(error);
        return NextResponse.json({error})
    }
}