'use client';

import { DownloadSimple } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
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
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching exams';
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
        const response = await fetch(
          `/api/exams/results?exam_id=${selectedExam}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch exam results');
        }

        const data = await response.json();
        setResults(data.results || []);

        // Set the CSV download URL
        setCsvDownloadUrl(`/api/exams/results/csv?exam_id=${selectedExam}`);
      } catch (err: Error | unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching results';
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
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 font-serif text-2xl text-gray-800 dark:text-white">
            Exam Results
          </h1>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <div className="mb-8 rounded-lg shadow">
            <div className="mb-6">
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 font-medium text-base text-gray-900 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E00] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-gray-100 dark:hover:border-gray-500"
                  disabled={loading && exams.length === 0}
                  id="exam-select"
                  onChange={(e) => setSelectedExam(e.target.value)}
                  value={selectedExam}
                >
                  <option className="text-gray-500 dark:text-gray-400" value="">
                    -- Select an exam --
                  </option>
                  {exams.map((exam) => (
                    <option
                      className="bg-white text-gray-900 dark:bg-[#1a1a1a] dark:text-gray-100"
                      key={exam.id}
                      value={exam.id}
                    >
                      {exam.subject} {exam.topic ? `- ${exam.topic}` : ''} (
                      {formatDate(exam.starts_at)})
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {loading && (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            )}

            {!loading && selectedExam && results.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                None of the students have submitted the exam yet!!
              </p>
            )}

            {!loading && selectedExam && results.length > 0 && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {results.length}{' '}
                    {results.length === 1 ? 'Student' : 'Students'} Submitted
                  </h3>

                  {csvDownloadUrl && (
                    <a
                      className="rounded-md px-4 py-2 text-white underline transition-colors hover:text-[#FF5E00]"
                      download
                      href={csvDownloadUrl}
                    >
                      <DownloadSimple size={32} />
                    </a>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm dark:border-[#3e3e3e]">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-[#1f1f1f]">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase dark:text-gray-300">
                          Student
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase dark:text-gray-300">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase dark:text-gray-300">
                          Percentage
                        </th>
                        {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          Submission Time
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-[#000000]">
                      {results.map((result) => (
                        <tr
                          className=" cursor-pointer transition-colors"
                          key={result.id}
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 text-sm dark:text-white">
                            {result.email.split('@')[0]}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-800 text-sm dark:text-gray-200">
                            {result.score} / {result.total}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 font-semibold text-xs ${
                                result.percentage >= 75
                                  ? 'bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-900'
                                  : result.percentage >= 60
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-200 dark:text-yellow-900'
                                    : 'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-900'
                              }`}
                            >
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
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 text-sm shadow-sm hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => router.push('/teacher')}
            >
              Back to Dashboard
            </button>

            <button
              className="rounded-md border border-transparent bg-[#FF5E00] px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => router.push('/teacher/exams')}
            >
              Create New Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
