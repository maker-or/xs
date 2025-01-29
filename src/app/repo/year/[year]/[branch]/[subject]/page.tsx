"use client";

import React, { useEffect, useState } from "react";
import PdfViewer from "~/components/ui/PDFViewer";
import { X } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { type SWRResponse } from "swr";

interface FileTypes {
  filename: string;
  fileurl: string;
  type: string;
}

interface responseType {
  files: FileTypes[];
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
  // console.log(category);
  // const year = path.split('/')[3];
  //const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

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
    return response.json() as Promise<responseType>;
  };

const { data, isLoading, error, mutate }: SWRResponse<responseType, Error> =
    useSWR<responseType, Error>(
      `/api/repo/year/${year}/${branch}/${subject}`,
      fetcher,
      {
        revalidateOnFocus: false,
        revalidateIfStale: false,
      },
    );

  const files = data?.files;
  const tags = data?.tags;

  console.log("check:", tags);

  // useEffect(() => console.log(files), [files]);

  if (!year) {
    return <div>Year not found</div>;
  }

  return (
    <>
      <div>
        <div className="text-normal mb-4 mt-16 flex gap-4 overflow-x-auto">
          {tags &&
            tags.map((el, _index) => (
              <button
                key={`tag-${el}`}
                className={`whitespace-nowrap rounded-xl bg-[#454545] px-4 py-2 text-[#f7eee3] transition-colors hover:bg-[#a3a1a0] hover:text-[#0c0c0c]`}
                onClick={() =>
                  setSelectedTags((prev) => {
                    if (prev.length > 0) return [...prev, el];
                    return [el];
                  })
                }
              >
                {el}
              </button>
            ))}
        </div>
        <div className="flex items-center justify-between p-2">
          <Link href={`/repo/year/${year}`}>
            <button
              //onClick={() => setSelectedSubject(null)}
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
              className={`rounded-xl px-3 py-2 text-sm lg:px-4 ${selectedType === "notes" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
            >
              Notes
            </button>
            <button
              onClick={() => {
                setSelectedType("questionPapers");
                paramsUpdate("questionPapers");
              }}
              className={`rounded-xl px-4 py-2 ${selectedType === "questionPapers" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
            >
              Question Papers
            </button>
          </div>
        </div>

        {/* {selectedType === "notes" ? ( */}
        <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start">
          {files?.map((file) => (
            <div
              key={`${file.filename}`}
              className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
              onClick={() => openPdfViewer(file.fileurl)}
            >
              <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                {file.filename}
              </div>
            </div>
          ))}
        </div>
        {/* ) : ( */}
        {/* <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start"> */}
        {/* Render question papers here if needed */}
        {/* </div> */}
        {/* )} */}
      </div>

      {selectedPdfUrl && (
        <div className="bg-[#FF5E00]-700 fixed inset-0 flex w-[100svw] bg-opacity-50">
          <div className="relative w-[100svw] items-start justify-center rounded-lg bg-[#0c0c0c]">
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
