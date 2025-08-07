'use client';
import { ChevronLeft, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import PdfViewer from '~/components/ui/PDFViewer';

interface SearchResult {
  name: string;
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
}

const fetchSearchResults = async (query: string) => {
  const response = await fetch(
    `/api/fsearch?query=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error('Failed to fetch search results');
  return (await response.json()) as SearchResponse;
};

const Filesearch = ({ onClose }: { onClose: () => void }) => {
  const [input, setInput] = useState('');
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Use SWR to fetch search results based on input
  const { data: searchResults = null, error } = useSWR<SearchResponse>(
    input.trim() ? `search-${input}` : null,
    () => fetchSearchResults(input)
  ) as { data: SearchResponse | null; error: Error | null };

  const isLoading = !(searchResults || error);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  return (
    <>
      {/* Command Palette View */}
      <div className="rounded-3xl border-2 border-[#5858583d] bg-[#121212] p-1 pb-12">
        <div className="w-[600px] max-w-[90vw] overflow-y-auto rounded-2xl bg-[#2a2a2a] p-3 text-[#a0a0a0] shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="mt-4 flex w-full gap-2">
              <div className="relative mb-6 flex w-full gap-2 text-[#000000]">
                <button
                  className="-translate-y-1/2 absolute top-1/2 left-3 z-10 rounded-md bg-[#181717] p-2 text-[#f7eee3]"
                  onClick={onClose}
                >
                  <ChevronLeft size={24} />
                </button>
                <input
                  className="w-full border-[#f7eee3]/20 border-b-2 bg-[#292828] p-4 pl-16 font-sans text-[#e6e6e6] backdrop-blur-md placeholder:text-[#919191] focus:outline-none"
                  onChange={handleInputChange}
                  placeholder="Search File..."
                  ref={inputRef}
                  type="text"
                  value={input}
                />
              </div>
            </div>
          </div>

          <div className="mb-4 flex-grow space-y-4 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-[#f7eee3]/50 italic"> </div>
            ) : error ? (
              <div className="text-[#f7eee3]/50 italic">
                {error instanceof Error ? error.message : 'An error occurred'}
              </div>
            ) : (searchResults?.results?.length ?? 0 > 0) ? (
              searchResults?.results.map((result, index) => (
                <div
                  className="cursor-pointer border-[#f7eee388] border-b-[1px] px-3 py-2 text-[#f7eee3] text-[1.2rem] transition-colors duration-200 hover:bg-[#f7eee3]/20"
                  key={index}
                  onClick={() => setSelectedPdfUrl(result.url)}
                >
                  {result.name}
                </div>
              ))
            ) : (
              <div className="text-[#f7eee3]/50 italic">No results found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen PDF Viewer */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 z-50 h-screen w-screen bg-[#000000]">
          <div className="relative h-full w-full">
            <button
              aria-label="Close PDF Viewer"
              className="absolute top-4 right-4 z-10 rounded-full bg-[#f7eee3] p-2 transition-colors duration-200 hover:bg-[#f7eee3]/80"
              onClick={() => setSelectedPdfUrl(null)}
            >
              <X className="text-[#ff5e00]" size={24} />
            </button>
            <div className="h-full w-full">
              <PdfViewer fileUrl={selectedPdfUrl} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filesearch;
