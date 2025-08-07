'use client';
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LinkIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from 'convex/react';
import { CheckCircle2, Circle, CircleDotDashed } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Button } from './ui/button';

interface Message {
  _id: Id<'messages'>;
  chatId: Id<'chats'>;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parentId?: Id<'messages'>;
  model?: string;
  isActive?: boolean;
  branchId?: Id<'branches'>;
  createdAt: number;
  webSearchUsed?: boolean;
  isProcessingComplete?: boolean;
}

interface RawSlideData {
  [key: string]: unknown;
  name?: string;
  title?: string;
  content?: string;
  type?: string;
  subTitles?: string;
  picture?: string;
  links?: string[];
  youtubeSearchText?: string;
  codeLanguage?: string;
  codeContent?: string;
  code?: {
    content?: string;
    language?: string;
  };
  tables?: string;
  bulletPoints?: string[];
  audioScript?: string;
  testQuestions?: string | TestQuestion[];
  flashcardData?: FlashcardQuestion[];
}

interface Slide {
  name: string;
  title: string;
  content: string;
  type:
    | 'markdown'
    | 'code'
    | 'video'
    | 'quiz'
    | 'table'
    | 'flashcard'
    | 'test'
    | 'circuit';
  subTitles: string;
  picture: string;
  links: string[];
  youtubeSearchText: string;
  codeLanguage: string;
  codeContent: string;
  tables: string;
  bulletPoints: string[];
  audioScript: string;
  testQuestions: string | TestQuestion[];
  flashcardData: FlashcardQuestion[];
}

interface TestQuestion {
  question: string;
  options: string[];
  answer: string | number;
}

interface FlashcardQuestion {
  question: string;
  answer: string;
}

type TestComponentProps = {
  testQuestions: string | TestQuestion[];
};

type FlashComponentProps = {
  flashcardsContent: string;
};

// Test Component
const TestComponent = ({ testQuestions }: TestComponentProps) => {
  console.log('TestComponent - testQuestions type:', typeof testQuestions);
  console.log('TestComponent - testQuestions content:', testQuestions);
  console.log(
    'TestComponent - testQuestions is array:',
    Array.isArray(testQuestions)
  );

  // Additional detailed debugging
  if (Array.isArray(testQuestions)) {
    console.log('TestComponent - Array length:', testQuestions.length);
    testQuestions.forEach((q, i) => {
      console.log(`Question ${i}:`, {
        question: q.question,
        options: q.options,
        answer: q.answer,
        answerType: typeof q.answer,
        fullObject: q,
      });
    });
  }

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const normalizeAnswer = (answer: string | number) => {
    if (answer === null || answer === undefined) return '';
    return answer.toString().trim().toLowerCase();
  };

  const isAnswerCorrect = (
    userAnswer: string, // The full text of the selected option, e.g., "B. Insertion Sort"
    correctAnswer: string | number, // The correct answer key, e.g., "B"
    options: string[] // The array of full option texts
  ) => {
    if (!userAnswer || correctAnswer === undefined || correctAnswer === null)
      return false;

    const normalizedUserAnswer = userAnswer.toString().trim();
    const normalizedCorrectAnswer = correctAnswer.toString().trim();

    // Case 1: The answer is the full text of the option (e.g., "Insertion Sort")
    if (
      normalizedUserAnswer.toLowerCase() ===
      normalizedCorrectAnswer.toLowerCase()
    ) {
      return true;
    }

    // Case 2: The answer is a letter key (e.g., "B") and options are formatted like "B. Insertion Sort"
    if (
      normalizedCorrectAnswer.length === 1 &&
      /^[A-Z]$/i.test(normalizedCorrectAnswer)
    ) {
      // Check if the user's selected option string starts with the correct letter and a dot.
      const expectedPrefix = `${normalizedCorrectAnswer.toUpperCase()}.`;
      if (normalizedUserAnswer.toUpperCase().startsWith(expectedPrefix)) {
        return true;
      }
    }

    // Case 3: The answer is an index (e.g., 1 for the second option)
    if (!isNaN(Number(normalizedCorrectAnswer))) {
      const correctIndex = Number(normalizedCorrectAnswer);
      if (
        options[correctIndex] &&
        options[correctIndex] === normalizedUserAnswer
      ) {
        return true;
      }
    }

    return false;
  };

  // Helper function to get displayable correct answer
  const getCorrectAnswerDisplay = (
    correctAnswer: string | number,
    options: string[]
  ) => {
    if (correctAnswer === undefined || correctAnswer === null)
      return 'Not specified';

    const normalizedCorrectAnswer = String(correctAnswer).trim();

    // Case 1: The answer is a letter key (e.g., "B")
    if (
      normalizedCorrectAnswer.length === 1 &&
      /^[A-Z]$/i.test(normalizedCorrectAnswer)
    ) {
      const expectedPrefix = `${normalizedCorrectAnswer.toUpperCase()}.`;
      const foundOption = options.find((opt) =>
        opt.trim().toUpperCase().startsWith(expectedPrefix)
      );
      if (foundOption) {
        return foundOption;
      }
    }

    // Case 2: The answer is an index
    if (!isNaN(Number(normalizedCorrectAnswer))) {
      const correctIndex = Number(normalizedCorrectAnswer);
      if (options[correctIndex]) {
        return options[correctIndex];
      }
    }

    // Fallback: return the answer as is (might be the full text or just the key if no match found)
    return String(correctAnswer);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    try {
      // Handle both string and array formats
      let questions: TestQuestion[] = [];
      if (typeof testQuestions === 'string') {
        questions = JSON.parse(testQuestions);
      } else if (Array.isArray(testQuestions)) {
        questions = testQuestions;
      } else {
        throw new Error('Invalid testQuestions format');
      }

      questions.forEach((question: TestQuestion, index: number) => {
        const userAnswer = selectedAnswers[index];
        const correctAnswer = question.answer;
        const options = question.options || [];

        // Debug logging
        console.log(`Question ${index + 1}:`);
        console.log(`User answer: "${userAnswer}"`);
        console.log(`Correct answer: "${correctAnswer}"`);
        console.log(`Answer type: ${typeof correctAnswer}`);
        console.log('Options:', options);
        console.log(`Normalized user: "${normalizeAnswer(userAnswer || '')}"`);
        console.log(
          `Normalized correct: "${normalizeAnswer(correctAnswer || '')}"`
        );

        if (isAnswerCorrect(userAnswer || '', correctAnswer, options)) {
          correctAnswers++;
          console.log('✓ Correct!');
        } else {
          console.log('✗ Wrong');
        }
      });
      setScore(correctAnswers);
      setShowResults(true);
    } catch (error) {
      console.error('Error calculating score:', error);
      setScore(0);
      setShowResults(true);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  let questions: TestQuestion[] = [];
  let currentQ: TestQuestion | null = null;
  let isLastQuestion = false;
  let allAnswered = false;

  try {
    // Handle both string and array formats
    if (typeof testQuestions === 'string') {
      questions = JSON.parse(testQuestions);
    } else if (Array.isArray(testQuestions)) {
      questions = testQuestions;
    } else {
      throw new Error('Invalid testQuestions format');
    }

    console.log('Parsed questions:', questions);
    console.log('Current question index:', currentQuestion);

    currentQ = questions[currentQuestion] || null;
    console.log('Current question object:', currentQ);

    isLastQuestion = currentQuestion === questions.length - 1;
    allAnswered = questions.every(
      (_: TestQuestion, index: number) => selectedAnswers[index]
    );

    console.log('Selected answers:', selectedAnswers);
  } catch (error) {
    console.error('Error parsing test questions:', error);
    let errorMessage = 'Error loading test questions. Please try again.';

    if (typeof testQuestions === 'string') {
      errorMessage = 'Invalid JSON format in test questions.';
    } else if (!Array.isArray(testQuestions)) {
      errorMessage = 'Test questions must be an array or JSON string.';
    } else if (testQuestions.length === 0) {
      errorMessage = 'No test questions found.';
    }

    return (
      <div className="p-8 text-center text-red-400">
        <div className="mb-4 text-4xl">⚠️</div>
        <p className="mb-2 font-semibold text-lg">Test Error</p>
        <p className="text-sm">{errorMessage}</p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-red-300 text-sm hover:text-red-200">
            Debug Info
          </summary>
          <pre className="mt-2 rounded bg-red-900/20 p-2 text-xs">
            Type: {typeof testQuestions}
            {'\n'}
            Is Array: {Array.isArray(testQuestions)}
            {'\n'}
            Content: {JSON.stringify(testQuestions, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="rounded-lg border p-6">
        <div className="mb-6 text-center">
          <h3 className="mb-2 font-bold text-2xl text-[#f7eee3]">
            Test Results
          </h3>
          <div className="mb-2 font-bold text-4xl">
            <span
              className={
                score >= questions.length * 0.7
                  ? 'text-green-400'
                  : 'text-red-400'
              }
            >
              {score}/{questions.length}
            </span>
          </div>
          <p className="text-[#f7eee3]">
            {score >= questions.length * 0.7
              ? 'Great job! 🎉'
              : 'Keep practicing! 💪'}
          </p>
        </div>

        <div className="mb-6 space-y-4">
          {questions.map((question: TestQuestion, index: number) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = isAnswerCorrect(
              userAnswer || '',
              question.answer,
              question.options || []
            );
            return (
              <div
                className="rounded-lg border-l-4 border-l-gray-500 bg-[#0c0c0c]/50 p-4"
                key={index}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                  ) : (
                    <XCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className="mb-2 font-medium text-[#f7eee3]">
                      {question.question}
                    </p>
                    <div className="text-sm">
                      <p className="text-[#f7eee3]">
                        Your answer:{' '}
                        <span
                          className={
                            isCorrect ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          {userAnswer}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-[#f7eee3]">
                          Correct answer:{' '}
                          <span className="text-green-400">
                            {getCorrectAnswerDisplay(
                              question.answer,
                              question.options || []
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={resetTest}
        >
          <ArrowClockwiseIcon className="mr-2 h-4 w-4" />
          Retake Test
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[#f7eee3]/60 text-sm">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-4 font-light text-3xl text-[#f7eee3] tracking-tight">
          {currentQ?.question}
        </h4>
        <div className="flex flex-col space-y-3">
          {currentQ?.options?.map((option: string, index: number) => (
            <button
              className={`w-1/3 rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                selectedAnswers[currentQuestion] === option
                  ? 'border-2 border-[#FF5E00] bg-[#683D24] text-[#FF5E00]'
                  : 'bg-[#f7eee3] text-[#0c0c0c]'
              }`}
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, option)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    selectedAnswers[currentQuestion] === option
                      ? 'border-[#FF5E00] bg-[#FF5E00]'
                      : 'border-slate-500'
                  }`}
                />
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full items-end justify-end gap-3 p-3">
        {currentQuestion > 0 && (
          <Button
            className="flex-1 border-[#f7eee3] bg-[#0c0c0c] text-[#f7eee3]"
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            variant="outline"
          >
            <ArrowLeftIcon />
          </Button>
        )}
        {isLastQuestion ? (
          <Button
            className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            disabled={!allAnswered}
            onClick={calculateScore}
          >
            Submit Test
          </Button>
        ) : (
          <Button
            className="flex-1 bg-[#D96F30] text-[#f7eee3] disabled:opacity-50"
            disabled={!selectedAnswers[currentQuestion]}
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
          >
            <ArrowRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
};

const FlashcardComponent = ({ flashcardsContent }: FlashComponentProps) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    try {
      const flashcards = JSON.parse(flashcardsContent);
      if (currentCard < flashcards.length - 1) {
        setCurrentCard((prev) => prev + 1);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error('Error parsing flashcards:', error);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  let flashcards: FlashcardQuestion[] = [];
  let currentFlashcard: FlashcardQuestion | null = null;

  try {
    flashcards = JSON.parse(flashcardsContent);
    console.log('Parsed flashcards:', flashcards); // Add this line
    currentFlashcard = flashcards[currentCard] || null;
  } catch (error) {
    console.error('Error parsing flashcards:', error);
    return (
      <div className="p-8 text-center text-red-400">
        Error loading flashcards. Please try again.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 [perspective:1000px]">
        <div
          className={`relative h-80 cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={flipCard}
        >
          <div className="absolute inset-0 h-full w-full [backface-visibility:hidden]">
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-slate-700 bg-[#F7EEE3] p-8">
              <p className="text-center font-medium text-2xl text-[#0c0c0c]">
                {currentFlashcard?.question}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 h-full w-full rotate-y-180 [backface-visibility:hidden]">
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-slate-700 bg-[#F7EEE3] p-8">
              <p className="text-center text-[#0c0c0c] text-xl">
                {currentFlashcard?.answer}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[#f7eee3]/60 text-sm">
          Click card to flip
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          className="text-[#f7eee3] hover:bg-slate-800 disabled:opacity-30"
          disabled={currentCard === 0}
          onClick={prevCard}
          variant="ghost"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Previous
        </Button>
        <span className="text-[#f7eee3]/60 text-sm">
          {currentCard + 1} / {flashcards.length}
        </span>
        <Button
          className="text-[#f7eee3] hover:bg-slate-800 disabled:opacity-30"
          disabled={currentCard === flashcards.length - 1}
          onClick={nextCard}
          variant="ghost"
        >
          Next
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const ContentBlock: React.FC<{
  slide: Slide;
  index: number;
  total: number;
}> = ({ slide, index, total }) => {
  // Combine all content into a single markdown string
  const combinedContent = useMemo(() => {
    // Ensure content is a string
    let content =
      typeof slide.content === 'string'
        ? slide.content
        : String(slide.content || '');

    // Validate content is not empty
    if (!content || content.trim() === '') {
      content = slide.title || 'No content available';
    }

    // Add tables to content if they exist and not already included
    if (slide.tables && typeof slide.tables === 'string') {
      const hasTableInContent =
        content.includes('|') ||
        content.includes('<table') ||
        content.toLowerCase().includes('table');

      if (!hasTableInContent) {
        content += '\n\n' + slide.tables;
      }
    }

    // Add code block if it exists and is not already in content, and is not a placeholder
    if (
      slide.codeContent &&
      slide.codeContent.trim() !== '' &&
      !slide.codeContent.includes('// Code example') &&
      !slide.codeContent.includes('// Code example will be generated') &&
      !content.includes('```')
    ) {
      const codeContent =
        typeof slide.codeContent === 'string'
          ? slide.codeContent
          : String(slide.codeContent);
      const codeBlock = `\n\n\`\`\`${slide.codeLanguage || 'text'}\n${codeContent}\n\`\`\``;
      content += codeBlock;
    }

    // Final validation - ensure we return a string
    return typeof content === 'string' ? content : String(content);
  }, [
    slide.content,
    slide.tables,
    slide.codeContent,
    slide.codeLanguage,
    slide.title,
  ]);

  // Content sanitization helper
  const sanitizeContent = (content: unknown): string => {
    if (content === null || content === undefined) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return String(content);
    if (typeof content === 'boolean') return String(content);

    // Handle React elements
    if (React.isValidElement(content)) {
      if (
        content.props &&
        typeof content.props === 'object' &&
        content.props !== null &&
        'children' in content.props
      ) {
        return sanitizeContent(content.props.children);
      }
      return '';
    }

    // Handle arrays of content
    if (Array.isArray(content)) {
      return content
        .map((item) => sanitizeContent(item))
        .filter(Boolean)
        .join('');
    }

    // Handle objects with children property
    if (content && typeof content === 'object' && content !== null) {
      if (
        'props' in content &&
        content.props &&
        typeof content.props === 'object' &&
        content.props !== null &&
        'children' in content.props
      ) {
        return sanitizeContent(content.props.children);
      }
      if ('children' in content) {
        return sanitizeContent(content.children);
      }
      // If it's a plain object, try to stringify it safely
      try {
        const str = String(content);
        return str === '[object Object]' ? '' : str;
      } catch {
        return '';
      }
    }

    // Fallback
    const str = String(content);
    return str === '[object Object]' ? '' : str;
  };

  // Enhanced markdown components for proper syntax highlighting
  const markdownComponents: Components = {
    code({ node, className, children, ...props }) {
      const codeContent = sanitizeContent(children).replace(/\n$/, '');
      const isInlineCode =
        !className &&
        node?.tagName === 'code' &&
        (node as { parent?: { tagName?: string } })?.parent?.tagName !==
          'pre' &&
        !codeContent.includes('\n');

      if (isInlineCode) {
        return (
          <code
            className="rounded-md bg-gray-700/50 px-1.5 py-1 font-mono text-red-300 text-sm"
            {...props}
          >
            {codeContent}
          </code>
        );
      }

      // For block code, rehype-highlight will add the `className` for the language.
      // The `pre` component below will wrap it.
      return (
        <code className={className} {...props}>
          {codeContent}
        </code>
      );
    },

    pre({ children }) {
      // rehype-highlight wraps code blocks in a <pre> tag.
      // We apply our container styling here.
      return (
        <pre className="my-4 overflow-x-auto rounded-lg border border-gray-700/50 bg-[#1e1e1e] p-4">
          {children}
        </pre>
      );
    },

    // Enhanced table rendering with better structure
    table({ children }) {
      return (
        <div className="my-6 overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
          <table className="min-w-full table-auto bg-theme-bg-secondary">
            {children}
          </table>
        </div>
      );
    },

    thead({ children }) {
      return <thead className="bg-[#FD833C]">{children}</thead>;
    },

    tbody({ children }) {
      return <tbody className="divide-y divide-gray-700">{children}</tbody>;
    },

    th({ children }) {
      const content = sanitizeContent(children);
      return (
        <th className="border-gray-600 border-r px-6 py-3 text-left font-bold text-gray-100 text-xs uppercase tracking-wider last:border-r-0">
          {content}
        </th>
      );
    },

    td({ children }) {
      const content = sanitizeContent(children);
      return (
        <td className="border-gray-700/50 border-r px-6 py-4 text-sm text-white last:border-r-0">
          {content}
        </td>
      );
    },

    tr({ children }) {
      return (
        <tr className="border-gray-700/50 border-b transition-colors duration-200 last:border-b-0 hover:bg-black/40">
          {children}
        </tr>
      );
    },

    // Enhanced image rendering
    img({ src, alt }) {
      if (!src || typeof src !== 'string') return null;
      return (
        <div className="my-4 text-center">
          <img
            alt={alt || ''}
            className="mx-auto h-auto max-w-full rounded-lg shadow-lg"
            height={600}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Show a placeholder or the alt text
              const placeholder = document.createElement('div');
              placeholder.className =
                'bg-gray-800 text-gray-400 p-4 rounded-lg text-center';
              placeholder.textContent = alt || 'Image could not be loaded';
              target.parentNode?.replaceChild(placeholder, target);
            }}
            src={src}
            width={800}
          />
        </div>
      );
    },

    // Enhanced link rendering
    a({ href, children }) {
      if (!href) return <span>{sanitizeContent(children)}</span>;

      const isExternal = href.startsWith('http') || href.startsWith('//');
      const isVideo =
        href.includes('youtube.com') ||
        href.includes('youtu.be') ||
        href.includes('vimeo.com');

      const content = sanitizeContent(children);

      return (
        <a
          className={`inline-flex items-center gap-1 text-blue-400 underline transition-colors hover:text-blue-300 ${
            isVideo ? 'font-medium' : ''
          }`}
          href={href}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {isVideo && <LinkIcon className="h-3 w-3" />}
          {content}
        </a>
      );
    },

    // Enhanced blockquote
    blockquote({ children }) {
      const content = sanitizeContent(children);
      return (
        <blockquote className="my-4 border-blue-400 border-l-4 pl-4 text-white/80 italic">
          {content}
        </blockquote>
      );
    },

    // Enhanced lists
    ul({ children }) {
      return (
        <ul className="my-4 list-inside list-disc space-y-1 text-white">
          {children}
        </ul>
      );
    },

    ol({ children }) {
      return (
        <ol className="my-4 list-inside list-decimal space-y-1 text-white">
          {children}
        </ol>
      );
    },

    li({ children }) {
      const content = sanitizeContent(children);
      return <li className="text-white">{content}</li>;
    },

    // Enhanced paragraphs
    p({ children }) {
      const content = sanitizeContent(children);
      return (
        <p className="font-light text-3xl text-white tracking-tight">
          {content}
        </p>
      );
    },

    // Enhanced headings
    h1({ children }) {
      const content = sanitizeContent(children);
      return <h1 className="mb-4 font-bold text-3xl text-white">{content}</h1>;
    },

    h2({ children }) {
      const content = sanitizeContent(children);
      return (
        <h2 className="mb-3 font-semibold text-2xl text-white">{content}</h2>
      );
    },

    h3({ children }) {
      const content = sanitizeContent(children);
      return <h3 className="mb-2 font-medium text-white text-xl">{content}</h3>;
    },

    h4({ children }) {
      const content = sanitizeContent(children);
      return <h4 className="mb-2 font-medium text-lg text-white">{content}</h4>;
    },

    // Enhanced text elements
    strong({ children }) {
      const content = sanitizeContent(children);
      return <strong className="text-white">{content}</strong>;
    },

    em({ children }) {
      const content = sanitizeContent(children);
      return <em className="text-white italic">{content}</em>;
    },
  };

  // Determine if we should use full-screen layout for tables, tests, or flashcards
  const hasTableContent =
    slide.tables &&
    typeof slide.tables === 'string' &&
    slide.tables.trim() !== '';
  const isTableSlide = hasTableContent;

  // Check if slide has test questions (regardless of type)
  const hasTestQuestions =
    slide.testQuestions &&
    ((typeof slide.testQuestions === 'string' &&
      slide.testQuestions.trim() !== '') ||
      (Array.isArray(slide.testQuestions) && slide.testQuestions.length > 0));

  const isTestSlide = hasTestQuestions;

  const isFlashcardSlide =
    slide.flashcardData &&
    Array.isArray(slide.flashcardData) &&
    slide.flashcardData.length > 0;

  // Check if slide has circuit data

  // Debug logging for slide detection
  console.log(`ContentBlock - Slide "${slide.title}":`, {
    type: slide.type,
    hasTestQuestions,
    isTestSlide,
    testQuestions: slide.testQuestions,
    testQuestionsType: typeof slide.testQuestions,
    testQuestionsLength: Array.isArray(slide.testQuestions)
      ? slide.testQuestions.length
      : 'N/A',
    isFlashcardSlide,
    flashcardData: slide.flashcardData,
    isTableSlide,
  });

  // Extract visual content (images, code, diagrams)
  // Check if codeContent has actual content (not empty or placeholder)
  const hasActualCodeContent =
    slide.codeContent &&
    slide.codeContent.trim() !== '' &&
    !slide.codeContent.includes('// Code example') &&
    !slide.codeContent.includes('// Code example will be generated');

  const hasVisualContent =
    slide.picture ||
    hasActualCodeContent ||
    (combinedContent.includes('```') &&
      !combinedContent.includes('// Code example'));

  // Debug logging for slide data
  console.log('ContentBlock - slide.picture:', slide.picture);
  console.log('ContentBlock - hasActualCodeContent:', hasActualCodeContent);
  console.log('ContentBlock - hasVisualContent:', hasVisualContent);

  // Extract text content for right panel
  const getTextContent = () => {
    let content =
      typeof slide.content === 'string'
        ? slide.content
        : String(slide.content || '');

    // Remove code blocks from text content for right panel
    content = content.replace(/```[\s\S]*?```/g, '');

    // If no meaningful text content, return the title
    if (!content || content.trim() === '') {
      content = slide.title || 'No content available';
    }

    return content;
  };

  const textContent = getTextContent();

  // Full-screen layout for tests
  if (isTestSlide) {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Centered Header */}
        <div className="mb-8 px-6 text-center">
          <div className="mb-4">
            <span className="font-medium text-sm text-white/60">
              {index + 1} of {total}
            </span>
          </div>
          <h1 className="mb-4 font-serif text-5xl text-white italic tracking-tight">
            {slide.title}
          </h1>
          {slide.subTitles && (
            <p className="mx-auto max-w-3xl text-white/80 text-xl">
              {slide.subTitles}
            </p>
          )}
        </div>

        <div className="flex-1 px-8">
          {/* Test Component */}
          {hasTestQuestions ? (
            <TestComponent testQuestions={slide.testQuestions} />
          ) : (
            <div className="p-8 text-center text-[#f7eee3]/60">
              <div className="mb-4 text-4xl">📝</div>
              <p>No test questions available for this slide.</p>
            </div>
          )}

          {/* Additional content below test if any */}
          {textContent && textContent !== slide.title && (
            <div className="prose prose-lg prose-invert mt-6 max-w-none text-white">
              <ReactMarkdown
                components={markdownComponents}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                remarkPlugins={[remarkGfm, remarkMath]}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-screen layout for flashcards
  if (isFlashcardSlide) {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Centered Header */}
        <div className="mb-8 px-6 text-center">
          <div className="mb-4">
            <span className="font-medium text-sm text-white/60">
              {index + 1} of {total}
            </span>
          </div>
          <h1 className="mb-4 font-serif text-5xl text-white italic tracking-tight">
            {slide.title}
          </h1>
          {slide.subTitles && (
            <p className="mx-auto max-w-3xl text-white/80 text-xl">
              {slide.subTitles}
            </p>
          )}
        </div>

        <div className="flex-1 px-8">
          {/* Flashcard Component */}
          <FlashcardComponent
            flashcardsContent={JSON.stringify(slide.flashcardData)}
          />

          {/* Additional content below flashcards if any */}
          {textContent && textContent !== slide.title && (
            <div className="prose prose-lg prose-invert mt-6 max-w-none text-white">
              <ReactMarkdown
                components={markdownComponents}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                remarkPlugins={[remarkGfm, remarkMath]}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-screen layout for tables
  if (isTableSlide) {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Centered Header */}
        <div className="mb-8 px-6 text-center">
          <div className="mb-4">
            <span className="font-medium text-sm text-white/60">
              {index + 1} of {total}
            </span>
          </div>
          <h1 className="mb-4 font-serif text-5xl text-white italic tracking-tight">
            {slide.title}
          </h1>
          {slide.subTitles && (
            <p className="mx-auto max-w-3xl text-white/80 text-xl">
              {slide.subTitles}
            </p>
          )}
        </div>

        <div className="flex-1 px-8">
          {/* Full-width table */}
          <div className="mb-6">
            <div className="prose prose-lg prose-invert max-w-none">
              <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {slide.tables}
              </ReactMarkdown>
            </div>
          </div>

          {/* Additional content below table if any */}
          {textContent && textContent !== slide.title && (
            <div className="prose prose-lg prose-invert max-w-none text-white">
              <ReactMarkdown
                components={markdownComponents}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                remarkPlugins={[remarkGfm, remarkMath]}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-screen layout for circuits

  // Two-panel layout for regular content
  return (
    <div className="flex h-full w-full flex-col">
      {/* Centered Header */}
      <div className="mb-8 px-6 text-center">
        <div className="mb-4">
          <span className="font-medium text-sm text-white/60">
            {index + 1} of {total}
          </span>
        </div>
        <h1 className="mb-4 font-serif text-5xl text-white italic tracking-tight">
          {slide.title}
        </h1>
      </div>

      {/* Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Text Content */}
        <div
          className={`${hasVisualContent ? 'w-1/2' : 'w-full'} overflow-y-auto p-8`}
        >
          <div className="prose prose-lg prose-invert max-w-none text-white">
            {/* Main text content */}
            {textContent && textContent !== slide.title && (
              <div className="mb-6">
                <ReactMarkdown
                  components={{
                    ...markdownComponents,
                    // Don't render code blocks in left panel
                    code: ({ children, className }) => {
                      const childrenText = Array.isArray(children)
                        ? children
                            .map((child) =>
                              typeof child === 'string' ? child : ''
                            )
                            .join('')
                        : typeof children === 'string'
                          ? children
                          : typeof children === 'number'
                            ? String(children)
                            : '';
                      const isInlineCode = !(
                        className || childrenText.includes('\n')
                      );
                      if (isInlineCode) {
                        return (
                          <code className="z-2 rounded border-2 border-white/30 bg-black/60 px-2 py-1 text-sm text-white">
                            {childrenText}
                          </code>
                        );
                      }
                      return null; // Skip code blocks
                    },
                    pre: () => null, // Skip pre blocks
                  }}
                  rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                  remarkPlugins={[remarkGfm, remarkMath]}
                >
                  {textContent}
                </ReactMarkdown>
              </div>
            )}

            {/* Bullet Points */}
            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
              <div className="mb-6">
                <div className="space-y-3">
                  {slide.bulletPoints.map((point, idx) => (
                    <div className="flex items-start gap-3 p-4" key={idx}>
                      <div className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-[#CBF8FE]" />
                      <span className="font-light text-3xl text-white leading-relaxed tracking-tight">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Visual Content */}
        {hasVisualContent && (
          <div className="w-1/2 overflow-y-auto border-white/20 border-l p-8">
            <div className="flex h-full flex-col justify-start">
              {/* Picture */}
              {slide.picture && (
                <div className="mb-6">
                  <img
                    alt={slide.title}
                    className="mx-auto max-h-[60vh] w-full max-w-full rounded-lg object-contain shadow-lg"
                    height={600}
                    onError={(e) => {
                      console.error('Image failed to load:', slide.picture);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', slide.picture);
                    }}
                    src={
                      slide.picture.startsWith('http')
                        ? slide.picture
                        : `https://${slide.picture}`
                    }
                    width={800}
                  />
                </div>
              )}

              {/* Code Block */}
              {hasActualCodeContent && (
                <div className="mb-6">
                  <ReactMarkdown
                    components={markdownComponents}
                    rehypePlugins={[rehypeHighlight]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {`\`\`\`${slide.codeLanguage || ''}\n${slide.codeContent}\n\`\`\``}
                  </ReactMarkdown>
                </div>
              )}

              {/* Code from markdown content */}
              {!hasActualCodeContent &&
                combinedContent.includes('```') &&
                !combinedContent.includes('// Code example') && (
                  <div className="mb-6">
                    <div className="prose prose-lg prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          ...markdownComponents,
                          // Only render code blocks, ignore other elements
                          p: () => null,
                          h1: () => null,
                          h2: () => null,
                          h3: () => null,
                          h4: () => null,
                          ul: () => null,
                          ol: () => null,
                          li: () => null,
                          blockquote: () => null,
                          a: () => null,
                          strong: () => null,
                          em: () => null,
                        }}
                        rehypePlugins={[
                          rehypeKatex,
                          rehypeHighlight,
                          rehypeRaw,
                        ]}
                        remarkPlugins={[remarkGfm, remarkMath]}
                      >
                        {combinedContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dynamic import for CircuitBricksRenderer to avoid SSR issues
const CircuitBricksRenderer = dynamic(
  () => import('./ui/CircuitBricksRenderer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
          <p className="text-gray-600">Loading circuit canvas...</p>
        </div>
      </div>
    ),
  }
);

const LoadingSequence: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSteps] = useState<string[]>(['1', '2', '3']);

  const learningSteps = [
    {
      id: '1',
      title: 'Research & Discovery',
      description: 'Gathering comprehensive information about your topic',
      subtasks: [
        {
          id: '1.1',
          title: 'Fetching the syllabus',
          description: 'Building a structured learning pathway',
        },
        {
          id: '1.2',
          title: 'Fetching information from the web',
          description: 'Searching latest resources and articles',
        },
        {
          id: '1.3',
          title: 'Fetching information from knowledge search',
          description: 'Accessing curated knowledge databases',
        },
      ],
    },
    {
      id: '2',
      title: 'Content Analysis',
      description: 'Processing and structuring the gathered information',
      subtasks: [
        {
          id: '2.1',
          title: 'Analysing the information',
          description: 'Extracting key concepts and relationships',
        },
        {
          id: '2.2',
          title: 'Summarizing the information',
          description: 'Creating digestible content blocks',
        },
      ],
    },
    {
      id: '3',
      title: 'Interactive Learning Creation',
      description: 'Building engaging learning materials',
      subtasks: [
        {
          id: '3.1',
          title: 'Creating flash cards',
          description: 'Designing memory reinforcement tools',
        },
        {
          id: '3.2',
          title: 'Creating test questions',
          description: 'Generating assessment materials',
        },
        {
          id: '3.3',
          title: 'Creating the lecture content',
          description: 'Assembling comprehensive learning slides',
        },
      ],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < learningSteps.length * 3 - 1) {
          return prev + 1;
        }
        return prev; // Stay at the last step
      });
    }, 3000); // 4 seconds per step

    return () => clearInterval(timer);
  }, [learningSteps.length]);

  // Calculate which tasks/subtasks should be active/completed
  const getStepStatus = (stepIndex: number, subtaskIndex?: number) => {
    const totalSubtasks = learningSteps
      .slice(0, stepIndex)
      .reduce((acc, step) => acc + step.subtasks.length, 0);
    const currentSubtaskGlobal =
      subtaskIndex !== undefined ? totalSubtasks + subtaskIndex : totalSubtasks;

    if (subtaskIndex !== undefined) {
      if (currentSubtaskGlobal < currentStep) return 'completed';
      if (currentSubtaskGlobal === currentStep) return 'in-progress';
      return 'pending';
    }
    const stepStart = totalSubtasks;
    const step = learningSteps[stepIndex];
    if (!step) return 'pending';
    const stepEnd = totalSubtasks + step.subtasks.length - 1;

    if (currentStep > stepEnd) return 'completed';
    if (currentStep >= stepStart && currentStep <= stepEnd)
      return 'in-progress';
    return 'pending';
  };

  return (
    <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
      {/* Black background */}
      <div className="absolute inset-0 z-0 bg-black" />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Grid lines */}
      <div className="pointer-events-none absolute inset-0 z-15">
        {/* Vertical lines */}
        <div className="absolute top-0 left-[25%] h-full w-px bg-white/20" />
        <div className="absolute top-0 left-[50%] h-full w-px bg-white/20" />
        <div className="absolute top-0 left-[75%] h-full w-px bg-white/20" />
        {/* Horizontal lines */}
        <div className="absolute top-[25%] left-0 h-px w-full bg-white/20" />
        <div className="absolute top-[50%] left-0 h-px w-full bg-white/20" />
        <div className="absolute top-[75%] left-0 h-px w-full bg-white/20" />
        {/* Corner circles */}
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[25%] left-[25%] h-2 w-2 transform rounded-full bg-white/60" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[25%] left-[75%] h-2 w-2 transform rounded-full bg-white/60" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[75%] left-[25%] h-2 w-2 transform rounded-full bg-white/60" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[75%] left-[75%] h-2 w-2 transform rounded-full bg-white/60" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[50%] left-[50%] h-3 w-3 transform rounded-full bg-white/80" />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-2xl px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-light text-4xl text-white">
            Creating your <span className="font-serif italic">learning</span>{' '}
            experience
          </h1>
          <p className="text-sm text-white/60">
            Please wait while we craft your personalized learning journey
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/20 bg-black/40 shadow-2xl backdrop-blur-sm">
          <div className="p-6">
            <ul className="space-y-1">
              {learningSteps.map((step, stepIndex) => {
                const stepStatus = getStepStatus(stepIndex);
                const isExpanded = expandedSteps.includes(step.id);
                const isCompleted = stepStatus === 'completed';

                return (
                  <li
                    className={`${stepIndex !== 0 ? 'mt-1 pt-2' : ''}`}
                    key={step.id}
                  >
                    {/* Task row */}
                    <div className="group flex items-center rounded-md px-3 py-1.5 transition-colors hover:bg-white/5">
                      <div className="mr-2 flex-shrink-0">
                        <div className="transition-all duration-300">
                          {stepStatus === 'completed' ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-green-400" />
                          ) : stepStatus === 'in-progress' ? (
                            <CircleDotDashed className="h-4.5 w-4.5 animate-pulse text-blue-400" />
                          ) : (
                            <Circle className="h-4.5 w-4.5 text-white/60" />
                          )}
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-grow items-center justify-between">
                        <div className="mr-2 flex-1">
                          <span
                            className={`${isCompleted ? 'text-white/50 line-through' : 'text-white'} font-medium transition-all duration-300`}
                          >
                            {step.title}
                          </span>
                          <p
                            className={`text-sm ${isCompleted ? 'text-white/30' : 'text-white/60'} transition-all duration-300`}
                          >
                            {step.description}
                          </p>
                        </div>

                        <span
                          className={`rounded px-1.5 py-0.5 text-xs transition-all duration-300 ${
                            stepStatus === 'completed'
                              ? 'border border-green-400/30 bg-green-400/20 text-green-400'
                              : stepStatus === 'in-progress'
                                ? 'border border-blue-400/30 bg-blue-400/20 text-blue-400'
                                : 'border border-white/20 bg-white/10 text-white/60'
                          }`}
                        >
                          {stepStatus}
                        </span>
                      </div>
                    </div>

                    {/* Subtasks */}
                    {isExpanded && (
                      <div className="relative overflow-hidden transition-all duration-300">
                        <div className="absolute top-0 bottom-0 left-[20px] border-white/30 border-l-2 border-dashed" />
                        <ul className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                          {step.subtasks.map((subtask, subtaskIndex) => {
                            const subtaskStatus = getStepStatus(
                              stepIndex,
                              subtaskIndex
                            );

                            return (
                              <li
                                className="group flex flex-col py-0.5 pl-6"
                                key={subtask.id}
                              >
                                <div className="flex flex-1 items-center rounded-md p-1 transition-colors hover:bg-white/3">
                                  <div className="mr-2 flex-shrink-0">
                                    <div className="transition-all duration-300">
                                      {subtaskStatus === 'completed' ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                      ) : subtaskStatus === 'in-progress' ? (
                                        <CircleDotDashed className="h-3.5 w-3.5 animate-pulse text-blue-400" />
                                      ) : (
                                        <Circle className="h-3.5 w-3.5 text-white/60" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <span
                                      className={`text-sm transition-all duration-300 ${subtaskStatus === 'completed' ? 'text-white/50 line-through' : subtaskStatus === 'in-progress' ? 'animate-pulse text-white' : 'text-white'}`}
                                    >
                                      {subtask.title}
                                    </span>
                                    <p
                                      className={`text-xs transition-all duration-300 ${subtaskStatus === 'completed' ? 'text-white/30' : 'text-white/50'}`}
                                    >
                                      {subtask.description}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

const SlideNavigation: React.FC<{
  currentIndex: number;
  totalSlides: number;
  currentSlide: Slide;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ currentIndex, totalSlides, currentSlide, onPrevious, onNext }) => {
  return (
    <div className="-translate-x-1/2 fixed bottom-8 left-1/2 w-auto transform">
      <div className="flex items-center gap-2 rounded-3xl border border-white/20 bg-black/60 p-2 shadow-2xl backdrop-blur-md">
        {/* Links Section */}
        {currentSlide.links && currentSlide.links.length > 0 ? (
          <>
            {currentSlide.links.map((link, index) => (
              <a
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-medium text-sm text-white transition-all duration-200 hover:border-white/30 hover:bg-white/20"
                href={link}
                key={index}
                rel="noopener noreferrer"
                target="_blank"
              >
                <LinkIcon className="mr-2 inline h-3 w-3" />
                Link {index + 1}
              </a>
            ))}
          </>
        ) : currentSlide.youtubeSearchText ? (
          <a
            className="rounded-full border border-red-500/30 bg-red-600/20 px-4 py-2 font-medium text-sm text-white transition-all duration-200 hover:border-red-500/50 hover:bg-red-600/30"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
              currentSlide.youtubeSearchText
            )}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <LinkIcon className="mr-2 inline h-3 w-3" />
            YouTube
          </a>
        ) : null}

        {/* Navigation Buttons */}
        <div className="flex items-center">
          <button
            className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={currentIndex === 0}
            onClick={onPrevious}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <button
            className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={currentIndex === totalSlides - 1}
            onClick={onNext}
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Learning = () => {
  const params = useParams();
  const chatId = params.learn || params.chatId; // Try both param names
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  console.log('Learning component - all params:', params);
  console.log('Learning component - chatId from params:', chatId);

  const messages = useQuery(
    api.message.getMessages,
    chatId ? { chatId: chatId as Id<'chats'> } : 'skip'
  );

  console.log('Learning component - useQuery result:', {
    messages,
    messagesType: typeof messages,
    messagesIsArray: Array.isArray(messages),
    messagesLength: messages?.length,
  });

  const slides = useMemo(() => {
    console.log('Learning component - messages:', messages);

    if (!messages || messages.length === 0) {
      console.log('Learning component - no messages found');
      return [];
    }

    const assistantMessage = messages.find(
      (msg: Message) => msg.role === 'assistant'
    );
    if (!(assistantMessage && assistantMessage.content)) return [];

    try {
      // Check if the content is already a JSON string containing slides
      let parsedData;

      if (typeof assistantMessage.content === 'string') {
        // Try to parse the string as JSON
        parsedData = JSON.parse(assistantMessage.content);
      } else {
        // Content is already an object
        parsedData = assistantMessage.content;
      }

      // Check if we have a slides array
      if (!(parsedData.slides && Array.isArray(parsedData.slides))) {
        console.error('No slides array found in parsed data:', parsedData);
        return [];
      }

      console.log('Successfully parsed slides:', parsedData.slides);

      // Transform the slide data to fix the nested `code` object bug.
      // The AI is returning `code: { content: '...', language: '...' }`
      // but the frontend expects `codeContent: '...'` and `codeLanguage: '...'`.
      return parsedData.slides.map((slide: RawSlideData, index: number) => {
        // Ensure all required fields are present with defaults
        const transformedSlide = {
          name: slide.name || 'slide 1',
          title: slide.title || 'Learning Module',
          content: slide.content || '',
          type: slide.type || 'markdown',
          subTitles: slide.subTitles || '',
          picture: slide.picture || '',
          links: slide.links || [],
          youtubeSearchText: slide.youtubeSearchText || '',
          codeLanguage: slide.codeLanguage || '',
          codeContent: slide.codeContent || '',
          tables: slide.tables || '',
          bulletPoints: slide.bulletPoints || [],
          audioScript: slide.audioScript || '',
          testQuestions: slide.testQuestions || [],
          flashcardData: slide.flashcardData || [],
        };

        // Handle nested code object if present
        if (slide.code && typeof slide.code.content !== 'undefined') {
          transformedSlide.codeContent = slide.code.content;
          transformedSlide.codeLanguage = slide.code.language || '';
        }

        console.log(`Transformed slide "${slide.title}":`, transformedSlide);
        return transformedSlide;
      });
    } catch (error) {
      console.error('Error parsing and transforming slides:', error);
      console.error('Raw assistant message content:', assistantMessage.content);
      return [];
    }
  }, [messages]);
  // Debug: log the œ
  useEffect(() => {
    console.log('=== SLIDES DEBUG ===');
    console.log('Messages:', messages);
    console.log('Messages length:', messages?.length);
    console.log('Slides:', slides);
    console.log('Slides length:', slides.length);
    console.log('Current slide index:', currentSlideIndex);
    console.log('Current slide:', slides[currentSlideIndex]);

    if (messages && messages.length > 0) {
      const assistantMessage = messages.find(
        (msg: Message) => msg.role === 'assistant'
      );
      console.log('Assistant message:', assistantMessage);
      if (assistantMessage) {
        console.log(
          'Assistant message content type:',
          typeof assistantMessage.content
        );
        console.log(
          'Assistant message content preview:',
          typeof assistantMessage.content === 'string'
            ? assistantMessage.content.substring(0, 200) + '...'
            : assistantMessage.content
        );
      }
    }
    console.log('=== END SLIDES DEBUG ===');

    if (slides.length > 0) {
      slides.forEach((slide: Slide, index: number) => {
        console.log(`Slide ${index + 1}:`, {
          title: slide.title,
          type: slide.type,
          picture: slide.picture,
          pictureExists: !!slide.picture,
          pictureLength:
            typeof slide.picture === 'string' ? slide.picture.length : 0,
          hasVisualContent: !!(
            slide.picture ||
            slide.codeContent ||
            slide.tables
          ),
          testQuestions: slide.testQuestions,
          hasTestQuestions: !!(
            slide.testQuestions &&
            ((typeof slide.testQuestions === 'string' &&
              slide.testQuestions.trim() !== '') ||
              (Array.isArray(slide.testQuestions) &&
                slide.testQuestions.length > 0))
          ),
          flashcardData: slide.flashcardData,
          hasFlashcards: !!(
            slide.flashcardData &&
            Array.isArray(slide.flashcardData) &&
            slide.flashcardData.length > 0
          ),
        });
      });
    }
  }, [slides, messages, currentSlideIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        console.log('Going to previous slide'); // Debug log
        handlePrevious();
      }
      if (e.key === 'ArrowRight') {
        console.log('Going to next slide'); // Debug log
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, handlePrevious, handleNext]);

  const currentSlide = slides[currentSlideIndex];

  console.log('=== RENDER DEBUG ===');
  console.log('Current slide:', currentSlide);
  console.log('Current slide index:', currentSlideIndex);
  console.log('Total slides:', slides.length);
  console.log('Messages undefined?', messages === undefined);
  console.log('Should show loading?', !currentSlide);
  console.log('=== END RENDER DEBUG ===');

  // Show loading if no messages yet
  if (!currentSlide) {
    console.log(
      'Learning component - showing LoadingSequence (no current slide)'
    );
    return <LoadingSequence />;
  }

  return (
    <main className="relative min-h-[100svh] w-[100svw] px-4 py-4">
      {/* Black background */}
      <div className="absolute inset-0 z-0 bg-black" />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 z-10 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Subtle grid lines for content area */}
      <div className="pointer-events-none absolute inset-0 z-15">
        {/* Vertical lines */}
        <div className="absolute top-0 left-[20%] h-full w-px bg-white/10" />
        <div className="absolute top-0 left-[80%] h-full w-px bg-white/10" />
        {/* Horizontal lines */}
        <div className="absolute top-[15%] left-0 h-px w-full bg-white/10" />
        <div className="absolute top-[85%] left-0 h-px w-full bg-white/10" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full w-full">
        <ContentBlock
          index={currentSlideIndex}
          slide={currentSlide}
          total={slides.length}
        />

        <SlideNavigation
          currentIndex={currentSlideIndex}
          currentSlide={currentSlide}
          onNext={handleNext}
          onPrevious={handlePrevious}
          totalSlides={slides.length}
        />
      </div>
    </main>
  );
};

// Circuit Component

export default Learning;
