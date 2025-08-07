'use client';

import type React from 'react';

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

const CitationRenderer: React.FC<CitationRendererProps> = ({
  citations,
  isPanel = false,
}) => {
  // Enhanced citation parsing with type detection
  const parseCitations = (citationText: string): Citation[] => {
    const lines = citationText
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    console.log(isPanel);

    return lines
      .map((line) => {
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
          description = '';
        } else {
          url = line.trim();
          title = 'Source';
          description = '';
        }

        // Enhanced type detection
        if (url.startsWith('http://') || url.startsWith('https://')) {
          type = 'web';
        } else if (
          url.toLowerCase().includes('book:') ||
          url.toLowerCase().includes('isbn:') ||
          title.toLowerCase().includes('book') ||
          description.toLowerCase().includes('book') ||
          url.includes('page ') ||
          url.includes('p.') ||
          url.includes('pp.') ||
          url.includes('chapter ') ||
          url.includes('ch.')
        ) {
          type = 'book';
        }

        return { url, title, description, type };
      })
      .filter((citation) => citation.url);
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
    <div className="citations-container mt-8 border-gray-300 border-t pt-6 dark:border-gray-700">
      <div className="mb-4 flex items-center gap-2">
        <h4 className="font-semibold text-gray-800 text-lg dark:text-[#93BEC4]">
          Citations
        </h4>
      </div>

      <div className="flex gap-3">
        {parsedCitations.map((citation, index) => (
          <div
            className="citation-card group rounded-lg border-2 border-[#43595D] bg-gray-50 p-3 transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-[#2e2e2d] dark:bg-[#5C767B] dark:hover:border-[#f7eee3]"
            key={index}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-grow">
                <a
                  className="break-all text-[#242D33] text-sm hover:text-[#242D33] hover:underline dark:hover:text-[#242D33]"
                  href={citation.url}
                  rel="noopener noreferrer"
                  target="_blank"
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
