import { CheckCircle, MoveLeft, MoveRight, PanelLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Define types for our data structures
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface ExamState {
  currentQuestionIndex: number;
  answers: (number | null)[];
  timeRemaining: number;
  showSidebar: boolean;
  examCompleted: boolean;
}

interface ExamProps {
  questions: Question[];
  duration: number;
  onComplete: () => void;
}

export const Exam = ({ questions, duration, onComplete }: ExamProps) => {
  // Initialize exam state
  const [examState, setExamState] = useState<ExamState>({
    currentQuestionIndex: 0,
    answers: Array(questions.length).fill(null),
    timeRemaining: duration,
    showSidebar: false,
    examCompleted: false,
  });

  // Timer effect
  useEffect(() => {
    if (examState.timeRemaining <= 0 || examState.examCompleted) {
      finishExam();
      return;
    }

    const timer = setInterval(() => {
      setExamState((prev) => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [examState.timeRemaining, examState.examCompleted]);

  // Calculate score when exam is completed
  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return examState.answers[index] === question.correctAnswer
        ? score + 1
        : score;
    }, 0);
  };

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...examState.answers];
    newAnswers[examState.currentQuestionIndex] = optionIndex;
    setExamState((prev) => ({
      ...prev,
      answers: newAnswers,
    }));
  };

  // Navigate to specific question
  const navigateToQuestion = (index: number) => {
    setExamState((prev) => ({
      ...prev,
      currentQuestionIndex: index,
      showSidebar: false,
    }));
  };

  // Handle next question navigation
  const handleNextQuestion = () => {
    if (examState.currentQuestionIndex < questions.length - 1) {
      setExamState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      finishExam();
    }
  };

  // Handle previous question navigation
  const handlePrevQuestion = () => {
    if (examState.currentQuestionIndex > 0) {
      setExamState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setExamState((prev) => ({
      ...prev,
      showSidebar: !prev.showSidebar,
    }));
  };

  // Finish the exam
  const finishExam = () => {
    setExamState((prev) => ({
      ...prev,
      examCompleted: true,
    }));
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[examState.currentQuestionIndex] || {
    id: 0,
    text: '',
    options: [],
    correctAnswer: 0,
  };

  return (
    <div className="relative flex h-screen flex-col bg-[#000000] text-[#FFFFFF]">
      {/* Header with timer and menu button */}
      <div className="absolute top-0 right-0 left-0 flex items-center justify-between p-4">
        <button className="p-2" onClick={toggleSidebar}>
          <PanelLeft size={24} />
        </button>
        <span className="font-bold text-lg">
          {formatTime(examState.timeRemaining)}
        </span>
      </div>

      {/* Main content */}
      {examState.examCompleted ? (
        // Results view
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md p-3 text-center text-[#FFFFFF]">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#2A3435]">
                <CheckCircle className="text-[#F28C38]" size={48} />
              </div>
              <h2 className="font-bold text-2xl">Exam Completed!</h2>
            </div>
            <div className="mb-6 rounded-lg bg-[#2A3435] p-6">
              <p className="mb-2 text-lg">Your Score:</p>
              <p className="font-bold text-4xl">
                {calculateScore()} / {questions.length}
              </p>
              <p className="mt-2 text-gray-400">
                {Math.round((calculateScore() / questions.length) * 100)}%
              </p>
            </div>
            <button
              className="w-full rounded-md bg-[#F28C38] px-6 py-3 text-white transition-colors hover:bg-[#E07B2A]"
              onClick={onComplete}
            >
              Start Another Test
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <h2 className="mb-8 text-left font-bold text-2xl">
              {currentQuestion.text}
            </h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <div
                  className={`flex cursor-pointer items-center rounded-md border p-4 transition-colors ${
                    examState.answers[examState.currentQuestionIndex] === index
                      ? 'border-[#F28C38] bg-[#683D24] text-[#FFFFFF]'
                      : 'border-[#E5E5E5] bg-[#E5E5E5] text-[#000000] hover:border-[#F28C38] hover:bg-[#683D24] hover:text-[#FFFFFF]'
                  }`}
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-sm bg-[#000000] text-[#FFFFFF]">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                className={`rounded-md px-6 py-2 transition-colors ${
                  examState.currentQuestionIndex === 0
                    ? 'bg-[#2A3435] text-gray-400'
                    : 'bg-[#F28C38] text-white hover:bg-[#E07B2A]'
                }`}
                disabled={examState.currentQuestionIndex === 0}
                onClick={handlePrevQuestion}
              >
                <MoveLeft />
              </button>
              <button
                className="rounded-md bg-[#F28C38] px-6 py-2 text-white transition-colors hover:bg-[#E07B2A]"
                onClick={handleNextQuestion}
              >
                {examState.currentQuestionIndex === questions.length - 1 ? (
                  'Finish'
                ) : (
                  <MoveRight />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {examState.showSidebar && !examState.examCompleted && (
        <div className="absolute inset-0 z-10 flex">
          <div className="h-[95svh] w-72 overflow-auto rounded-lg border-2 border-[#363636] bg-[#000000] shadow-lg">
            <div className="border-[#1C2526] border-b p-4">
              <h3 className="font-bold text-[#f7eee3]">Question&#39;s</h3>
            </div>
            <div className="grid grid-cols-5 gap-2 p-4">
              {questions.map((_, index) => (
                <button
                  className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
                    examState.currentQuestionIndex === index
                      ? 'border-2 border-[#C9520D] bg-[#683D24] text-white'
                      : examState.answers[index] !== null
                        ? 'border-2 border-[#4FFF8F] bg-green-600 text-white'
                        : 'bg-[#1C2526] text-white hover:bg-[#3A4445]'
                  }`}
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex-1 bg-[#000000] bg-opacity-50"
            onClick={toggleSidebar}
          />
        </div>
      )}
    </div>
  );
};
