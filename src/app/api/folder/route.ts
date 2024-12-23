//This page only fetchs the folder for a particulat user it doen't fetch the files in the folder

import { db } from '~/server/db';
import { folders } from '~/server/db/schema';
import { auth } from "@clerk/nextjs/server";
import {eq } from "drizzle-orm";
import { NextResponse } from 'next/server';
// import { metadata } from '~/app/layout';
export async function GET() {
    const { userId } = (await auth()) as { userId: string | null };

    console.log("The user id is ",userId);

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const userFolders = await db.select()
    .from(folders)
    .where(eq(folders.userId, userId));


    // If no folders exist, create a default folder
    // if (userFolders.length === 0) {
    //     const defaultFolder = await db.insert(folders).values({
    //         userId,
    //         folderId:1,
    //         folderName: "Folder"
    //     }).returning();
    //     return NextResponse.json(defaultFolder);
    // }

    return NextResponse.json(userFolders);
}

export async function POST(request: Request) {
    interface FolderData {
        folderName: string;
        folderId: number;
    }

    const { userId } = (await auth()) as { userId: string | null };


    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { folderName,folderId }: FolderData = await request.json() as FolderData;



    const newFolder = await db.insert(folders).values({
        userId,
        folderId,
        folderName
    }).returning();

    return NextResponse.json(newFolder);
}
