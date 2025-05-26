"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '~/components/ui/Navbar';
import { DownloadSimple } from "@phosphor-icons/react";

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-serif  mb-6 text-gray-800 dark:text-white">Exam Results</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="rounded-lg shadow mb-8">
            <div className="mb-6">

              <div className="relative">
                <select
                  id="exam-select"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF5E00]  font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-gray-500"
                  disabled={loading && exams.length === 0}
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">
                    -- Select an exam --
                  </option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-[#1a1a1a]">
                      {exam.subject} {exam.topic ? `- ${exam.topic}` : ''} ({formatDate(exam.starts_at)})
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}

            {!loading && selectedExam && results.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">None of the students have submitted the exam yet!!</p>
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
                      className="px-4 py-2  text-white rounded-md underline hover:text-[#FF5E00] transition-colors"
                    >
                     <DownloadSimple size={32} />
                    </a>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 dark:border-[#3e3e3e]">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-[#1f1f1f]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Student
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Percentage
                        </th>
                        {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Submission Time
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#000000] divide-y divide-gray-200 dark:divide-gray-700">
                      {results.map((result) => (
                        <tr key={result.id} className="  transition-colors cursor-pointer">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {result.email.split('@')[0]}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {result.score} / {result.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${result.percentage >= 75
                                ? 'bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-900'
                                : result.percentage >= 60
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-200 dark:text-yellow-900'
                                  : 'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-900'
                              }`}>
                              {result.percentage}%
                            </span>
                          </td>
                          {/* <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(result.submitted_at)}
                          </td> */}
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
              className="px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 dark:text-gray-200  hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Back to Dashboard
            </button>

            <button
              onClick={() => router.push('/teacher/exams')}
              className="px-4 py-2 text-sm bg-[#FF5E00] border border-transparent rounded-md shadow-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
