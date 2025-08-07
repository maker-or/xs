// src/app/api/shared/[shared]/route.ts

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '~/server/db'; // your Drizzle ORM connection file
import { chats } from '~/server/db/schema';

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const shared = url.pathname.split('/').pop();
    if (!shared) {
      return NextResponse.json({ error: 'Missing share ID' }, { status: 400 });
    }

    const id = Number.parseInt(shared, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid chat identifier' },
        { status: 400 }
      );
    }

    const result = await db.select().from(chats).where(eq(chats.chId, id));
    if (!result.length) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const chatRecord = result[0];
    const messages = JSON.parse(chatRecord?.messages ?? '[]');

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error retrieving chat:', error);
    return NextResponse.json(
      { error: 'Server error while retrieving chat' },
      { status: 500 }
    );
  }
}
