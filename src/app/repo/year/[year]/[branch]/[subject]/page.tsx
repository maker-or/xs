'use client';
import { ChevronLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
//// /repo/year/[year]/[branch]/[subject]/page.tsx
import React, { useState } from 'react';
import useSWR, { type SWRResponse } from 'swr';
import PdfViewer from '~/components/ui/PDFViewer';

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
  const category = url.searchParams.get('category') as
    | 'notes'
    | 'questionPapers';

  const [selectedType, setSelectedType] = useState<'notes' | 'questionPapers'>(
    category || 'notes'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  const openPdfViewer = (url: string) => {
    setSelectedPdfUrl(url);
    console.log('the url', url);
  };

  const paramsUpdate = (category: 'notes' | 'questionPapers') => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', category);
    router.push(url.href);
    setTimeout(() => window.location.reload(), 1000);
  };

  const fetcher = async () => {
    const response = await fetch(
      `/api/repo/year/${year}/${branch}/${subject}?category=${selectedType}`
    );
    if (!response.ok) throw new Error('Failed to fetch folders');
    return response.json() as Promise<ResponseType>;
  };

  const { data }: SWRResponse<ResponseType, Error> = useSWR<
    ResponseType,
    Error
  >(
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

  console.log('check:', tags);

  if (!year) {
    return <div>Year not found</div>;
  }

  // Filter files based on selected tags
  const filteredFiles = files?.filter((file) => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some((selectedTag) => file.tags.includes(selectedTag));
  });

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <div className="h-[100svh]">
        <div className="mt-16 mb-4 flex gap-4 overflow-x-auto text-normal">
          {tags &&
            tags.map((el) => (
              <button
                className={`whitespace-nowrap rounded-xl px-4 py-2 transition-colors ${
                  selectedTags.includes(el)
                    ? 'bg-[#f7eee3] text-[#000000]'
                    : 'bg-[#454545] text-[#f7eee3] hover:bg-[#a3a1a0] hover:text-[#000000]'
                }`}
                key={`tag-${el}`}
                onClick={() => handleTagClick(el)}
              >
                {el}
              </button>
            ))}
        </div>
        <div className="flex items-center justify-between p-2">
          <Link href={`/repo/year/${year}`}>
            <button className="mb-4 flex rounded-full py-2 text-[#f7eee3] text-sm hover:text-[#FF5E00] lg:text-lg">
              <ChevronLeft />
            </button>
          </Link>
          {/* Type Selection */}
          <div className="mb-4 flex gap-4">
            <button
              className={`rounded-xl px-3 py-2 text-sm lg:px-4 ${selectedType === 'notes' ? 'bg-[#f7eee3] text-[#000000]' : 'bg-[#454545] text-[#f7eee3]'}`}
              onClick={() => {
                setSelectedType('notes');
                paramsUpdate('notes');
              }}
            >
              Notes
            </button>
            <button
              className={`rounded-xl px-4 py-2 ${selectedType === 'questionPapers' ? 'bg-[#f7eee3] text-[#000000]' : 'bg-[#454545] text-[#f7eee3]'}`}
              onClick={() => {
                setSelectedType('questionPapers');
                paramsUpdate('questionPapers');
              }}
            >
              Question Papers
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start">
          {filteredFiles?.map((file) => (
            <div
              className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
              key={`${file.filename}`}
              onClick={() => openPdfViewer(file.fileurl)}
            >
              <div className="absolute right-0 bottom-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#000000] text-md">
                {file.filename}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPdfUrl && (
        <div className="fixed inset-0 flex w-[100svw] bg-[#FF5E00]-700 bg-opacity-50">
          <div className="relative w-[100svw] items-start justify-center rounded-lg bg-[#000000]">
            <button
              aria-label="Close PDF Viewer"
              className="absolute top-2 right-2 z-10 rounded-full bg-[#f7eee3] p-1 text-[#ff5e00]"
              onClick={() => setSelectedPdfUrl(null)}
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
