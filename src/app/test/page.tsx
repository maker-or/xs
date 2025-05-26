'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Utility function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp!;
  }
  return shuffled;
};

// Question timer component for individual questions
const QuestionTimer = ({
  duration,
  onTimeout,
  isActive
}: {
  duration: number; // in seconds
  onTimeout: () => void;
  isActive: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Reset timer when question becomes active
    setTimeLeft(duration);
    setHasTimedOut(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, isActive]);

  // Handle timeout in a separate useEffect to avoid setState during render
  useEffect(() => {
    if (hasTimedOut) {
      onTimeout();
    }
  }, [hasTimedOut, onTimeout]);

  // Format time as mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-center mb-4">
      <div className="text-lg font-bold text-orange-500">
        Question Time: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

const ExamPage = () => {
  const { isLoaded, isSignedIn, user: _user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<{
    id: string;
    subject: string;
    topic?: string;
    num_questions: number;
    difficulty: string;
    duration: number;
    question_time_limit?: number;
    questions: {
      question: string;
      options: string[];
      original_index?: number;
    }[];
  } | null>(null);
  const [examAvailable, setExamAvailable] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ question_id: number; selected_option: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<{
    message: string;
    score?: number;
    total?: number;
    percentage?: number;
  } | null>(null);

  // New state for shuffled questions and options
  const [shuffledQuestions, setShuffledQuestions] = useState<{
    question: string;
    options: string[];
    originalIndex: number;
    optionMapping: number[]; // Maps shuffled option index to original option index
  }[]>([]);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  console.log(completedQuestions)

  // Check if an exam is available
  const checkExam = useCallback(async () => {
    if (!isSignedIn) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/exams/current');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check for exams');
      }

      setExamAvailable(data.available);

      if (data.available && data.exam) {
        setExam(data.exam);

        // Create shuffled questions with shuffled options
        const questionsWithShuffledOptions = data.exam.questions.map((q: { question: string; options: string[]; original_index?: number }, index: number) => {
          const optionIndices = Array.from({ length: q.options.length }, (_, i) => i);
          const shuffledIndices = shuffleArray(optionIndices);
          const shuffledOptions = shuffledIndices.map((i: number) => q.options[i]!);

          return {
            question: q.question,
            options: shuffledOptions,
            originalIndex: q.original_index ?? index, // Use original_index from API if available
            optionMapping: shuffledIndices
          };
        });

        // Shuffle the questions themselves
        const shuffledQs = shuffleArray(questionsWithShuffledOptions);
        setShuffledQuestions(shuffledQs as typeof questionsWithShuffledOptions);

        // Initialize answers array with empty selections based on original question indices
        setAnswers(data.exam.questions.map((q: { question: string; options: string[]; original_index?: number }, index: number) => ({
          question_id: q.original_index ?? index, // Use original_index for proper mapping
          selected_option: ''
        })));
      } else {
        setExam(null);
        setShuffledQuestions([]);
        // Check if user has already submitted
        setHasSubmitted(!!data.hasSubmitted);
      }
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check for available exams';
      setError(errorMessage);
      setExam(null);
      setExamAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Handle answer selection with shuffled options
  const handleAnswerSelect = (_shuffledOptionIndex: number, option: string) => {
    if (!shuffledQuestions[currentQuestionIndex]) return;

    const currentShuffledQuestion = shuffledQuestions[currentQuestionIndex];
    const originalQuestionIndex = currentShuffledQuestion.originalIndex;

    setAnswers(prev =>
      prev.map(a =>
        a.question_id === originalQuestionIndex ? { ...a, selected_option: option } : a
      )
    );
  };

  // Submit exam function
  const submitExam = useCallback(async () => {
    if (!exam || isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: exam.id,
          answers: answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit exam');
      }

      setSubmissionResult(data);
      setHasSubmitted(true);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit exam';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [exam, answers, isSubmitting]);

  // Navigation functions - updated for new behavior
  const goToNextQuestion = useCallback(() => {
    if (shuffledQuestions.length === 0) return;

    // Mark current question as completed
    if (shuffledQuestions[currentQuestionIndex]) {
      const originalIndex = shuffledQuestions[currentQuestionIndex].originalIndex;
      setCompletedQuestions(prev => new Set([...prev, originalIndex]));
    }

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - submit exam
      submitExam();
    }
  }, [shuffledQuestions, currentQuestionIndex, submitExam]);

  // Handle question timeout - auto advance to next question
  const handleQuestionTimeout = useCallback(() => {
    // Mark current question as completed
    if (shuffledQuestions[currentQuestionIndex]) {
      const originalIndex = shuffledQuestions[currentQuestionIndex].originalIndex;
      setCompletedQuestions(prev => new Set([...prev, originalIndex]));
    }

    // Move to next question
    goToNextQuestion();
  }, [shuffledQuestions, currentQuestionIndex, goToNextQuestion]);

  // Check for exam when component mounts or user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkExam();
    }
  }, [isLoaded, isSignedIn, checkExam]);

  // Redirect to auth if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/redirect');
    }
  }, [isLoaded, isSignedIn, router]);

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-500">Error</h1>
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={checkExam}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-md font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Submission result state
  if (submissionResult) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-6 text-green-500">Exam Submitted!</h1>
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <p className="text-xl mb-4">{submissionResult.message}</p>
            {submissionResult.score !== undefined && (
              <div className="text-2xl font-bold">
                Score: {submissionResult.score}/{submissionResult.total} ({submissionResult.percentage}%)
              </div>
            )}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-md font-semibold text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No exam available or already submitted
  if (!examAvailable || hasSubmitted) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            {hasSubmitted ? 'Exam Already Submitted' : 'No Exam Available'}
          </h1>
          <p className="text-xl mb-6">
            {hasSubmitted
              ? 'You have already submitted your exam. Thank you!'
              : 'There are currently no exams available for you to take.'
            }
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-md font-semibold text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main exam interface
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {examAvailable && exam && shuffledQuestions.length > 0 && (
        <div className="flex min-h-screen">
          {/* Main content */}
          <div className="flex items-center justify-center w-full">
            <form onSubmit={(e) => { e.preventDefault(); submitExam(); }} className="max-w-3xl mx-auto">
              {/* Question Timer */}
              <QuestionTimer
                key={currentQuestionIndex} // Reset timer when question changes
                duration={exam.question_time_limit || 30}
                onTimeout={handleQuestionTimeout}
                isActive={true}
              />

              {/* Question Progress */}
              <div className="text-center mb-6">
                <span className="text-lg font-medium text-gray-300">
                  Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                </span>
              </div>

              {/* Display only the current shuffled question */}
              {shuffledQuestions[currentQuestionIndex] && (
                <div>
                  <h2 className="text-2xl text-[#f7eee3] font-bold mb-8">
                    {shuffledQuestions[currentQuestionIndex]?.question}
                  </h2>
                  <div className="space-y-3">
                    {shuffledQuestions[currentQuestionIndex]?.options.map((option, oIndex) => {
                      const originalQuestionIndex = shuffledQuestions[currentQuestionIndex]?.originalIndex ?? 0;
                      const answerForThisQuestion = answers.find(a => a.question_id === originalQuestionIndex);
                      const isSelected = answerForThisQuestion?.selected_option === option;

                      return (
                        <label
                          key={oIndex}
                          className={`block p-4 border rounded-md cursor-pointer hover:text-[#f7eee3] ${
                            isSelected
                              ? 'bg-[#683D24] border-[#FF5E00] '
                              : 'bg-[#F7EEE3] hover:bg-[#0c0c0c] text-black'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex bg-[#0C0C0C] text-[#f7eee3] items-center justify-center mr-3 rounded-md border font-medium">
                              {String.fromCharCode(65 + oIndex)}
                            </div>
                            <input
                              type="radio"
                              name={`question-${currentQuestionIndex}`}
                              value={option}
                              checked={isSelected}
                              onChange={() => handleAnswerSelect(oIndex, option)}
                              className="hidden"
                            />
                            <span>{option}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex justify-center mt-8">
                    {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-md font-semibold text-lg disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={goToNextQuestion}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-md font-medium"
                      >
                        Next Question →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;