"use client";

import { useEffect, useState } from "react";
import TagInput from "~/components/ui/TagInput";
import { UploadButton } from "~/utils/uploadthing";
import { OurFileRouter } from "../../api/uploadthing/core";
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
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent, fileUrl?: string) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const requestBody = {
        year: formData.year,
        branch: formData.branch.toUpperCase(),
        tags: tags.join(',').toLowerCase(),
        name: formData.name.toLowerCase(),
        filename: formData.name.toLowerCase(),
        fileurl: fileUrl || "",
        subject: formData.subject.toUpperCase(),
        type: formData.type,
        tag: tags.join(','),
        url: fileUrl || "",
        size: 0,
      };

      console.log('Sending request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch("/api/tupload", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData.error || 'Unknown error'}`);
      }
      
      setFormData({
        year: "",
        branch: "",
        tags: "",
        name: "",
        subject: "",
        type: "",
      });
      setTags([]);
      window.location.reload();
    } catch (error) {
      console.error("Error updating database:", error);
    } finally {
      setIsLoading(false);
    }
  };


const handleUploadComplete = async (response: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
    //userId: string;
    // folderId: number;
  }>) => {
    try {
      // Use the first uploaded file's data
      const fileData = response[0];
      if (fileData) {
        // Call handleSubmit with the file URL
        const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
        await handleSubmit(syntheticEvent, fileData.url);
      }
    } catch (error) {
      console.error('Error updating database:', error);
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
              onSubmit={(e) => handleSubmit(e)}
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
                  <label className="block text-sm font-medium text-gray-400 mb-4">
                    Upload File (only pdf)
                  </label>

                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res: { name: string; url: string; size: number; type: string; }[]) => {
                      if (res) {
                        void handleUploadComplete(res);
                      }
                    }}
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
