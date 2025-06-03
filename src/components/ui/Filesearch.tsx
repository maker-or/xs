'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import PdfViewer from "~/components/ui/PDFViewer";
import useSWR from 'swr';

interface SearchResult {
  name: string;
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
}

const fetchSearchResults = async (query: string) => {
  const response = await fetch(`/api/fsearch?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Failed to fetch search results");
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

  const isLoading = !searchResults && !error;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  return (
    <>
      {/* Command Palette View */}
      <div className="bg-[#121212] rounded-3xl p-1 pb-12  border-[#5858583d] border-2">
        <div className="bg-[#2a2a2a] text-[#a0a0a0] rounded-2xl w-[600px] max-w-[90vw] shadow-2xl  overflow-y-auto p-3">

        <div className="flex gap-3 items-center mb-6">
          <div className="mt-4 w-full flex gap-2">
            <div className="relative mb-6 flex gap-2 w-full text-[#000000]">
              <button
                onClick={onClose}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f7eee3] p-2 bg-[#181717] z-10 rounded-md"
              >
                <ChevronLeft size={24} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Search File..."
                className="w-full pl-16 p-4 border-b-2 bg-[#292828] backdrop-blur-md text-[#e6e6e6]  font-sans border-[#f7eee3]/20 focus:outline-none placeholder:text-[#919191]"
              />
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
          {isLoading ? (
            <div className="text-[#f7eee3]/50 italic"> </div>
        ) : error ? (
        <div className="text-[#f7eee3]/50 italic">{error instanceof Error ? error.message : 'An error occurred'}</div>
        ) : searchResults?.results?.length ?? 0 > 0 ? (
            searchResults?.results.map((result, index) => (
              <div
                key={index}
                onClick={() => setSelectedPdfUrl(result.url)}
                className="px-3 py-2 text-[#f7eee3] border-b-[1px] border-[#f7eee388] text-[1.2rem] cursor-pointer hover:bg-[#f7eee3]/20 transition-colors duration-200"
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
        <div className="fixed inset-0 w-screen h-screen bg-[#000000] z-50">
          <div className="relative w-full h-full">
            <button
              onClick={() => setSelectedPdfUrl(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-[#f7eee3] p-2 hover:bg-[#f7eee3]/80 transition-colors duration-200"
              aria-label="Close PDF Viewer"
            >
              <X className="text-[#ff5e00]" size={24} />
            </button>
            <div className="w-full h-full">
              <PdfViewer fileUrl={selectedPdfUrl} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filesearch;
