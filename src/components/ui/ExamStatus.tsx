"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to check for available exams';
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
      <div className="w-full bg-gray-800/50 rounded-lg p-6 my-4 animate-pulse">
        <div className="h-7 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-4/5 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="h-10 bg-gray-700 rounded w-1/4"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-red-900/30 border border-red-500 rounded-lg p-6 my-4">
        <h3 className="text-lg font-medium text-red-300 mb-2">Error checking exam status</h3>
        <p className="text-red-200">{error}</p>
        <Button 
          onClick={checkExam}
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // No active exam, but has submitted an exam
  if (!examAvailable && hasSubmitted) {
    return (
      <div className="w-full bg-gray-800/50 rounded-lg p-6 my-4">
        <h3 className="text-xl font-semibold mb-3">Exam Submitted</h3>
        <p className="text-gray-300 mb-4">
          You have already submitted your exam. Your teacher will review the results.
        </p>
        <Button 
          onClick={checkExam}
          variant="outline"
          className="text-sm"
        >
          Refresh Status
        </Button>
      </div>
    );
  }

  // Available exam
  if (examAvailable && exam) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-900/50 to-indigo-900/30 rounded-lg p-6 my-4 border border-blue-700/50">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-3 py-1 text-xs font-medium bg-blue-600 rounded-full mb-3 inline-block">
              Available Now
            </span>
            <h3 className="text-xl font-bold mb-1">{exam.subject}</h3>
            {exam.topic && <p className="text-gray-300 mb-3">Topic: {exam.topic}</p>}
            <div className="flex flex-wrap gap-3 text-xs mt-3 mb-4">
              <span className="bg-gray-700/70 px-3 py-1 rounded-full">
                {exam.num_questions} Questions
              </span>
              <span className="bg-gray-700/70 px-3 py-1 rounded-full capitalize">
                {exam.difficulty} Difficulty
              </span>
              <span className="bg-gray-700/70 px-3 py-1 rounded-full">
                {exam.duration} Minutes
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={startExam}
          className="mt-2 bg-blue-600 hover:bg-blue-700"
        >
          Start Exam
        </Button>
      </div>
    );
  }

  // No active exam
  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-6 my-4">
      <h3 className="text-xl font-semibold mb-3">No Active Exams</h3>
      <p className="text-gray-300 mb-4">
        You don&apos;t have any exams available at this time. Check back later or contact your teacher.
      </p>
      <Button 
        onClick={checkExam}
        variant="outline"
        className="text-sm"
      >
        Refresh Status
      </Button>
    </div>
  );
};

export default ExamStatus;
