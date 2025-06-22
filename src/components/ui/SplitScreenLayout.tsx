/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from "react";
import MarkdownRenderer, { separateContentAndDiagrams } from "./MarkdownRenderer";

interface SplitScreenLayoutProps {
  content: string;
  isMobile: boolean;
  className?: string;
  messageId?: string;
  onDiagramsChange?: (hasDiagrams: boolean, diagramContent: string, messageId?: string) => void;
}

// Function to check if content has diagrams or code blocks (both go to right panel)
const hasAnyDiagrams = (content: string): boolean => {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || '';
    const codeString = (match[2] ?? '').trim();

    // Skip citations - they should render in main content, not right panel
    if (language === 'citations') {
      continue;
    }

    // Check for explicit diagram languages
    if (['mermaid', 'typogram', 'grammar', 'automata', 'cct', 'circuit-bricks', 'circuit'].includes(language)) {
      return true;
    }

    // ALL code blocks with language specified should go to right panel
    if (language && language.trim() !== '') {
      return true;
    }

    // Check for Mermaid diagrams by keywords
    const trimmed = codeString.trim();
    const mermaidKeywords = /^(graph|flowchart|sequenceDiagram|stateDiagram|classDiagram|gantt|pie|erDiagram)/;
    if (mermaidKeywords.test(trimmed)) {
      return true;
    }

    // Check for ASCII diagram patterns
    const hasStateTransitions = /q\d+\s*--+>\s*q\d+/.test(codeString);
    const hasBoxDrawing = /[┌┐└┘├┤┬┴┼─│]/.test(codeString);
    const hasFlowchartElements = /\[.*\]\s*--+>\s*\[.*\]/.test(codeString);

    // Enhanced ASCII FSM/automata diagram detection
    const hasStateIdentifiers = /q\d+/i.test(codeString);
    const hasTransitionArrows = /(--+>|<--+)/.test(codeString);
    const hasStateMarkers = /[+-]{3,}|[([]final[\])]/.test(codeString);
    const hasStateBoxes = /\+-+\+/.test(codeString);
    const isAutomataPattern = hasStateIdentifiers && (hasTransitionArrows || hasStateMarkers || hasStateBoxes);

    // Treat as diagram if it has specific diagram characteristics
    if (hasStateTransitions || hasBoxDrawing || hasFlowchartElements || isAutomataPattern) {
      return true;
    }
  }

  return false;
};

const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = React.memo(function SplitScreenLayout({
  content,
  isMobile,
  className = "",
  messageId,
  onDiagramsChange
}) {
  const hasDiagrams = hasAnyDiagrams(content);
  const prevDataRef = useRef<string>("");

  // Notify parent about diagram changes
  useEffect(() => {
    if (onDiagramsChange) {
      if (hasDiagrams) {
        // Extract diagram content
        const { diagramContent } = separateContentAndDiagrams(content);
        // Use a ref to prevent multiple calls with the same data
        const diagramData = JSON.stringify({ hasDiagrams: true, content: diagramContent, messageId });

        if (prevDataRef.current !== diagramData) {
          prevDataRef.current = diagramData;
          onDiagramsChange(true, diagramContent, messageId);
        }
      } else {
        const diagramData = JSON.stringify({ hasDiagrams: false, content: '', messageId });
        if (prevDataRef.current !== diagramData) {
          prevDataRef.current = diagramData;
          onDiagramsChange(false, '', messageId);
        }
      }
    }
  }, [content, hasDiagrams, messageId, onDiagramsChange]);

  // For mobile, handle diagrams in a stacked layout
  if (isMobile && hasDiagrams) {
    return (
      <div className={`flex flex-col space-y-4 ${className}`}>
        {/* Text content on top */}
        <div className="w-full">
          <MarkdownRenderer content={content} onlyText={true} />
        </div>

        {/* Diagrams below */}
        <div className="w-full border-t bg-[#0C1114] border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium border-b border-gray-200 dark:border-gray-700 pb-2">
            Diagrams
          </div>
          <div className="bg-red-500 dark:bg-[#6597b6] rounded-lg p-3">
            <MarkdownRenderer content={content} onlyDiagrams={true} />
          </div>
        </div>
      </div>
    );
  }

  // For desktop, render text content only if diagrams are available
  // Citations will now render inline within the content
  return (
    <div className={className}>
      <MarkdownRenderer 
        content={content} 
        onlyText={hasDiagrams} 
      />
    </div>
  );
});

export default SplitScreenLayout;
