import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { exams, users } from '~/server/db/schema';

export async function GET(_req: NextRequest) {
  try {
    // Get current user and verify they are a teacher
    //const user = await currentUser();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user details from the database
    const userRecord = await db.query.users.findFirst({
      where: eq(users.userid, userId),
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a teacher
    if (userRecord.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only teachers can create exams' },
        { status: 403 }
      );
    }

    // Get all exams created by this teacher
    const examsList = await db
      .select({
        id: exams.id,
        subject: exams.subject,
        topic: exams.topic,
        num_questions: exams.num_questions,
        difficulty: exams.difficulty,
        duration: exams.duration,
        starts_at: exams.starts_at,
        ends_at: exams.ends_at,
        created_at: exams.created_at,
      })
      .from(exams)
      .where(eq(exams.created_by, userId))
      .orderBy(exams.created_at)
      .execute();

    return NextResponse.json({ exams: examsList });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}
