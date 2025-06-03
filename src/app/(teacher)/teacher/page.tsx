"use client";

import { useEffect, useState } from "react";
import TagInput from "~/components/ui/TagInput";
// import Navbar from "~/components/ui/Navbar";
import Tnav from "~/components/ui/Tnav";



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
      <Tnav />

      <main className=" w-full flex items-center justify-center p-3">
        <div className="flex  w-full flex-col gap-6 ">          
          {/* Original resource upload section can go here */}
          <div className="bg-white dark:bg-[#000000] rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Resource Upload</h2>
            <form
              onSubmit={handleSubmit}
              className="grid h-full w-full grid-cols-1  rounded-lg px-2 py-8 md:grid-cols-2"
            >
              {/* Left Column: Text Inputs */}
               <div className="flex h-full flex-col gap-10 font-serif">
                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter filename"
                    className="mt-8 w-[90%] border-b placeholder:text-[#9CA3AF] border-gray-300 bg-inherit text-2xl text-[#E8E8E6] outline-none "
                  />
                </div>
                <div>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="mt-8 w-[90%] border-b border-gray-300 bg-inherit text-2xl text-[#9CA3AF] outline-none placeholder:text-[#9CA3AF]"
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
                    className="mt-8 w-[90%] border-b  placeholder:text-[#9CA3AF] border-gray-300 bg-inherit text-2xl text-[#E8E8E6] outline-none"
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
                    className="mt-8 w-[90%] border-b placeholder:text-[#9CA3AF] border-gray-300 bg-inherit text-2xl text-[#E8E8E6] outline-none"
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

                  {/* File Selected State */}
                  {file && (
                    <div className="mt-4 rounded-xl border-4 border-[#3D3B3B] bg-[#1E1E1E] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex bg-[#454545] p-2 rounded-lg items-center gap-3">
                          {/* Orange File Icon */}
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-[linear-gradient(to_bottom,_#E8E8E6_0%,_#FF5E00_100%)]">
                          </div>
                          <span className="text-gray-300">{file.name}</span>
                        </div>
                        {/* X Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(undefined);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">selected flie</div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!file && (
                    <div
                      className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-[#3D3B3B] bg-[#1E1E1E] p-12 text-gray-400 hover:border-[#FF5E00] hover:text-gray-300"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <span>Click to select or drag & drop a file</span>
                    </div>
                  )}

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
                  className={`flex w-full items-center justify-center rounded-lg bg-[#E8E8E6] py-3 font-semibold text-[#000000] transition-all ${
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


      </main>
    </div>
  );
}
