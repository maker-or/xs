'use client';

import React, { useState } from "react";
import PdfViewer from "~/components/ui/PDFViewer";
import { X } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { type SWRResponse } from 'swr';

interface FileTypes {
    filename: string;
    year: string;  // Include the URL in the selection
    subject: string;
    fileurl: string;
    tags: string;
}

const SubjectPage = () => {
    const path = usePathname();
    const router = useRouter();
    const params = useParams();
    const year = params?.year as string; // Extract `year` from route parameters

    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<"notes" | "questionPapers">("notes");
    const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

    const openPdfViewer = (url: string) => {
        setSelectedPdfUrl(url);
        console.log("the url", url);
    };

    const paramsUpdate = (category: 'notes' | 'questionPaper') => {
        const url = new URL(window.location.href);
        url.searchParams.set('category', category);
        router.push(url.href);
    };

    const fetcher = async () => {
        if (!year) throw new Error("Year is not defined");

        const response = await fetch(`/api/repo/year/${year}`);
        if (!response.ok) throw new Error("Failed to fetch folders");
        return response.json() as Promise<FileTypes[]>;
    };

    const { data: files = [], isLoading, error, mutate }: SWRResponse<FileTypes[], Error> = useSWR<FileTypes[], Error>(
        year ? `/api/repo/year/${year}` : null, // Only fetch if `year` is defined
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    );

    console.log('check:', files);

    if (!year) {
        return <div>Year not found</div>;
    }

    return (
        <>
            <div>
                <div className="mt-16 flex items-center justify-between p-2">
                    <Link href={`/repo/year/${year}`}>
                        <button
                            onClick={() => setSelectedSubject(null)}
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
                                paramsUpdate('notes');
                            }}
                            className={`rounded-xl px-3 py-2 text-sm lg:px-4 ${selectedType === "notes" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
                        >
                            Notes
                        </button>
                        <button
                            onClick={() => {
                                setSelectedType("questionPapers");
                                paramsUpdate('questionPaper');
                            }}
                            className={`rounded-xl px-4 py-2 ${selectedType === "questionPapers" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
                        >
                            Question Papers
                        </button>
                    </div>
                </div>

                {selectedType === "notes" ? (
                    <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start">
                        {files && files.map((file) => (
                            <div
                                key={file.filename} // Add a unique key prop
                                className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
                                onClick={() => openPdfViewer(file.fileurl)}
                            >
                                <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                                    {file.filename}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start">
                        {/* Render question papers here if needed */}
                    </div>
                )}
            </div>

            {selectedPdfUrl && (
                <div className="fixed inset-0 flex w-[100svw] bg-[#FF5E00]-700 bg-opacity-50">
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