"use client";

import { useEffect, useState } from "react";
import TagInput from "~/components/ui/TagInput";
import Navbar from "~/components/ui/Navbar";
import Link from "next/link";


export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    branch: "",
    tags: "",
    subject: "",
    type: "",
  });
  const [file, setFile] = useState<undefined | File>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => console.log(file), [file]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("year", formData.year);
      data.append("branch", formData.branch.toUpperCase());
      data.append("tags", JSON.stringify(tags).toLowerCase());
      data.append("name", formData.name.toLowerCase());
      data.append("file", file ?? "");
      data.append("subject", formData.subject.toUpperCase());
      data.append("type", formData.type);

      await fetch("/api/uploadfile", {
        method: "POST",
        body: data,
      });
      setFormData({
        year: "",
        branch: "",
        tags: "",
        name: "",
        subject: "",
        type: "",
      });
      setTags([]);
      // Clear any additional state if needed
    } catch (error) {
      console.error("Error updating database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Exam Management Section */}
          <div className="bg-white dark:bg-[#0c0c0c] rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Exam Management</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Create and manage online exams for your students. View results and export data.
            </p>
            <div className="flex flex-col space-y-2">
              <Link
                href="/teacher/exams"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center justify-center"
              >
                Create New Exam
              </Link>
              <Link
                href="/teacher/exams/results"
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 inline-flex items-center justify-center"
              >
                View Exam Results
              </Link>
            </div>
          </div>
          
          {/* Original resource upload section can go here */}
          <div className="bg-white dark:bg-[#0c0c0c] rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Resource Upload</h2>
            <form
              onSubmit={handleSubmit}
              className="grid h-full w-full grid-cols-1  rounded-lg px-2 py-8 md:grid-cols-2"
            >
              {/* Left Column: Text Inputs */}
              <div className="flex h-full flex-col gap-10">
                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter filename"
                    className="mt-8 w-[90%] border-b placeholder:text-[#595959] border-gray-300 bg-inherit text-2xl text-[#E8E8E6] outline-none "
                  />
                </div>
                <div>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="mt-8 w-[90%] border-b border-gray-300 bg-inherit text-2xl text-[#9CA3AF] outline-none"
                  >
                    <option value="" className="" disabled>
                      Choose year
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
                <div>
                  

                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    placeholder="Enter branch"
                    className="mt-8 w-[90%] border-b  placeholder:text-[#595959] border-gray-300 bg-inherit text-2xl text-[#E8E8E6] outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                    className="mt-8 w-[90%] border-b placeholder:text-[#595959] border-gray-300 bg-inherit text-2xl text-[#E8E8E6] outline-none"
                  />
                </div>
                <div>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-8 w-[90%] border-b border-gray-300 bg-inherit text-2xl text-[#9CA3AF] outline-none"
                  >
                    <option value="" disabled>
                      Choose type
                    </option>
                    <option value="notes">Notes</option>
                    <option value="questionPapers">question Paper</option>
                  </select>
                </div>
                <div>
                  <TagInput tags={tags} setTags={setTags} />
                </div>
              </div>

              {/* Right Column: File Upload */}
              <div className="flex flex-col gap-6">
                <div>
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Upload File (only pdf)
                  </label>
                  <div
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#E8E8E6]  bg-[#f7eee310] p-12 text-[#E8E8E6] hover:border-[#FF5E00]"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <span>
                      {file ? file.name : "Click to select or drag & drop a file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? undefined)}
                    className="hidden"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full items-center justify-center rounded-lg bg-[#E8E8E6] py-3 font-semibold text-[#0c0c0c] transition-all ${
                    isLoading
                      ? "cursor-not-allowed opacity-50"
                      : "hover:shadow-[inset_0_-4px_8px_rgba(255,94,0,0.6),0_4px_6px_rgba(0,0,0,0.2)] focus:shadow-[inset_0_-4px_8px_rgba(255,94,0,0.6),0_4px_6px_rgba(0,0,0,0.2)]"
                  } shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]`}
                  aria-busy={isLoading}
                  aria-disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Rest of the original content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Resource Upload</h2>
          {/* Original form can go here */}
        </div>
      </main>
    </div>
  );
}
