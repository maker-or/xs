import { NextRequest, NextResponse } from 'next/server';
import {auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { exams, results } from '~/server/db/schema';
import { and, eq, lte, gte } from 'drizzle-orm';

export async function GET(_req: NextRequest) {
  try {
    // Get current user

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get the current timestamp
    const now = new Date();

    // Check if the user has already submitted any exams that are currently active
    const submittedExams = await db
      .select({ exam_id: results.exam_id })
      .from(results)
      .where(eq(results.user_id, userId))
      .execute();

    const submittedExamIds = submittedExams.map(result => result.exam_id);

    // Find exams that are currently active (between start and end dates)
    const currentExams = await db
      .select()
      .from(exams)
      .where(
        and(
          lte(exams.starts_at, now), // starts_at <= now
          gte(exams.ends_at, now)   // ends_at >= now
          // We'll filter by allowed_users after fetching
        )
      )
      .execute();

    // Filter exams that the user is allowed to take
    const userExams = currentExams.filter(exam =>
      exam?.allowed_users?.includes(userId)
    );

    // Filter exams that haven't been submitted yet
    const availableExams = userExams.filter(
      exam => exam && !submittedExamIds.includes(exam.id)
    );

    // If we have an available exam, return it
    if (availableExams.length > 0) {
      // Get the first available exam (we could add logic to prioritize exams in the future)
      const exam = availableExams[0];

      if (!exam) {
        return NextResponse.json({
          available: false,
          message: 'No exam available at this time',
        });
      }

      // Generate a unique seed for this student to ensure consistent question selection per session
      const studentSeed = `${exam.id}-${userId}`;
      const seedHash = studentSeed.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);

      // Use seeded random to ensure consistent selection for the same student
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      // Randomly select the requested number of questions for this specific student
      const allQuestions = exam.questions || [];
      const questionIndices = Array.from({ length: allQuestions.length }, (_, i) => i);

      // Shuffle indices using seeded random for consistent per-student selection
      for (let i = questionIndices.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seedHash + i) * (i + 1));
        const temp = questionIndices[i];
        questionIndices[i] = questionIndices[j]!;
        questionIndices[j] = temp!;
      }

      // Select only the number of questions requested by teacher
      const selectedIndices = questionIndices.slice(0, exam.num_questions);
      const selectedQuestions = selectedIndices.map(index => allQuestions[index]);

      // Remove the correct answers from the selected questions before sending to the client
      // Also include the original indices for proper answer mapping during submission
      const sanitizedQuestions = selectedQuestions.map((q, index) => ({
        question: q?.question || '',
        options: q?.options || [],
        original_index: selectedIndices[index], // Include original index for submission mapping
      }));

      console.log(`Student ${userId} gets ${sanitizedQuestions.length} questions from pool of ${allQuestions.length}`);

      return NextResponse.json({
        available: true,
        exam: {
          id: exam.id,
          subject: exam.subject,
          topic: exam.topic,
          num_questions: exam.num_questions,
          difficulty: exam.difficulty,
          duration: exam.duration,
          question_time_limit: exam.question_time_limit || 30,
          questions: sanitizedQuestions,
        },
      });
    } else {
      // Check if user has already submitted an exam that's currently active
      const hasSubmitted = submittedExamIds.length > 0 && userExams.some(
        exam => exam && submittedExamIds.includes(exam.id)
      );

      return NextResponse.json({
        available: false,
        hasSubmitted: hasSubmitted,
        message: hasSubmitted
          ? 'You have already submitted this exam'
          : 'No exam available at this time',
      });
    }
  } catch (error) {
    console.error('Error checking for exams:', error);
    return NextResponse.json({
      error: 'Failed to check for exams',
      available: false,
    }, { status: 500 });
  }
}
