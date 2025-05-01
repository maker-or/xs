'use client';
import React, { useState } from 'react';
import { Exam } from '~/components/ui/Exam';

// Interface for the form data
interface TestFormData {
  subject: string;
  topic: string;
  numberOfQuestions: number;
  duration: number;
  difficulty: string;
}

// Interface for the questions received from API
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const Page = () => {
  const [formData, setFormData] = useState<TestFormData>({
    subject: '',
    topic: '',
    numberOfQuestions: 10,
    duration: 15,
    difficulty: 'medium',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfQuestions' || name === 'duration' 
        ? parseInt(value, 10) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          difficulty: formData.difficulty,
          numberOfQuestions: formData.numberOfQuestions,
          time: formData.duration,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test');
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setQuestions(null);
  };

  if (questions) {
    return (
      <div className="h-screen">
        <Exam 
          questions={questions}
          duration={formData.duration * 60} // Convert minutes to seconds
          onComplete={resetTest}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
      <div className="w-1/2 p-6">
        {/* Header */}
        <h1 className="text-3xl h-full md:text-4xl  text-[#f7eee3] mb-10 text-center font-serif">
          Test yourself?
        </h1>

        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div>
              <label htmlFor="subject" className="block text-[#727171] font-medium text-md  mb-1 tracking-wide">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-[#181818] text-[#727171]  border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-[#424242] placeholder-opacity-0"
              />
            </div>

            <div>
              <label htmlFor="numberOfQuestions" className="block text-[#727171]  text-md   mb-1 tracking-wide">
                No of questions
              </label>
              <input
                type="number"
                id="numberOfQuestions"
                name="numberOfQuestions"
                min="1"
                max="50"
                required
                value={formData.numberOfQuestions}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-[#181818] text-[#727171]  border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-[#424242] placeholder-opacity-0"
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-[#727171]  text-md  mb-1 tracking-wide">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                required
                value={formData.topic}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-[#181818] text-[#f7eee3] border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-[#424242] placeholder-opacity-0"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-[#727171]  text-md   mb-1 tracking-wide">
                Duration (min)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                max="120"
                required
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-[#181818] text-[#727171]  border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-[#424242] placeholder-opacity-0"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="difficulty" className="block text-[#f7eee3] text-md   mb-1 tracking-wide">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                required
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-[#181818] text-[#f7eee3] border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-[#424242] appearance-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-[#1C2526] bg-[#C9520D]  hover:bg-orange-500 transition-colors duration-200 flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1C2526]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Test...
              </>
            ) : (
              'Start Test →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;