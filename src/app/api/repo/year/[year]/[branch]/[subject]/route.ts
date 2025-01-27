import { NextRequest, NextResponse } from "next/server";
import {and, eq } from "drizzle-orm";
import { db } from '~/server/db';
import { repo } from "~/server/db/schema";


//const years = ['1','2','3','4'];

export async function GET(req:NextRequest, { params }: { params: Promise<{ year: string; branch: string ;subject:string  }> }) {
    try {
        const year = (await params).year;
        const branch = (await params).branch;
        const subject = (await params).subject;
      //  if(!years.includes(year)) throw new Error('Year not defined');


        const files = await db
        .select({ 
            fileurl: repo.fileurl,
            filename: repo.filename,
            type: repo.type,
            
        })
        .from(repo)
        .where(and(eq(repo.year,year), eq(repo.branch,branch) , eq(repo.subject,subject)))
        console.log(files)
        // const url = new URL(req.url);
        // console.log(url.searchParams);
        return NextResponse.json(files)
    } catch (error) {
        console.log(error);
        return NextResponse.json({error})
    }
}