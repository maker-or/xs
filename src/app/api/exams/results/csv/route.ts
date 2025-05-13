import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { exams, results, users } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { stringify } from 'csv-stringify/sync';
import { z } from 'zod';

// Validation schema for request parameters
const examResultsQuerySchema = z.object({
  exam_id: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  try {
    // Get current user and verify they are a teacher
    //const user = await currentUser();
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
    // const userRole = user.publicMetadata.role;

    if (userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can create exams' }, { status: 403 });
    }

    // if (userRole !== 'admin') {
    //   return NextResponse.json({ error: 'Only teachers can export exam results' }, { status: 403 });
    // }

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
        answers: results.answers,
      })
      .from(results)
      .where(eq(results.exam_id, exam_id))
      .execute();

    // Get user information for each result
    const userIds = examResults.map(result => result.user_id);
    
    // Fetch all users and filter in-memory
    const allUsers = await db
      .select({
        userid: users.userid,
        email: users.email,
      })
      .from(users)
      .execute();
      
    // Filter to only include users who submitted the exam
    const userInfo = allUsers.filter(user => userIds.includes(user.userid));

    // Create a map of user_id to email for easier lookup
    const userEmailMap = new Map(
      userInfo.map(user => [user.userid, user.email])
    );

    // Prepare data for CSV export
    const csvData = examResults.map(result => {
      return {
        id: result.id,
        email: userEmailMap.get(result.user_id) || 'Unknown',
        score: result.score,
        total: exam.num_questions,
        percentage: Math.round((result.score / exam.num_questions) * 100),
        submitted_at: result.submitted_at.toISOString(),
      };
    });

    // Generate CSV
    const csv = stringify(csvData, {
      header: true,
      columns: [
        { key: 'id', header: 'Result ID' },
        { key: 'email', header: 'Student Email' },
        { key: 'score', header: 'Score' },
        { key: 'total', header: 'Total Questions' },
        { key: 'percentage', header: 'Percentage' },
        { key: 'submitted_at', header: 'Submission Date' },
      ],
    });

    // Return CSV as a file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="exam-${exam_id}-results.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting exam results:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    // Handle other errors
    return NextResponse.json({ 
      error: 'Failed to export exam results' 
    }, { status: 500 });
  }
}
