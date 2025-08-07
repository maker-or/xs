'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import Navbar from '~/components/ui/Navbar';

// Form validation schema
const examFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  num_questions: z
    .number()
    .int()
    .min(1, 'Number of questions must be at least 1')
    .max(50, 'Maximum 50 questions'),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  duration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(180, 'Maximum 3 hours'),
  question_time_limit: z
    .number()
    .int()
    .min(10, 'Question time limit must be at least 10 seconds')
    .max(300, 'Maximum 5 minutes per question'),
  starts_at: z.string().min(1, 'Start date and time is required'),
  ends_at: z.string().min(1, 'End date and time is required'),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

export default function ExamCreationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<ExamFormValues>>({
    subject: '',
    topic: '',
    num_questions: 10,
    difficulty: 'medium',
    duration: 60,
    question_time_limit: 30,
    starts_at: '',
    ends_at: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle numeric inputs
    if (
      name === 'num_questions' ||
      name === 'duration' ||
      name === 'question_time_limit'
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: Number.parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type (must be CSV)
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setCsvError('Please upload a CSV file');
        setCsvFile(null);
        return;
      }

      setCsvFile(file);
      setCsvError(null);
    } else {
      setCsvFile(null);
    }
  };

  const validateForm = (): boolean => {
    try {
      // Convert date strings to Date objects for validation
      const formDataForValidation = {
        ...formData,
        starts_at: formData.starts_at || '',
        ends_at: formData.ends_at || '',
      };

      examFormSchema.parse(formDataForValidation);

      // Additional validation for start/end dates
      const startDate = new Date(formData.starts_at || '');
      const endDate = new Date(formData.ends_at || '');

      if (endDate <= startDate) {
        setFormErrors((prev) => ({
          ...prev,
          ends_at: 'End date must be after start date',
        }));
        return false;
      }

      // CSV file validation
      if (!csvFile) {
        setCsvError('Please upload a CSV file with student identifiers');
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(null);
    setError(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const data = new FormData();

      // Append form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });

      // Append CSV file
      if (csvFile) {
        data.append('students_csv', csvFile);
      }

      // Submit the form data
      const response = await fetch('/api/exams/create', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create exam');
      }

      setSuccess(
        `Exam created successfully! ${result.num_questions} questions were generated for ${result.num_students} students.`
      );

      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/teacher'); // Or redirect to a dashboard or exam list page
      }, 3000);
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow dark:bg-[#000000]">
          <h1 className="mb-6 font-bold text-2xl text-gray-800 dark:text-white">
            Create New Exam
          </h1>

          {success && (
            <div className="-green-400 mb-4 rounded bg-green-100 p-3 text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="-red-400 mb-4 rounded bg-red-100 p-3 text-green-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="col-span-2">
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Subject
                </label>
                <input
                  className={`w-full rounded-md p-2 ${formErrors.subject ? ' -red-500' : ' -gray-300 '} placeholder:text-[#818181] dark:bg-[#181818]`}
                  name="subject"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.subject}
                />
                {formErrors.subject && (
                  <p className="mt-1 text-red-500 text-xs">
                    {formErrors.subject}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Topic (Optional)
                </label>
                <input
                  className="-gray-300 w-full rounded-md p-2 placeholder:text-[#818181] dark:bg-[#181818]"
                  name="topic"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.topic}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Number of Questions
                </label>
                <input
                  className={`w-full rounded-md p-2 ${formErrors.num_questions ? ' -red-500' : ' -gray-300 '} dark:bg-[#181818]`}
                  max="50"
                  min="1"
                  name="num_questions"
                  onChange={handleInputChange}
                  type="number"
                  value={formData.num_questions}
                />
                {formErrors.num_questions && (
                  <p className="mt-1 text-red-500 text-xs">
                    {formErrors.num_questions}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Difficulty Level
                </label>
                <select
                  className={`w-full rounded-md p-2 ${formErrors.difficulty ? ' -red-500' : ' -gray-300 '} dark:bg-[#181818]`}
                  name="difficulty"
                  onChange={handleInputChange}
                  value={formData.difficulty}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {formErrors.difficulty && (
                  <p className="mt-1 text-red-500 text-xs">
                    {formErrors.difficulty}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Duration (minutes)
                </label>
                <input
                  className={`w-full rounded-md p-2 ${formErrors.duration ? ' -red-500' : ' -gray-300 '} dark:bg-[#181818]`}
                  max="180"
                  min="5"
                  name="duration"
                  onChange={handleInputChange}
                  type="number"
                  value={formData.duration}
                />
                {formErrors.duration && (
                  <p className="mt-1 text-red-500 text-xs">
                    {formErrors.duration}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Time per Question (seconds)
                </label>
                <input
                  className={`w-full rounded-md p-2 ${formErrors.question_time_limit ? ' -red-500' : ' -gray-300 '} dark:bg-[#181818]`}
                  max="300"
                  min="10"
                  name="question_time_limit"
                  onChange={handleInputChange}
                  type="number"
                  value={formData.question_time_limit}
                />
                {formErrors.question_time_limit && (
                  <p className="mt-1 text-red-500 text-xs">
                    {formErrors.question_time_limit}
                  </p>
                )}
                <p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
                  Each question will auto-advance after this time limit
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Start Date & Time
                </label>
                <input
                  className={`w-full rounded-md p-2 ${formErrors.starts_at ? ' -red-500' : ' -gray-300 '} dark:bg-[#181818]`}
                  name="starts_at"
                  onChange={handleInputChange}
                  type="datetime-local"
                  value={formData.starts_at}
                />
                {formErrors.starts_at && (
                  <p className="mt-1 text-red-500 text-xs">
                    {formErrors.starts_at}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  End Date & Time
                </label>
                <input
                  className={`w-full rounded-md p-2 ${formErrors.ends_at ? ' -red-500' : ' -gray-300 '} dark:bg-[#181818]`}
                  name="ends_at"
                  onChange={handleInputChange}
                  type="datetime-local"
                  value={formData.ends_at}
                />
                {formErrors.ends_at && (
                  <p className="mt-1 text-red-500 text-xs">
                    {formErrors.ends_at}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="mb-1 block font-medium text-gray-700 text-sm dark:text-[#818181]">
                  Student List (CSV)
                </label>
                <div className="mt-1 flex justify-center rounded-lg bg-[#181818] px-6 pt-5 pb-6 ">
                  <div className="space-y-1 text-center">
                    <svg
                      aria-hidden="true"
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <div className="flex text-gray-600 text-sm dark:text-gray-400">
                      <label
                        className="relative cursor-pointer rounded-sm bg-white p-1/2 font-medium text-[#FF5E00] focus-within:outline-none hover:text-blue-500 dark:bg-[#232323] dark:hover:text-blue-300"
                        htmlFor="students-csv"
                      >
                        <span>Upload a CSV file</span>
                        <input
                          accept=".csv"
                          className="sr-only"
                          id="students-csv"
                          name="students-csv"
                          onChange={handleFileChange}
                          type="file"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-gray-500 text-xs dark:text-gray-400">
                      CSV file with student emails or roll numbers
                    </p>
                    {csvFile && (
                      <p className="text-green-600 text-xs dark:text-green-400">
                        Selected: {csvFile.name}
                      </p>
                    )}
                  </div>
                </div>
                {csvError && (
                  <p className="mt-1 text-red-500 text-xs">{csvError}</p>
                )}
                <p className="mt-2 text-gray-500 text-xs dark:text-gray-400">
                  Upload a CSV file with either email addresses or roll numbers
                  (one per line). Both formats are supported and will be
                  automatically detected.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="-gray-300 rounded-md bg-white px-4 py-2 text-gray-700 text-sm shadow-sm hover:bg-gray-50 dark:bg-[#181818] dark:text-gray-200 dark:hover:bg-gray-600"
                disabled={isLoading}
                onClick={() => router.back()}
                type="button"
              >
                Cancel
              </button>
              <button
                className="-transparent rounded-md bg-[#FF5E00] px-4 py-2 text-sm text-white shadow-sm hover:bg-[#a3582c] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-white p-6 shadow dark:bg-[#202020]">
          <h2 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white">
            CSV Format Help
          </h2>

          <div className="mb-4">
            <h3 className="font-medium text-[#0c0c0c] text-lg dark:text-gray-300">
              Email Format Example:
            </h3>
            <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3 dark:bg-[#181818]">
              <code>
                email
                <br />
                student1@example.com
                <br />
                student2@example.com
                <br />
                student3@example.com
              </code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 text-lg dark:text-gray-300">
              Roll Number Format Example:
            </h3>
            <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3 dark:bg-[#181818]">
              <code>
                roll_number
                <br />
                22bq1a05g6
                <br />
                22bq1a05xx
                <br />
                22bq1a05xx
              </code>
            </pre>
            <p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
              The system will automatically detect the format and convert roll
              numbers to emails using your organization&apos;s domain if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
