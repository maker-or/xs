import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { exams, results, users } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for request parameters
const examResultsQuerySchema = z.object({
  exam_id: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  try {
    // Get current user and verify they are a teacher
   // const user = await currentUser();
    const { userId } = await auth ();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }


    // Fetch user details from the database
    const userRecord = await db.query.users.findFirst({
      where: eq(users.userid, userId)
    });
    
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a teacher
    if (userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can create exams' }, { status: 403 });
    }

    // Get the exam_id from query parameters
    const url = new URL(req.url);
    const examId = url.searchParams.get('exam_id');
    
    // Validate exam_id
    const { exam_id } = examResultsQuerySchema.parse({ exam_id: examId });

    // Check if the exam exists and was created by this teacher
    const [exam] = await db
      .select()
      .from(exams)
      .where(
        and(
          eq(exams.id, exam_id),
          eq(exams.created_by, userId)
        )
      )
      .execute();

    if (!exam) {
      return NextResponse.json({
        error: 'Exam not found or you are not authorized to access it',
      }, { status: 404 });
    }

    // Fetch all results for this exam
    const examResults = await db
      .select({
        id: results.id,
        user_id: results.user_id,
        score: results.score,
        submitted_at: results.submitted_at,
      })
      .from(results)
      .where(eq(results.exam_id, exam_id))
      .execute();

    // Get user information for each result
    const userIds = examResults.map(result => result.user_id);
    
    let userInfo: { userid: string; email: string; }[] = [];
    
    if (userIds.length > 0) {
      // Fetch all users and filter in-memory if there are many results
      // For better performance in real-world applications, you might want to 
      // consider pagination or a different query approach
      userInfo = await db
        .select({
          userid: users.userid,
          email: users.email,
        })
        .from(users)
        .execute();
        
      // Filter to only include users that submitted the exam
      userInfo = userInfo.filter(user => userIds.includes(user.userid));
    }

    // Create a map of user_id to email for easier lookup
    const userEmailMap = new Map(
      userInfo.map(user => [user.userid, user.email])
    );

    // Prepare data with user emails
    const formattedResults = examResults.map(result => {
      return {
        id: result.id,
        user_id: result.user_id,
        email: userEmailMap.get(result.user_id) || 'Unknown',
        score: result.score,
        total: exam.num_questions,
        percentage: Math.round((result.score / exam.num_questions) * 100),
        submitted_at: result.submitted_at,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    // Handle other errors
    return NextResponse.json({ 
      error: 'Failed to fetch exam results' 
    }, { status: 500 });
  }
}
