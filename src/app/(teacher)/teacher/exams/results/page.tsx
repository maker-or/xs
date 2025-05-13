"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '~/components/ui/Navbar';

interface ExamResult {
  id: string;
  exam_id: string;
  user_id: string;
  email: string;
  score: number;
  total: number;
  percentage: number;
  submitted_at: string;
}

interface Exam {
  id: string;
  subject: string;
  topic?: string;
  num_questions: number;
  difficulty: string;
  duration: number;
  starts_at: string;
  ends_at: string;
}

export default function ExamResultsPage() {
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvDownloadUrl, setCsvDownloadUrl] = useState<string | null>(null);
  
  // Fetch all exams created by the teacher
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/exams');
        
        if (!response.ok) {
          throw new Error('Failed to fetch exams');
        }
        
        const data = await response.json();
        setExams(data.exams || []);
      } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching exams';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, []);
  
  // Fetch results when an exam is selected
  useEffect(() => {
    if (!selectedExam) {
      setResults([]);
      setCsvDownloadUrl(null);
      return;
    }
    
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/exams/results?exam_id=${selectedExam}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch exam results');
        }
        
        const data = await response.json();
        setResults(data.results || []);
        
        // Set the CSV download URL
        setCsvDownloadUrl(`/api/exams/results/csv?exam_id=${selectedExam}`);
      } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching results';
        setError(errorMessage);
        setResults([]);
        setCsvDownloadUrl(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [selectedExam]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Exam Results</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <div className="mb-6">
              <label htmlFor="exam-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select an exam
              </label>
              <select
                id="exam-select"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                disabled={loading && exams.length === 0}
              >
                <option value="">-- Select an exam --</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.subject} {exam.topic ? `- ${exam.topic}` : ''} ({formatDate(exam.starts_at)})
                  </option>
                ))}
              </select>
            </div>
            
            {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}
            
            {!loading && selectedExam && results.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">No results found for this exam.</p>
            )}
            
            {!loading && selectedExam && results.length > 0 && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {results.length} {results.length === 1 ? 'Student' : 'Students'} Submitted
                  </h3>
                  
                  {csvDownloadUrl && (
                    <a
                      href={csvDownloadUrl}
                      download
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Download CSV
                    </a>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Submission Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {result.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {result.score} / {result.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                result.percentage >= 75 ? 'bg-green-100 text-green-800' :
                                result.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {result.percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(result.submitted_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/teacher')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/teacher/exams')}
              className="px-4 py-2 text-sm bg-blue-600 border border-transparent rounded-md shadow-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
