"use client";
//// /repo/year/[year]/[branch]/[subject]/page.tsx
import React, { useState } from "react";
import PdfViewer from "~/components/ui/PDFViewer";
import { X } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { type SWRResponse } from "swr";

interface FileResponse {
  doId: number;
  filename: string;
  subject: string;
  tags: string[];
  fileurl: string;
  year: string;
  branch: string;
}

interface ResponseType {
  files: FileResponse[];
  tags: string[];
}

const SubjectPage = () => {
  const _path = usePathname();
  const router = useRouter();
  const params = useParams();
  const year = params?.year?.toString();
  const branch = params?.branch?.toString();
  const subject = params?.subject?.toString(); // Using optional chaining
  const url = new URL(window.location.href);
  const category = url.searchParams.get("category") as
    | "notes"
    | "questionPapers";
  
  const [selectedType, setSelectedType] = useState<"notes" | "questionPapers">(
    category || "notes",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  const openPdfViewer = (url: string) => {
    setSelectedPdfUrl(url);
    console.log("the url", url);
  };

  const paramsUpdate = (category: "notes" | "questionPapers") => {
    const url = new URL(window.location.href);
    url.searchParams.set("category", category);
    router.push(url.href);
    setTimeout(() => window.location.reload(), 1000);
  };

  const fetcher = async () => {
    const response = await fetch(
      `/api/repo/year/${year}/${branch}/${subject}?category=${selectedType}`,
    );
    if (!response.ok) throw new Error("Failed to fetch folders");
    return response.json() as Promise<ResponseType>;
    
  };

  const { data }: SWRResponse<ResponseType, Error> =
    useSWR<ResponseType, Error>(
      `/api/repo/year/${year}/${branch}/${subject}?category=${selectedType}`,
      fetcher,
      {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        refreshInterval: 5000, // Poll every 5 seconds
      }
    );

  const files = data?.files;
  const tags = data?.tags;

  console.log("check:", tags);
  
  if (!year) {
    return <div>Year not found</div>;
  }

  // Filter files based on selected tags
  const filteredFiles = files?.filter((file) => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some(selectedTag => file.tags.includes(selectedTag));
  });

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <div className="h-[100svh]">
        <div className="text-normal mb-4  mt-16 flex gap-4 overflow-x-auto">
          {tags &&
            tags.map((el) => (
              <button
                key={`tag-${el}`}
                className={`whitespace-nowrap rounded-xl px-4 py-2 transition-colors ${
                  selectedTags.includes(el)
                    ? "bg-[#f7eee3] text-[#000000]"
                    : "bg-[#454545] text-[#f7eee3] hover:bg-[#a3a1a0] hover:text-[#000000]"
                }`}
                onClick={() => handleTagClick(el)}
              >
                {el}
              </button>
            ))}
        </div>
        <div className="flex items-center justify-between p-2">
          <Link href={`/repo/year/${year}`}>
            <button
              className="mb-4 flex rounded-full py-2 text-sm text-[#f7eee3] hover:text-[#FF5E00] lg:text-lg"
            >
              <ChevronLeft />
            </button>
          </Link>
          {/* Type Selection */}
          <div className="mb-4 flex gap-4">
            <button
              onClick={() => {
                setSelectedType("notes");
                paramsUpdate("notes");
              }}
              className={`rounded-xl px-3 py-2 text-sm lg:px-4 ${selectedType === "notes" ? "bg-[#f7eee3] text-[#000000]" : "bg-[#454545] text-[#f7eee3]"}`}
            >
              Notes
            </button>
            <button
              onClick={() => {
                setSelectedType("questionPapers");
                paramsUpdate("questionPapers");
              }}
              className={`rounded-xl px-4 py-2 ${selectedType === "questionPapers" ? "bg-[#f7eee3] text-[#000000]" : "bg-[#454545] text-[#f7eee3]"}`}
            >
              Question Papers
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start">
          {filteredFiles?.map((file) => (
            <div
              key={`${file.filename}`}
              className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
              onClick={() => openPdfViewer(file.fileurl)}
            >
              <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#000000]">
                {file.filename}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPdfUrl && (
        <div className="bg-[#FF5E00]-700 fixed inset-0 flex w-[100svw] bg-opacity-50">
          <div className="relative w-[100svw] items-start justify-center rounded-lg bg-[#000000]">
            <button
              onClick={() => setSelectedPdfUrl(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-[#f7eee3] p-1 text-[#ff5e00]"
              aria-label="Close PDF Viewer"
            >
              <X />
            </button>
            <PdfViewer fileUrl={selectedPdfUrl} />
          </div>
        </div>
      )}
    </>
  );
};

export default SubjectPage;