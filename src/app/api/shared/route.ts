// file: app/api/shared/route.ts
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { chats } from '~/server/db/schema';
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = (await auth()) as { userId: string | null };
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid chat data' }, { status: 400 });
    }
    
    const messagesJson = JSON.stringify(messages);

    const result = await db.insert(chats)
      .values({ userId, messages: messagesJson })
      .returning({ shareId: chats.chId });
      
    const shareId = result[0]?.shareId;
    if (!shareId) {
      throw new Error('Failed to create chat record');
    }
    
    return NextResponse.json({ shareId });
  } catch (error) {
    console.error('Error saving chat:', error);
    return NextResponse.json({ error: 'Server error while saving chat' }, { status: 500 });
  }
}
