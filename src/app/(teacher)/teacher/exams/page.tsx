"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Navbar from '~/components/ui/Navbar';

// Form validation schema
const examFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().optional(),
  num_questions: z.number().int().min(1, "Number of questions must be at least 1").max(50, "Maximum 50 questions"),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  duration: z.number().int().min(5, "Duration must be at least 5 minutes").max(180, "Maximum 3 hours"),
  question_time_limit: z.number().int().min(10, "Question time limit must be at least 10 seconds").max(300, "Maximum 5 minutes per question"),
  starts_at: z.string().min(1, "Start date and time is required"),
  ends_at: z.string().min(1, "End date and time is required"),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

export default function ExamCreationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<ExamFormValues>>({
    subject: "",
    topic: "",
    num_questions: 10,
    difficulty: "medium",
    duration: 60,
    question_time_limit: 30,
    starts_at: "",
    ends_at: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle numeric inputs
    if (name === 'num_questions' || name === 'duration' || name === 'question_time_limit') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
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
        ends_at: formData.ends_at || ''
      };

      examFormSchema.parse(formDataForValidation);

      // Additional validation for start/end dates
      const startDate = new Date(formData.starts_at || '');
      const endDate = new Date(formData.ends_at || '');

      if (endDate <= startDate) {
        setFormErrors((prev) => ({
          ...prev,
          ends_at: "End date must be after start date"
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

      setSuccess(`Exam created successfully! ${result.num_questions} questions were generated for ${result.num_students} students.`);

      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/teacher'); // Or redirect to a dashboard or exam list page
      }, 3000);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#000000] rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create New Exam</h1>

          {success && (
            <div className="mb-4 p-3 bg-green-100      -green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100      -red-400 text-green-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full p-2    rounded-md ${formErrors.subject ? '  -red-500' : '  -gray-300   '} dark:bg-[#181818] placeholder:text-[#818181]`}
                  placeholder="e.g., Mathematics, Computer Science, Physics"
                />
                {formErrors.subject && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic (Optional)
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="w-full p-2      -gray-300    rounded-md dark:bg-[#181818] placeholder:text-[#818181]"
                  placeholder="e.g., Calculus, Machine Learning, Quantum Mechanics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Questions
                </label>
                <input
                  type="number"
                  name="num_questions"
                  value={formData.num_questions}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  className={`w-full p-2    rounded-md ${formErrors.num_questions ? '  -red-500' : '  -gray-300   '} dark:bg-[#181818]`}
                />
                {formErrors.num_questions && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.num_questions}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className={`w-full p-2    rounded-md ${formErrors.difficulty ? '  -red-500' : '  -gray-300   '} dark:bg-[#181818]`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {formErrors.difficulty && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.difficulty}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="5"
                  max="180"
                  className={`w-full p-2    rounded-md ${formErrors.duration ? '  -red-500' : '  -gray-300   '} dark:bg-[#181818]`}
                />
                {formErrors.duration && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time per Question (seconds)
                </label>
                <input
                  type="number"
                  name="question_time_limit"
                  value={formData.question_time_limit}
                  onChange={handleInputChange}
                  min="10"
                  max="300"
                  className={`w-full p-2    rounded-md ${formErrors.question_time_limit ? '  -red-500' : '  -gray-300   '} dark:bg-[#181818]`}
                />
                {formErrors.question_time_limit && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.question_time_limit}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Each question will auto-advance after this time limit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="starts_at"
                  value={formData.starts_at}
                  onChange={handleInputChange}
                  className={`w-full p-2    rounded-md ${formErrors.starts_at ? '  -red-500' : '  -gray-300   '} dark:bg-[#181818]`}
                />
                {formErrors.starts_at && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.starts_at}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="ends_at"
                  value={formData.ends_at}
                  onChange={handleInputChange}
                  className={`w-full p-2    rounded-md ${formErrors.ends_at ? '  -red-500' : '  -gray-300   '} dark:bg-[#181818]`}
                />
                {formErrors.ends_at && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.ends_at}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student List (CSV)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 bg-[#181818] rounded-lg  ">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="students-csv"
                        className="relative cursor-pointer bg-white dark:bg-[#232323] p-1/2 rounded-sm font-medium text-[#FF5E00]  hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none"
                      >
                        <span>Upload a CSV file</span>
                        <input
                          id="students-csv"
                          name="students-csv"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CSV file with student emails or roll numbers
                    </p>
                    {csvFile && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Selected: {csvFile.name}
                      </p>
                    )}
                  </div>
                </div>
                {csvError && (
                  <p className="text-red-500 text-xs mt-1">{csvError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Upload a CSV file with either email addresses or roll numbers (one per line).
                  Both formats are supported and will be automatically detected.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm      -gray-300 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-[#FF5E00]      -transparent rounded-md shadow-sm text-white hover:bg-[#a3582c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>

        <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-[#464646] rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">CSV Format Help</h2>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Email Format Example:</h3>
            <pre className="bg-gray-100 dark:bg-[#181818] p-3 rounded mt-2 overflow-x-auto">
              <code>email<br/>student1@example.com<br/>student2@example.com<br/>student3@example.com</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Roll Number Format Example:</h3>
            <pre className="bg-gray-100 dark:bg-[#181818] p-3 rounded mt-2 overflow-x-auto">
              <code>roll_number<br/>22bq1a05g6<br/>22bq1a05xx<br/>22bq1a05xx</code>
            </pre>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              The system will automatically detect the format and convert roll numbers to emails
              using your organization&apos;s domain if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
