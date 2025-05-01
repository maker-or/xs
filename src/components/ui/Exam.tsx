import React, { useState, useEffect } from 'react';
import { Menu, CheckCircle ,PanelLeft,MoveLeft,MoveRight} from 'lucide-react';

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
      return examState.answers[index] === question.correctAnswer ? score + 1 : score;
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
    <div className="relative h-screen flex flex-col bg-[#0c0c0c] text-[#FFFFFF]">
      {/* Header with timer and menu button */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
        <button onClick={toggleSidebar} className="p-2">
         
          <PanelLeft size={24} />
        </button>
        <span className="font-bold text-lg">
          {formatTime(examState.timeRemaining)}
        </span>
      </div>

      {/* Main content */}
      {!examState.examCompleted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-8 text-left">
              {currentQuestion.text}
            </h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 rounded-md border cursor-pointer transition-colors flex items-center ${
                    examState.answers[examState.currentQuestionIndex] === index
                      ? 'bg-[#683D24] border-[#F28C38] text-[#FFFFFF]'
                      : 'bg-[#E5E5E5] border-[#E5E5E5] text-[#000000] hover:bg-[#683D24] hover:border-[#F28C38] hover:text-[#FFFFFF]'
                  }`}
                >
                  <div className="h-10 w-10 bg-[#000000] text-[#FFFFFF] flex items-center justify-center mr-2 rounded-sm">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handlePrevQuestion}
                disabled={examState.currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-md transition-colors ${
                  examState.currentQuestionIndex === 0
                    ? 'bg-[#2A3435] text-gray-400'
                    : 'bg-[#F28C38] hover:bg-[#E07B2A] text-white'
                }`}
              >
                <MoveLeft />
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-[#F28C38] text-white rounded-md hover:bg-[#E07B2A] transition-colors"
              >
                {examState.currentQuestionIndex === questions.length - 1
                  ? 'Finish'
                  : <MoveRight />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Results view
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center p-3 text-[#FFFFFF]">
            <div className="mb-6">
              <div className="h-24 w-24 rounded-full bg-[#2A3435] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-[#F28C38]" />
              </div>
              <h2 className="text-2xl font-bold">Exam Completed!</h2>
            </div>
            <div className="bg-[#2A3435] p-6 rounded-lg mb-6">
              <p className="text-lg mb-2">Your Score:</p>
              <p className="text-4xl font-bold">
                {calculateScore()} / {questions.length}
              </p>
              <p className="text-gray-400 mt-2">
                {Math.round((calculateScore() / questions.length) * 100)}%
              </p>
            </div>
            <button
              className="px-6 py-3 bg-[#F28C38] text-white rounded-md hover:bg-[#E07B2A] w-full transition-colors"
              onClick={onComplete}
            >
              Start Another Test
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {examState.showSidebar && !examState.examCompleted && (
        <div className="absolute inset-0 z-10 flex">
          <div className="w-72 h-[95svh] bg-[#0c0c0c] rounded-lg border-2 border-[#363636] shadow-lg overflow-auto">
            <div className="p-4 border-b border-[#1C2526]">
              <h3 className="font-bold text-[#f7eee3]">Question&#39;s</h3>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors ${
                    examState.currentQuestionIndex === index
                      ? 'bg-[#683D24] border-2 border-[#C9520D] text-white'
                      : examState.answers[index] !== null
                      ? 'bg-green-600 border-2 border-[#4FFF8F] text-white'
                      : 'bg-[#1C2526] hover:bg-[#3A4445] text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div
            className="bg-[#0c0c0c] bg-opacity-50 flex-1"
            onClick={toggleSidebar}
          />
        </div>
      )}
    </div>
  );
};