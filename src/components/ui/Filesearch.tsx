'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface SearchResult {
  name: string;
  url: string;
}

const Filesearch = ({ onClose }: { onClose: () => void }) => {
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!input.trim()) {
                setSearchResults([]);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`/api/fsearch?query=${encodeURIComponent(input)}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }

                const data = await response.json();
                setSearchResults(data.results || []);
            } catch (error) {
                console.error('Error fetching search results:', error);
                setError('Unable to fetch search results. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [input]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleFileClick = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="bg-[#0c0c0c]/60 backdrop-blur-2xl text-[#f7eee3] rounded-3xl p-6 w-1/2 max-h-[600px] flex flex-col shadow-2xl border font-sans border-[#f7eee3]/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/10 to-[#0c0c0c]/5 opacity-50 -z-10 blur-3xl"></div>

            <div className="flex gap-3 items-center mb-6">
                <div className="mt-4 w-full flex gap-2">
                    <div className="relative mb-6 flex gap-2 w-full text-[#0c0c0c]">
                        <button
                            onClick={onClose}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f7eee3] p-2 bg-[#0c0c0c] z-10 rounded-full"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Search File..."
                            className="w-full pl-16 p-4 bg-gradient-to-r from-[#f7eee3] to-[#ABABAB] backdrop-blur-md text-[#0c0c0c] rounded-xl font-sans border-[#f7eee3]/20 focus:outline-none placeholder:text-[#0c0c0c]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
                {isLoading ? (
                    <div className="text-[#f7eee3]/50 italic">Loading...</div>
                ) : error ? (
                    <div className="text-[#f7eee3]/50 italic">{error}</div>
                ) : searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                        <div
                            key={index}
                            onClick={() => handleFileClick(result.url)}
                            className="px-3 py-2 rounded-lg bg-[#f7eee3]/10 text-[#f7eee3] font-serif text-[1.2rem] cursor-pointer hover:bg-[#f7eee3]/20 transition-colors duration-200"
                        >
                            {result.name}
                        </div>
                    ))
                ) : (
                    <div className="text-[#f7eee3]/50 italic">No results found.</div>
                )}
            </div>
        </div>
    );
};

export default Filesearch;