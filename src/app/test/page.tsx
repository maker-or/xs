'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Timer component for exam countdown
const ExamTimer = ({ 
  duration, 
  onTimeout 
}: { 
  duration: number, // in seconds
  onTimeout: () => void 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    // Initialize timer with provided duration
    setTimeLeft(duration);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [duration, onTimeout]);
  
  // Format time as mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="fixed top-5 right-5 text-white py-2 px-4 rounded-md">
      <div className="text-right">{formattedTime}</div>
    </div>
  );
};

const Page = () => {
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
    questions: {
      question: string;
      options: string[];
    }[];
  } | null>(null);
  const [examAvailable, setExamAvailable] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ question_id: number, selected_option: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<{
    message: string;
    score?: number;
    total?: number;
    percentage?: number;
  } | null>(null);

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
        // Initialize answers array with empty selections
        setAnswers(data.exam.questions.map((q: { question: string; options: string[] }, index: number) => ({
          question_id: index,
          selected_option: ''
        })));
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
  }, [isSignedIn]);
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: number, option: string) => {
    setAnswers(prev => 
      prev.map(a => 
        a.question_id === questionId ? { ...a, selected_option: option } : a
      )
    );
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (exam && index >= 0 && index < exam.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  // Submit the exam
  const submitExam = async () => {
    if (!exam || !exam.id) return;
    
    // Check if all questions have been answered
    const unanswered = answers.filter(a => !a.selected_option).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }
    
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
          answers: answers
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setSubmissionResult(result);
      setExamAvailable(false);
      setHasSubmitted(true);
      
    } catch (err: Error | unknown) {
      setError('Failed to submit exam. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle timer timeout
  const handleTimeout = () => {
    alert('Time is up! Your exam will be submitted automatically.');
    submitExam();
  };
  
  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/redirect');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Check for exams when component mounts
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkExam();
    }
  }, [isLoaded, isSignedIn, checkExam]);
  
  if (!isLoaded || !isSignedIn) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#0c0c0c] text-white">
      {!examAvailable && !hasSubmitted && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-2xl text-center">
            <p className="text-lg mb-4">
              Check if you have any exams available today.
            </p>
            <button 
              onClick={checkExam}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
      
      {!examAvailable && hasSubmitted && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-2xl bg-gray-800 rounded-md p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Already Submitted</h2>
            {submissionResult ? (
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">{submissionResult.message}</p>
                <p>Thank you for completing the exam.</p>
              </div>
            ) : (
              <p>You have already submitted this exam. You cannot retake it.</p>
            )}
          </div>
        </div>
      )}
      
      {examAvailable && exam && (
        <div className="flex min-h-screen">
          {/* Question sidebar */}
          <div className="w-64 bg-gray-800 p-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Question's</h3>
              <div className="grid grid-cols-3 gap-2">
                {exam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`h-10 w-10 flex items-center justify-center rounded-md font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-orange-500'
                        : answers[index]?.selected_option
                        ? 'bg-green-600'
                        : 'bg-green-500'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">{exam.subject}</h1>
              {exam.topic && <p className="text-gray-300">Topic: {exam.topic}</p>}
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); submitExam(); }} className="max-w-3xl mx-auto">
              {/* Display only the current question */}
              {exam.questions[currentQuestionIndex] && (
                <div>
                  <h2 className="text-2xl font-bold mb-8">
                    {exam.questions[currentQuestionIndex].question}
                  </h2>
                  <div className="space-y-3">
                    {exam.questions[currentQuestionIndex].options.map((option, oIndex) => (
                      <label 
                        key={oIndex} 
                        className={`block p-4 border rounded-md cursor-pointer ${
                          answers[currentQuestionIndex]?.selected_option === option
                            ? 'bg-orange-800 border-orange-500'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center mr-3 rounded-md border font-medium">
                            {String.fromCharCode(65 + oIndex)}
                          </div>
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={option}
                            checked={answers[currentQuestionIndex]?.selected_option === option}
                            onChange={() => handleAnswerSelect(currentQuestionIndex, option)}
                            className="hidden"
                          />
                          <span>{option}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={goToPrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md font-medium disabled:opacity-50"
                    >
                      ← Previous
                    </button>
                    
                    {currentQuestionIndex === exam.questions.length - 1 ? (
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
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      
      {!examAvailable && !hasSubmitted && !loading && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-gray-400 italic">
            No exam is currently available. Check back later or contact your teacher.
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
