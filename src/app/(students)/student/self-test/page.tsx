'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export default function SelfTestPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);

  const handleStartTest = async () => {
    setLoading(true);
    
    try {
      // Submit to API endpoint
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          topic,
          numberOfQuestions,
          difficulty,
          time: duration
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test');
      }
      
      // Redirect to test page with the test data
      const data = await response.json();
      router.push('/test?id=' + data.id); // Adjust based on your actual response structure
      
    } catch (error) {
      console.error('Error creating test:', error);
      // Handle error (you could add a state for error messages)
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-[#0c0c0c] text-white">
      <div className="flex flex-col items-center w-full max-w-md">
        <h1 className="text-4xl font-serif mb-10 text-center">Test yourself?</h1>
        
        <div className="w-full space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2 uppercase">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 bg-[#1a2422] rounded-md text-white border-0"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2 uppercase">No of questions</label>
            <input
              type="number"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
              min={1}
              max={20}
              className="w-full p-3 bg-[#1a2422] rounded-md text-white border-0"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2 uppercase">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 bg-[#1a2422] rounded-md text-white border-0"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2 uppercase">Duration(min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              min={1}
              className="w-full p-3 bg-[#1a2422] rounded-md text-white border-0"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2 uppercase">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full p-3 bg-[#1a2422] rounded-md text-white border-0"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleStartTest}
            disabled={loading || !subject.trim()}
            className="w-full py-4 mt-4 bg-[#F28C38] text-white rounded-md hover:bg-[#E07B2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Test...' : 'Start Test →'}
          </button>
        </div>
      </div>
    </main>
  );
} 