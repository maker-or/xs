'use client';
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LinkIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
// Import Convex types
import type { Doc } from 'convex/_generated/dataModel';
import { CheckCircle2, Circle, CircleDotDashed } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { Button } from './ui/button';

// Use the generated Convex types
type Stage = Doc<'Stage'>;
type Slide = Stage['slides'][0]; // Get the slide type from the Stage document

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
  testQuestions: TestQuestion[];
};

type FlashComponentProps = {
  flashcardsContent: string;
};

// Test Component (same as Learning.tsx)
const TestComponent = ({ testQuestions }: TestComponentProps) => {
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

  const isAnswerCorrect = (
    userAnswer: string,
    correctAnswer: string | number,
    options: string[]
  ) => {
    if (!userAnswer || correctAnswer === undefined || correctAnswer === null)
      return false;

    const normalizedUserAnswer = userAnswer.toString().trim();
    const normalizedCorrectAnswer = correctAnswer.toString().trim();

    // Case 1: The answer is the full text of the option
    if (
      normalizedUserAnswer.toLowerCase() ===
      normalizedCorrectAnswer.toLowerCase()
    ) {
      return true;
    }

    // Case 2: The answer is a letter key (e.g., "B")
    if (
      normalizedCorrectAnswer.length === 1 &&
      /^[A-Z]$/i.test(normalizedCorrectAnswer)
    ) {
      const expectedPrefix = `${normalizedCorrectAnswer.toUpperCase()}.`;
      if (normalizedUserAnswer.toUpperCase().startsWith(expectedPrefix)) {
        return true;
      }
    }

    // Case 3: The answer is an index
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

  const getCorrectAnswerDisplay = (
    correctAnswer: string | number,
    options: string[]
  ) => {
    if (correctAnswer === undefined || correctAnswer === null)
      return 'Not specified';

    const normalizedCorrectAnswer = String(correctAnswer).trim();

    // Case 1: The answer is a letter key
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

    return String(correctAnswer);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    testQuestions.forEach((question: TestQuestion, index: number) => {
      const userAnswer = selectedAnswers[index];
      const correctAnswer = question.answer;
      const options = question.options || [];

      if (isAnswerCorrect(userAnswer || '', correctAnswer, options)) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const currentQ = testQuestions[currentQuestion] || null;
  const isLastQuestion = currentQuestion === testQuestions.length - 1;
  const allAnswered = testQuestions.every(
    (_: TestQuestion, index: number) => selectedAnswers[index]
  );

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
                score >= testQuestions.length * 0.7
                  ? 'text-green-400'
                  : 'text-red-400'
              }
            >
              {score}/{testQuestions.length}
            </span>
          </div>
          <p className="text-[#f7eee3]">
            {score >= testQuestions.length * 0.7
              ? 'Great job! 🎉'
              : 'Keep practicing! 💪'}
          </p>
        </div>

        <div className="mb-6 space-y-4">
          {testQuestions.map((question: TestQuestion, index: number) => {
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
            {currentQuestion + 1} of {testQuestions.length}
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

// Flashcard Component (same as Learning.tsx)
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

// Content Block Component (similar to Learning.tsx but adapted for Stage)
const ContentBlock: React.FC<{
  slide: Slide;
  index: number;
  total: number;
}> = ({ slide, index, total }) => {
  const combinedContent = useMemo(() => {
    let content =
      typeof slide.content === 'string'
        ? slide.content
        : String(slide.content || '');

    if (!content || content.trim() === '') {
      content = slide.title || 'No content available';
    }

    if (slide.tables && typeof slide.tables === 'string') {
      const hasTableInContent =
        content.includes('|') ||
        content.includes('<table') ||
        content.toLowerCase().includes('table');

      if (!hasTableInContent) {
        content += '\n\n' + slide.tables;
      }
    }

    if (
      slide.code?.content &&
      slide.code.content.trim() !== '' &&
      !content.includes('```')
    ) {
      const codeContent = slide.code.content;
      const codeBlock = `\n\n\`\`\`${slide.code.language || 'text'}\n${codeContent}\n\`\`\``;
      content += codeBlock;
    }

    return typeof content === 'string' ? content : String(content);
  }, [slide.content, slide.tables, slide.code, slide.title]);

  // Content sanitization helper
  const sanitizeContent = (content: unknown): string => {
    if (content === null || content === undefined) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return String(content);
    if (typeof content === 'boolean') return String(content);

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

    if (Array.isArray(content)) {
      return content
        .map((item) => sanitizeContent(item))
        .filter(Boolean)
        .join('');
    }

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
      try {
        const str = String(content);
        return str === '[object Object]' ? '' : str;
      } catch {
        return '';
      }
    }

    const str = String(content);
    return str === '[object Object]' ? '' : str;
  };

  // Enhanced markdown components
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

      return (
        <code className={className} {...props}>
          {codeContent}
        </code>
      );
    },

    pre({ children }) {
      return (
        <pre className="my-4 overflow-x-auto rounded-lg border border-gray-700/50 bg-[#1e1e1e] p-4">
          {children}
        </pre>
      );
    },

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

    blockquote({ children }) {
      const content = sanitizeContent(children);
      return (
        <blockquote className="my-4 border-blue-400 border-l-4 pl-4 text-white/80 italic">
          {content}
        </blockquote>
      );
    },

    ul({ children }) {
      return (
        <ul className="my-4 list-inside list-disc space-y-5 text-white leading-relaxed tracking-tight">
          {children}
        </ul>
      );
    },

    ol({ children }) {
      return (
        <ol className="my-4 list-inside list-decimal space-y-5 text-white leading-relaxed tracking-tight">
          {children}
        </ol>
      );
    },

    li({ children }) {
      const content = sanitizeContent(children);
      return <li className="font-light text-2xl text-white/80">{content}</li>;
    },

    p({ children }) {
      const content = sanitizeContent(children);
      return (
        <p className="font-light text-3xl text-white tracking-tight">
          {content}
        </p>
      );
    },

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

    strong({ children }) {
      const content = sanitizeContent(children);
      return <strong className="text-white">{content}</strong>;
    },

    em({ children }) {
      const content = sanitizeContent(children);
      return <em className="text-white italic">{content}</em>;
    },
  };

  // Check slide types
  const hasTestQuestions =
    slide.testQuestions &&
    Array.isArray(slide.testQuestions) &&
    slide.testQuestions.length > 0;

  const isFlashcardSlide =
    slide.flashcardData &&
    Array.isArray(slide.flashcardData) &&
    slide.flashcardData.length > 0;

  const hasTableContent =
    slide.tables &&
    typeof slide.tables === 'string' &&
    slide.tables.trim() !== '';

  const hasActualCodeContent =
    slide.code?.content && slide.code.content.trim() !== '';

  const hasVisualContent =
    slide.svg || hasActualCodeContent || combinedContent.includes('```');

  const getTextContent = () => {
    let content =
      typeof slide.content === 'string'
        ? slide.content
        : String(slide.content || '');

    content = content.replace(/```[\s\S]*?```/g, '');

    if (!content || content.trim() === '') {
      content = slide.title || 'No content available';
    }

    return content;
  };

  const textContent = getTextContent();

  // Full-screen layout for tests
  if (hasTestQuestions) {
    return (
      <div className="flex h-full w-full flex-col">
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
          <TestComponent testQuestions={slide.testQuestions ?? []} />

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
          <FlashcardComponent
            flashcardsContent={JSON.stringify(slide.flashcardData)}
          />

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
  if (hasTableContent) {
    return (
      <div className="flex h-full w-full flex-col">
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

  // Two-panel layout for regular content
  return (
    <div className="flex h-full w-full flex-col">
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

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${hasVisualContent ? 'w-1/2' : 'w-full'} overflow-y-auto p-8`}
        >
          <div className="prose prose-lg prose-invert max-w-none text-white">
            {textContent && textContent !== slide.title && (
              <div className="mb-6">
                <ReactMarkdown
                  components={{
                    ...markdownComponents,
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
                      return null;
                    },
                    pre: () => null,
                  }}
                  rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                  remarkPlugins={[remarkGfm, remarkMath]}
                >
                  {textContent}
                </ReactMarkdown>
              </div>
            )}

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

        {hasVisualContent && (
          <div className="w-1/2 overflow-y-auto border-l ">
            <div className="flex h-full flex-col justify-start">
              {slide.svg && (
                <div className="mb-6">
                  <div
                    className="mx-auto max-h-[60vh] w-full max-w-full rounded-lg bg-[#0F100F] shadow-lg"
                    dangerouslySetInnerHTML={{ __html: slide.svg }}
                  />
                </div>
              )}

              {hasActualCodeContent && (
                <div className="mb-6">
                  <ReactMarkdown
                    components={markdownComponents}
                    rehypePlugins={[rehypeHighlight]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {`\`\`\`${slide.code?.language || ''}\n${slide.code?.content}\n\`\`\``}
                  </ReactMarkdown>
                </div>
              )}

              {!hasActualCodeContent && combinedContent.includes('```') && (
                <div className="mb-6">
                  <div className="prose prose-lg prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        ...markdownComponents,
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
                      rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
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

// Slide Navigation Component
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

// Main StageInfo Component
interface StageInfoProps {
  stage: Stage;
}

const StageInfo: React.FC<StageInfoProps> = ({ stage }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handlePrevious = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(stage.slides.length - 1, prev + 1));
  }, [stage.slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  const currentSlide = stage.slides[currentSlideIndex];

  if (!currentSlide) {
    return (
      <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black" />
        <div className="relative z-20 text-center">
          <p className="text-white/80">No slides available for this stage.</p>
        </div>
      </main>
    );
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
          total={stage.slides.length}
        />

        <SlideNavigation
          currentIndex={currentSlideIndex}
          currentSlide={currentSlide}
          onNext={handleNext}
          onPrevious={handlePrevious}
          totalSlides={stage.slides.length}
        />
      </div>
    </main>
  );
};

export default StageInfo;
