"use client";

import React from "react";

interface Citation {
  url: string;
  title: string;
  description: string;
  type: 'book' | 'web' | 'unknown';
}

interface CitationRendererProps {
  citations: string;
  isPanel?: boolean; // New prop to determine if it's in a side panel
}

const CitationRenderer: React.FC<CitationRendererProps> = ({ citations, isPanel = false }) => {
  // Enhanced citation parsing with type detection
  const parseCitations = (citationText: string): Citation[] => {
    const lines = citationText.trim().split('\n').filter(line => line.trim());
    console.log(isPanel)
    
    return lines.map(line => {
      const parts = line.split(' | ');
      let url = '';
      let title = 'Source';
      let description = '';
      let type: 'book' | 'web' | 'unknown' = 'unknown';

      if (parts.length >= 3) {
        url = parts[0]?.trim() || '';
        title = parts[1]?.trim() || 'Source';
        description = parts.slice(2).join(' | ').trim();
      } else if (parts.length === 2) {
        url = parts[0]?.trim() || '';
        title = parts[1]?.trim() || 'Source';
        description = "";
      } else {
        url = line.trim();
        title = "Source";
        description = "";
      }

      // Enhanced type detection
      if (url.startsWith('http://') || url.startsWith('https://')) {
        type = 'web';
      } else if (url.toLowerCase().includes('book:') || url.toLowerCase().includes('isbn:') || 
                 title.toLowerCase().includes('book') || description.toLowerCase().includes('book') ||
                 url.includes('page ') || url.includes('p.') || url.includes('pp.') ||
                 url.includes('chapter ') || url.includes('ch.')) {
        type = 'book';
      }

      return { url, title, description, type };
    }).filter(citation => citation.url);
  };

  const parsedCitations = parseCitations(citations);

  if (parsedCitations.length === 0) {
    return null;
  }

  // Get appropriate icon for citation type
  // const getIcon = (type: string) => {
  //   switch (type) {
  //     case 'book':
  //       return <Book className="h-4 w-4" />;
  //     case 'web':
  //       return <Globe className="h-4 w-4" />;
  //     default:
  //       return <FileText className="h-4 w-4" />;
  //   }
  // };

  // Panel version (for left sidebar)
  

  // Bottom version (traditional display)
  return (
    <div className="citations-container mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-[#93BEC4]">
          Citations
        </h4>
      </div>
      
      <div className="flex gap-3">
        {parsedCitations.map((citation, index) => (
          <div
            key={index}
            className="citation-card group p-3 bg-gray-50 dark:bg-[#5C767B] rounded-lg border-2 border-[#43595D] dark:border-[#2e2e2d] hover:border-blue-300 dark:hover:border-[#f7eee3] transition-all duration-200 hover:shadow-md">
            <div className="flex items-start gap-3"> 
              <div className="flex-grow min-w-0">
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#242D33]  hover:text-[#242D33] dark:hover:text-[#242D33] hover:underline break-all"
                >
                  {citation.title}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitationRenderer;
