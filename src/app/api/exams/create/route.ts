import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  parseStudentIdentifiers,
  resolveUserIds,
} from '~/server/api/exams/csv-helper';
import { generateQuestions } from '~/server/api/exams/llm-helper';
import { examCreateSchema } from '~/server/api/exams/schemas';
import { db } from '~/server/db';
import { exams, users } from '~/server/db/schema';

export async function POST(req: NextRequest) {
  try {
    // Get current user and verify authentication
    const { userId } = await auth();

    console.log(userId);

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

    // Check if user is an admin/teacher
    if (userRecord.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only teachers can create exams' },
        { status: 403 }
      );
    }

    // Get organization ID from user record
    const organizationId = userRecord.organisation_id;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'User must belong to an organization' },
        { status: 400 }
      );
    }

    // Parse request data as FormData since it includes a file upload
    const formData = await req.formData();

    // Get exam details
    const examData = {
      subject: formData.get('subject') as string,
      topic: (formData.get('topic') as string) || undefined,
      num_questions: Number.parseInt(
        formData.get('num_questions') as string,
        10
      ),
      difficulty: formData.get('difficulty') as 'easy' | 'medium' | 'hard',
      duration: Number.parseInt(formData.get('duration') as string, 10),
      question_time_limit:
        Number.parseInt(formData.get('question_time_limit') as string, 10) ||
        30,
      starts_at: formData.get('starts_at') as string,
      ends_at: formData.get('ends_at') as string,
      organization_id: organizationId,
    };

    // Validate exam details using Zod
    const validatedExamData = examCreateSchema.parse({
      ...examData,
    });

    // Parse CSV file to get student identifiers
    const csvFile = formData.get('students_csv') as File;
    let allowedUsers: string[] = [];

    if (csvFile) {
      const csvText = await csvFile.text();
      const csvRows = csvText.split('\n');

      // Parse student identifiers from CSV
      const identifiers = await parseStudentIdentifiers(csvRows);

      // Resolve user IDs from identifiers
      allowedUsers = await resolveUserIds(identifiers, organizationId);

      // Check if we have any valid users
      if (allowedUsers.length === 0) {
        return NextResponse.json(
          {
            error: 'No valid users found in the uploaded CSV',
          },
          { status: 400 }
        );
      }
    } else {
      // If no CSV file is provided, use all students from the organization
      // This could be implemented in a future version
      return NextResponse.json(
        {
          error: 'Please upload a CSV file with student identifiers',
        },
        { status: 400 }
      );
    }

    // Generate questions using LLM
    const { questions, error: generationError } = await generateQuestions({
      subject: validatedExamData.subject,
      topic: validatedExamData.topic,
      num_questions: validatedExamData.num_questions,
      difficulty: validatedExamData.difficulty,
    });

    if (generationError || questions.length === 0) {
      return NextResponse.json(
        {
          error: generationError || 'Failed to generate questions',
        },
        { status: 500 }
      );
    }

    // Transform the correct_answer from number to string before inserting
    const transformedQuestions = questions.map((q) => ({
      question: q.question,
      options: q.options,
      correct_answer: String(q.correct_answer), // Convert from number to string
    }));

    // Insert exam into the database
    const [newExam] = await db
      .insert(exams)
      .values({
        subject: validatedExamData.subject,
        topic: validatedExamData.topic,
        num_questions: validatedExamData.num_questions,
        difficulty: validatedExamData.difficulty,
        duration: validatedExamData.duration,
        question_time_limit: validatedExamData.question_time_limit,
        starts_at: validatedExamData.starts_at,
        ends_at: validatedExamData.ends_at,
        questions: transformedQuestions,
        allowed_users: allowedUsers,
        created_by: userId,
        organization_id: organizationId,
      })
      .returning({ id: exams.id });

    // Return success response
    return NextResponse.json({
      message: 'Exam created successfully',
      exam_id: newExam?.id,
      num_questions: questions.length,
      num_students: allowedUsers.length,
    });
  } catch (error) {
    console.error('Error creating exam:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to create exam',
      },
      { status: 500 }
    );
  }
}
