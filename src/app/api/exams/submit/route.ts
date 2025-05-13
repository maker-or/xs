import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { examSubmitSchema } from '~/server/api/exams/schemas';
import { db } from '~/server/db';
import { exams, results } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // Get current user
    //const user = await currentUser();
        const { userId } = await auth ();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const { exam_id, answers } = examSubmitSchema.parse(body);
    
    // Check if the user has already submitted this exam
    const existingSubmission = await db
      .select()
      .from(results)
      .where(
        and(
          eq(results.exam_id, exam_id),
          eq(results.user_id, userId)
        )
      )
      .execute();
    
    if (existingSubmission.length > 0) {
      return NextResponse.json({
        error: 'You have already submitted this exam',
      }, { status: 409 });
    }
    
    // Retrieve the exam by ID first
    const [exam] = await db
      .select()
      .from(exams)
      .where(eq(exams.id, exam_id))
      .execute();
    
    // Check if exam exists and the user is authorized
    if (!exam || !exam.allowed_users.includes(userId)) {
      return NextResponse.json({
        error: 'Exam not found or you are not authorized to take this exam',
      }, { status: 404 });
    }
    
    // Grade the exam
    let score = 0;
    const examQuestions = exam.questions;
    
    if (!examQuestions) {
      return NextResponse.json({
        error: 'This exam has no questions',
      }, { status: 500 });
    }
    
    // Score the exam by comparing user answers to correct answers
    answers.forEach(answer => {
      const question = examQuestions[answer.question_id];
      if (!question) return;
      
      // Check if the selected option matches the correct answer
      // The correct_answer is stored as a string (index), but the selected_option is the actual option text
      const correctIndex = parseInt(question.correct_answer, 10);
      const correctOptionText = question.options[correctIndex];
      if (answer.selected_option === correctOptionText) {
        score++;
      }
    });
    
    // Insert the result into the database
    await db
      .insert(results)
      .values({
        exam_id: exam_id,
        user_id: userId,
        answers: answers,
        score: score,
      })
      .returning({ id: results.id, score: results.score })
      .execute();
    
    // Calculate percentage score
    const totalQuestions = examQuestions.length;
    const percentageScore = Math.round((score / totalQuestions) * 100);
    
    // Return the result
    return NextResponse.json({
      message: `Exam submitted successfully. Your score: ${score}/${totalQuestions} (${percentageScore}%)`,
      score: score,
      total: totalQuestions,
      percentage: percentageScore,
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    // Handle other errors
    return NextResponse.json({ 
      error: 'Failed to submit exam' 
    }, { status: 500 });
  }
}
