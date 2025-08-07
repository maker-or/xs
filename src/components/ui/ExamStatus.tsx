'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './button';

interface Exam {
  id: string;
  subject: string;
  topic?: string;
  num_questions: number;
  difficulty: string;
  duration: number;
}

const ExamStatus = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examAvailable, setExamAvailable] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Function to check for available exams
  const checkExam = useCallback(async () => {
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
      } else {
        setExam(null);
        // Check if user has already submitted
        setHasSubmitted(!!data.hasSubmitted);
      }
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to check for available exams';
      setError(errorMessage);
      setExam(null);
      setExamAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for available exams when component mounts
  useEffect(() => {
    checkExam();
  }, [checkExam]);

  // Navigate to exam page
  const startExam = () => {
    router.push('/test');
  };

  // Loading state
  if (loading) {
    return (
      <div className="my-4 w-full animate-pulse rounded-lg bg-gray-800/50 p-6">
        <div className="mb-4 h-7 w-1/3 rounded bg-gray-700" />
        <div className="mb-2 h-4 w-4/5 rounded bg-gray-700" />
        <div className="mb-4 h-4 w-2/3 rounded bg-gray-700" />
        <div className="h-10 w-1/4 rounded bg-gray-700" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="my-4 w-full rounded-lg border border-red-500 bg-red-900/30 p-6">
        <h3 className="mb-2 font-medium text-lg text-red-300">
          Error checking exam status
        </h3>
        <p className="text-red-200">{error}</p>
        <Button
          className="mt-4 bg-red-600 hover:bg-red-700"
          onClick={checkExam}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // No active exam, but has submitted an exam
  if (!examAvailable && hasSubmitted) {
    return (
      <div className="my-4 w-full rounded-lg bg-gray-800/50 p-6">
        <h3 className="mb-3 font-semibold text-xl">Exam Submitted</h3>
        <p className="mb-4 text-gray-300">
          You have already submitted your exam. Your teacher will review the
          results.
        </p>
        <Button className="text-sm" onClick={checkExam} variant="outline">
          Refresh Status
        </Button>
      </div>
    );
  }

  // Available exam
  if (examAvailable && exam) {
    return (
      <div className="my-4 w-full rounded-lg border p-6 ">
        <div className="flex items-start justify-between">
          <div>
            <span className="mb-3 inline-block rounded-full px-3 py-1 font-medium text-xs">
              Available Now
            </span>
            <h3 className="mb-1 font-bold text-xl">{exam.subject}</h3>
            {exam.topic && (
              <p className="mb-3 text-gray-300">Topic: {exam.topic}</p>
            )}
            <div className="mt-3 mb-4 flex flex-wrap gap-3 text-xs">
              <span className="rounded-full bg-gray-700/70 px-3 py-1">
                {exam.num_questions} Questions
              </span>
              <span className="rounded-full bg-gray-700/70 px-3 py-1 capitalize">
                {exam.difficulty} Difficulty
              </span>
              <span className="rounded-full bg-gray-700/70 px-3 py-1">
                {exam.duration} Minutes
              </span>
            </div>
          </div>
        </div>

        <Button
          className="mt-2 bg-blue-600 hover:bg-blue-700"
          onClick={startExam}
        >
          Start Exam
        </Button>
      </div>
    );
  }

  // No active exam
  return (
    <div className="my-4 w-fullrounded-lg p-6">
      <h3 className="mb-3 font-semibold text-xl">No Active Exams</h3>
      <p className="mb-4 text-gray-300">
        You don&apos;t have any exams available at this time. Check back later
        or contact your teacher.
      </p>
      <Button className="text-sm" onClick={checkExam} variant="outline">
        Refresh Status
      </Button>
    </div>
  );
};

export default ExamStatus;
