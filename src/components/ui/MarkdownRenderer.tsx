'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import DOMPurify from 'dompurify';
import dynamic from 'next/dynamic';
import type React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import GrammarRenderer from './GrammarRenderer';
import 'katex/dist/katex.min.css';
import { Check, Copy } from 'lucide-react';
import AutomataRenderer from './AutomataRenderer';
import CitationRenderer from './CitationRenderer';
import MermaidRenderer from './MermaidRenderer';
import TypogramRenderer from './TypogramRenderer';

// Extract static plugin configurations outside component for React Compiler optimization
const REMARK_PLUGINS = [
  remarkGfm,
  remarkBreaks,
  remarkEmoji,
  [
    remarkMath,
    { singleDollarTextMath: true, doubleBacktickMathDisplay: false },
  ],
];

const REHYPE_PLUGINS = [
  rehypeHighlight,
  [
    rehypeKatex,
    {
      strict: false,
      trust: true,
      throwOnError: false,
      errorColor: '#cc0000',
      displayMode: false,
      fleqn: false,
      macros: {
        // Vector notation
        '\\vec': '\\overrightarrow{#1}',
        '\\vect': '\\mathbf{#1}',

        // Common mathematical shortcuts
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
        '\\Q': '\\mathbb{Q}',
        '\\C': '\\mathbb{C}',

        // Derivatives and differentials
        '\\dd': '\\,\\mathrm{d}',
        '\\dv': '\\frac{\\mathrm{d}#1}{\\mathrm{d}#2}',
        '\\pdv': '\\frac{\\partial#1}{\\partial#2}',

        // Common functions
        '\\abs': '\\left|#1\\right|',
        '\\norm': '\\left\\|#1\\right\\|',
        '\\floor': '\\left\\lfloor#1\\right\\rfloor',
        '\\ceil': '\\left\\lceil#1\\right\\rceil',

        // Probability and statistics
        '\\Pr': '\\mathrm{Pr}',
        '\\E': '\\mathrm{E}',
        '\\Var': '\\mathrm{Var}',
        '\\Cov': '\\mathrm{Cov}',

        // Linear algebra
        '\\tr': '\\mathrm{tr}',
        '\\rank': '\\mathrm{rank}',
        '\\det': '\\mathrm{det}',

        // Limits and big operators
        '\\lim': '\\lim',
        '\\limsup': '\\limsup',
        '\\liminf': '\\liminf',

        // Set theory
        '\\powerset': '\\mathcal{P}',

        // Complex analysis
        '\\Re': '\\mathrm{Re}',
        '\\Im': '\\mathrm{Im}',

        // Number theory
        '\\gcd': '\\mathrm{gcd}',
        '\\lcm': '\\mathrm{lcm}',

        // Logic
        '\\land': '\\wedge',
        '\\lor': '\\vee',
        '\\lnot': '\\neg',
      },
    },
  ],
  rehypeRaw,
  rehypeSlug,
  [
    rehypeExternalLinks,
    { target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] },
  ],
];

// Dynamic import for CircuitBricksRenderer to avoid SSR issues
const CircuitBricksRenderer = dynamic(() => import('./CircuitBricksRenderer'), {
  ssr: false,
});

// Fix interface to include className, width and height props
interface MarkdownRendererProps {
  content: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  onlyText?: boolean; // New prop to render only text content
  onlyDiagrams?: boolean; // New prop to render only diagrams
  excludeCitations?: boolean; // New prop to exclude citations from rendering
}

const parseAndFormatContent = (content: string): string => {
  // Regular expression to match code blocks (with optional language)
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const segments: string[] = [];
  let lastIndex = 0;
  let match;

  // Iterate over code blocks and split text into non-code and code segments
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Sanitize text before the current code block
    const nonCodeSegment = content.substring(lastIndex, match.index);
    const sanitizedNonCode = DOMPurify.sanitize(nonCodeSegment, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['style'],
      ADD_TAGS: ['script'],
      ADD_ATTR: ['type'],
    });
    segments.push(sanitizedNonCode);

    // Keep the code block intact, but trim the inner code
    const lang = match[1];
    const code = (match[2] ?? '').trim();
    segments.push(
      `\n\n<pre><code class="language-${lang}">${code}</code></pre>\n\n`
    );
    lastIndex = match.index + match[0].length;
  }
  // Sanitize any remaining part after the last code block
  const remaining = content.substring(lastIndex);
  const sanitizedRemaining = DOMPurify.sanitize(remaining, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style'],
    ADD_TAGS: ['script'],
    ADD_ATTR: ['type'],
  });
  segments.push(sanitizedRemaining);

  // Return the combined content
  return segments.join('');
};

// Enhanced mathematical notation preprocessing
const preprocessMathNotation = (content: string): string => {
  // First, protect existing math expressions from being processed
  const mathExpressions: string[] = [];
  let mathIndex = 0;

  // Protect existing math expressions
  content = content
    .replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      mathExpressions.push(match);
      return `__MATH_BLOCK_${mathIndex++}__`;
    })
    .replace(/\$[^$\n]+?\$/g, (match) => {
      mathExpressions.push(match);
      return `__MATH_INLINE_${mathIndex++}__`;
    });

  // Now process mathematical expressions in regular text
  content = content
    // Handle already formatted expressions like 3^{4} that need math delimiters
    .replace(/\b([a-zA-Z0-9]+)\^(\{[^}]+\})/g, '$$$1^$2$$') // 3^{4} -> $3^{4}$
    .replace(/\b([a-zA-Z0-9]+)_(\{[^}]+\})/g, '$$$1_$2$$') // x_{1} -> $x_{1}$

    // Handle only very specific mathematical superscripts and subscripts

    // Handle numbers with simple superscripts (like 2^8)
    .replace(/\b(\d+)\^(\d+)\b/g, '$$$1^{$2}$$')

    // Handle specific mathematical expressions like 2^φ(15)
    .replace(/\b(\d+)\^φ\((\d+)\)/g, '$$$1^{\\phi($2)}$$')

    // Handle specific mathematical function notation only
    .replace(/\bφ\((\d+)\)/g, '$$\\phi($1)$$')

    // Handle modular arithmetic only when clearly formatted
    .replace(
      /(\d+)\s*≡\s*(\d+)\s*\(mod\s*(\d+)\)/g,
      '$$$1 \\equiv $2 \\pmod{$3}$$'
    )

    // Handle fractions
    .replace(/\b(\d+)\/(\d+)\b/g, '$$\\frac{$1}{$2}$$')
    .replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '$$\\frac{$1}{$2}$$')

    // Handle modular arithmetic
    .replace(/\b(\d+)\s+mod\s+(\d+)/g, '$$$1 \\bmod $2$$')
    .replace(/≡\s*(\d+)\s+mod\s+(\d+)/g, '$$\\equiv $1 \\pmod{$2}$$')
    .replace(
      /([^$]+)\s*≡\s*([^$]+)\s+mod\s+(\d+)/g,
      '$$$1 \\equiv $2 \\pmod{$3}$$'
    )

    // Handle square roots
    .replace(/sqrt\(([^)]+)\)/g, '$$\\sqrt{$1}$$')

    // Handle absolute values
    .replace(/\|([^|]+)\|/g, '$$\\left|$1\\right|$$')

    // Handle infinity
    .replace(/\binfinity\b/g, '$$\\infty$$')
    .replace(/\binf\b/g, '$$\\infty$$')

    // Handle common operators
    .replace(/\+\/-/g, '$$\\pm$$')
    .replace(/-\+/g, '$$\\mp$$')
    .replace(/\*\*/g, '$$\\cdot$$')
    .replace(/\.\.\./g, '$$\\ldots$$')

    // Handle degree symbol
    .replace(/(\d+)\s*degrees?/g, '$$$1^\\circ$$')
    .replace(/(\d+)°/g, '$$$1^\\circ$$')

    // Handle common mathematical constants
    .replace(/\be\b(?![a-zA-Z])/g, '$$\\mathrm{e}$$')
    .replace(/\bpi\b/g, '$$\\pi$$')

    // Handle summation and product notation
    .replace(
      /sum\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g,
      '$$\\sum_{$1=$2}^{$3}$$'
    )
    .replace(
      /prod\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g,
      '$$\\prod_{$1=$2}^{$3}$$'
    )

    // Handle limit notation
    .replace(/lim\s*\(([^,]+)\s*->\s*([^)]+)\)/g, '$$\\lim_{$1 \\to $2}$$')

    // Handle integral notation
    .replace(
      /int\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g,
      '$$\\int_{$1}^{$2} $3$$'
    )

    // Handle matrix notation shortcuts
    .replace(/matrix\s*\(\s*([^)]+)\s*\)/g, (_, content) => {
      const rows = content
        .split(';')
        .map((row: string) =>
          row
            .trim()
            .split(',')
            .map((cell: string) => cell.trim())
            .join(' & ')
        )
        .join(' \\\\ ');
      return `$$\\begin{pmatrix} ${rows} \\end{pmatrix}$$`;
    })

    // Clean up multiple consecutive math delimiters
    .replace(/\$\$\s*\$\$/g, '$$')
    .replace(/\$\$([^$]+)\$\$\s*\$\$([^$]+)\$\$/g, '$$$1 $2$$');

  // Restore protected math expressions
  mathExpressions.forEach((expr, index) => {
    if (expr.startsWith('$$')) {
      content = content.replace(`__MATH_BLOCK_${index}__`, expr);
    } else {
      content = content.replace(`__MATH_INLINE_${index}__`, expr);
    }
  });

  return content;
};

// Function to detect if a code string represents an FSM/automaton ASCII diagram
const isAutomataAscii = (code: string): boolean => {
  // Check for the typical pattern of ASCII-based state machine diagrams
  // Common patterns in ASCII automata: state identifiers (q0, q1), transition arrows (--->, <---), and the (final) marker
  const hasStateIdentifiers = /q\d+/i.test(code);
  const hasTransitionArrows = /(--+>|<--+|\|)/.test(code);
  const hasStateMarkers = /[+-]{3,}|[([]final[\])]/.test(code);

  // Additional pattern checks for more complex state diagrams
  const hasStateBoxes = /\+-+\+/.test(code);

  return (
    hasStateIdentifiers &&
    (hasTransitionArrows || hasStateMarkers || hasStateBoxes)
  );
};

// Function to check if a code block should be rendered on the right panel (diagrams + code blocks)
const isDiagramCodeBlock = (language: string, codeString: string): boolean => {
  // Explicit diagram languages
  if (
    [
      'mermaid',
      'typogram',
      'grammar',
      'automata',
      'cct',
      'circuit-bricks',
      'circuit',
    ].includes(language)
  ) {
    return true;
  }

  // ALL code blocks with language specified should go to right panel
  if (language && language.trim() !== '') {
    return true;
  }

  // Detect Mermaid diagrams by keywords even if no language tag is provided
  const trimmed = codeString.trim();
  const mermaidKeywords =
    /^(graph|flowchart|sequenceDiagram|stateDiagram|classDiagram|gantt|pie|erDiagram)/;
  const isMermaid = mermaidKeywords.test(trimmed);

  if (isMermaid) {
    return true;
  }

  // Enhanced ASCII FSM/automata diagram detection - only for unlabeled code blocks
  if (isAutomataAscii(codeString)) {
    return true;
  }

  // ASCII diagram detection for specific patterns
  const hasStateTransitions = /q\d+\s*--+>\s*q\d+/.test(codeString);
  const hasBoxDrawing = /[┌┐└┘├┤┬┴┼─│]/.test(codeString);
  const hasFlowchartElements = /\[.*\]\s*--+>\s*\[.*\]/.test(codeString);

  // Treat as diagram if it has specific diagram patterns
  const isSpecificDiagram =
    hasStateTransitions || hasBoxDrawing || hasFlowchartElements;

  return isSpecificDiagram;
};

// Function to separate content into text and code/diagrams (for right panel)
const separateContentAndDiagrams = (
  content: string
): { textContent: string; diagramContent: string } => {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let textContent = content;
  let diagramContent = '';
  let match;

  // Extract all code blocks and check if they're diagrams
  const codeBlocks: Array<{ match: RegExpExecArray; isDiagram: boolean }> = [];

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || '';
    const codeString = (match[2] ?? '').trim();
    const isDiagram = isDiagramCodeBlock(language, codeString);

    codeBlocks.push({ match, isDiagram });
  }

  // Process from end to start to maintain correct indices
  codeBlocks.reverse().forEach(({ match, isDiagram }) => {
    if (isDiagram) {
      // Add to diagram content
      diagramContent = match[0] + '\n\n' + diagramContent;
      // Remove from text content
      textContent =
        textContent.substring(0, match.index) +
        textContent.substring(match.index + match[0].length);
    }
  });

  return {
    textContent: textContent.trim(),
    diagramContent: diagramContent.trim(),
  };
};

// Function to separate citations from content
const separateContentAndCitations = (
  content: string
): { mainContent: string; citations: string } => {
  // First check for ```citations blocks
  const citationBlockRegex = /```citations\n([\s\S]*?)```/g;
  let mainContent = content;
  let citations = '';
  let match;

  // Process citation code blocks
  while ((match = citationBlockRegex.exec(content)) !== null) {
    citations += (match[1] ?? '').trim() + '\n';
    // Remove citation block from main content
    mainContent = mainContent.replace(match[0], '');
  }

  // Then check for References or References sections
  const referencesRegex =
    /(?:^|\n)(?:##?\s*)?References?\s*\n((?:[-*•]?\s*.*(?:\n|$))*)/gim;
  while ((match = referencesRegex.exec(content)) !== null) {
    // Convert bullets/dashes to citation format
    const referenceLines = (match[1] ?? '')
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        line = line.replace(/^[-*•]\s*/, '').trim(); // Remove bullets
        return line ? ` | ${line} | Reference` : ''; // Convert to citation format
      })
      .filter(Boolean)
      .join('\n');

    if (referenceLines) {
      citations += (citations ? '\n' : '') + referenceLines;
      // Remove the references section from main content
      mainContent = mainContent.replace(match[0], '');
    }
  }

  return {
    mainContent: mainContent.trim(),
    citations: citations.trim(),
  };
};

// Create completely stable components object outside component scope
const STABLE_MARKDOWN_COMPONENTS = {
  code(props: any) {
    const { className, children, ...restProps } = props as {
      className?: string;
      children: React.ReactNode;
      [key: string]: unknown;
    };
    const isInline = !(className && /language-(\w+)/.test(className));
    if (isInline) {
      return (
        <code
          className={`${className || ''} rounded bg-[#50636a2d] px-1 py-0.5 text-[#617D82] text-base md:text-lg`}
          {...restProps}
          data-oid="cqf0ne7"
        >
          {children}
        </code>
      );
    }
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    const language = match ? match[1] : '';

    // Citations rendering
    if (language === 'citations') {
      return <CitationRenderer citations={codeString} />;
    }

    // Typogram rendering for ASCII diagrams
    if (language === 'typogram') {
      return (
        <TypogramRenderer
          data-oid="5ot1p9l"
          debug={false}
          source={codeString}
          zoom={0.3}
        />
      );
    }
    // Grammar rendering for automata languages
    if (language === 'grammar') {
      return <GrammarRenderer data-oid="x0f:jrz" grammar={codeString} />;
    }
    // Automata rendering for finite state machines
    if (language === 'automata') {
      return <AutomataRenderer automata={codeString} data-oid="xxbh19:" />;
    }
    // Detect Mermaid diagrams by keywords even if no language tag is provided
    const trimmed = codeString.trim();
    const mermaidKeywords =
      /^(graph|flowchart|sequenceDiagram|stateDiagram|classDiagram|gantt|pie|erDiagram)/;
    const isMermaid =
      language === 'mermaid' || (!language && mermaidKeywords.test(trimmed));
    if (isMermaid) {
      return <MermaidRenderer chart={codeString} data-oid="tji:5pw" />;
    }

    // Circuit-Bricks circuit diagram rendering
    if (language === 'circuit-bricks' || language === 'circuit') {
      // Verify the circuit data is valid JSON before attempting to render
      let isValidJSON = true;
      try {
        JSON.parse(codeString);
      } catch {
        isValidJSON = false;
      }

      return (
        <div className="relative my-6" data-oid="circuit-bricks-container">
          {isValidJSON ? (
            <div>
              <CircuitBricksRenderer circuitData={codeString} />
            </div>
          ) : (
            <div className="rounded-b-md border border-red-300 bg-red-50 p-4 text-red-600 text-sm dark:border-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400">
              <strong>Invalid Circuit JSON:</strong> Could not parse the circuit
              data.
              <div className="mt-2">
                Please ensure your circuit definition is valid JSON and includes
                proper component and wire definitions.
              </div>
              <pre className="mt-3 overflow-auto rounded bg-gray-900 p-3 text-gray-300 text-xs">
                {codeString}
              </pre>
            </div>
          )}
        </div>
      );
    }

    // Enhanced ASCII FSM/automata diagram detection
    if (!language && isAutomataAscii(codeString)) {
      return (
        <div className="relative my-6" data-oid="hp1.teh">
          <div
            className="flex items-center justify-between rounded-t-md border-gray-700 border-b bg-gray-800 px-3 py-1.5 text-gray-300 text-xs"
            data-oid="4l4h924"
          >
            <span data-oid="a8m7p1o">
              Finite State Machine / Automaton Diagram (ASCII)
            </span>
            <button
              aria-label="Copy diagram"
              className="rounded p-1 transition-colors hover:bg-gray-700"
              data-oid="brz05dt"
              onClick={() => {
                navigator.clipboard.writeText(codeString);
              }}
            >
              <Copy className="h-3.5 w-3.5 text-gray-400" data-oid="5sazyxv" />
            </button>
          </div>
          <pre
            className="overflow-x-auto whitespace-pre rounded-b-md border border-gray-700 bg-gray-900 p-4 font-mono text-gray-200 text-sm leading-snug"
            data-oid="1by4g82"
          >
            <code data-oid="vqoj6aa">{codeString}</code>
          </pre>
        </div>
      );
    }

    // Very restrictive ASCII diagram detection - only for very specific patterns
    // Only consider it a diagram if it has very specific diagram characteristics
    const hasStateTransitions = /q\d+\s*--+>\s*q\d+/.test(codeString);
    const hasBoxDrawing = /[┌┐└┘├┤┬┴┼─│]/.test(codeString);
    const hasFlowchartElements = /\[.*\]\s*--+>\s*\[.*\]/.test(codeString);

    // Only treat as ASCII diagram if it has very specific diagram patterns AND no language is specified
    const isSpecificAsciiDiagram =
      !language &&
      (hasStateTransitions || hasBoxDrawing || hasFlowchartElements);

    // Render ASCII diagrams with preserved whitespace and monospace font
    if (isSpecificAsciiDiagram) {
      return (
        <div className="group relative my-6" data-oid="6b4n4bt">
          <div
            className="flex items-center justify-between rounded-t-md border-gray-700 border-b bg-gray-800 px-3 py-1.5 text-gray-300 text-xs"
            data-oid="35l5yv6"
          >
            <span data-oid="1ejpw7n">ASCII Diagram</span>
            <button
              aria-label="Copy diagram"
              className="rounded p-1 transition-colors hover:bg-gray-700"
              data-oid="o3uy1i1"
              onClick={() => {
                navigator.clipboard.writeText(codeString);
              }}
            >
              <Copy className="h-3.5 w-3.5 text-gray-400" data-oid=":w1wdeg" />
            </button>
          </div>
          <pre
            className="overflow-x-auto whitespace-pre rounded-b-md border border-gray-700 bg-gray-900 p-4 font-mono text-gray-200 text-sm leading-snug"
            data-oid="d.yfjpc"
          >
            <code data-oid="qn-uqv4">{codeString}</code>
          </pre>
        </div>
      );
    }

    if (match) {
      return (
        <div className="group relative my-6" data-oid="ysa:q4e">
          <div
            className="flex items-center justify-between rounded-t-md border-2 border-[#42595D] bg-[#42595D] px-3 py-1.5 text-gray-300 text-xs"
            data-oid="xgm02at"
          >
            <span data-oid="s0xzq2k">
              {language
                ? language.charAt(0).toUpperCase() +
                  language.slice(1) +
                  (language.toLowerCase() === 'typescript'
                    ? ' (TS)'
                    : language.toLowerCase() === 'javascript'
                      ? ' (JS)'
                      : '')
                : 'Code'}
            </span>
            <button
              aria-label="Copy code"
              className="rounded p-1 transition-colors hover:bg-gray-700"
              data-oid="qjn7tun"
              onClick={() => {
                navigator.clipboard.writeText(codeString);
              }}
            >
              <Copy className="h-3.5 w-3.5 text-gray-400" data-oid="3qe5x-0" />
            </button>
          </div>
          <SyntaxHighlighter
            className="!mt-0 !bg-[#252D31] rounded-t-none rounded-b-md"
            customStyle={{
              marginTop: 0,
              border: '2px solid rgb(66, 89, 93)',
              borderTop: 'none',
            }}
            data-oid="9.6yjrk"
            language={language || 'text'}
            style={vscDarkPlus}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }
    return (
      <code className={className} {...restProps} data-oid="gj5ilnz">
        {children}
      </code>
    );
  },
  pre({ children }: any) {
    return <>{children}</>;
  },
  table({ children }: any) {
    return (
      <div className="my-4 overflow-x-auto" data-oid="f1d:qqk">
        <table className="w-full border-collapse" data-oid="2tl4x:d">
          {children}
        </table>
      </div>
    );
  },
  th({ children }: any) {
    return (
      <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left dark:border-[#919191] dark:bg-[#202020] ">
        {children}
      </th>
    );
  },
  td({ children }: any) {
    return (
      <td className="border border-gray-300 px-4 py-2 dark:border-[#919191]">
        {children}
      </td>
    );
  },
  blockquote({ children }: any) {
    return (
      <blockquote className="my-4 border-l-4 bg-yellow-500 pl-4">
        {children}
      </blockquote>
    );
  },
  h1({ children }: any) {
    return (
      <h1
        className="mt-6 mb-4 border-gray-200 border-b pb-2 font-bold text-3xl dark:border-gray-800"
        data-oid="5mw00sa"
      >
        {children}
      </h1>
    );
  },
  h2({ children }: any) {
    return (
      <h2
        className="my-3 border-[#23545D] border-t py-3 font-bold text-2xl text-[#99C5CB]"
        data-oid="19rjxuk"
      >
        {children}
      </h2>
    );
  },
  h3({ children }: any) {
    return (
      <h3
        className="mt-4 mb-2 font-semibold text-[#99C5CB] text-xl"
        data-oid="k2n:wqm"
      >
        {children}
      </h3>
    );
  },
  ul({ children }: any) {
    return (
      <ul className="my-4" data-oid="swyr7.k">
        {children}
      </ul>
    );
  },
  ol({ children }: any) {
    return (
      <ol className="my-4" data-oid="6yjdj89">
        {children}
      </ol>
    );
  },
  li({ children }: any) {
    return (
      <li className="my-1" data-oid="l8rvb-5">
        {children}
      </li>
    );
  },
  p({ children }: any) {
    return (
      <p className="my-4 " data-oid="v06:sbi">
        {children}
      </p>
    );
  },
  strong({ children }: any) {
    return (
      <strong
        className="font-bold"
        data-oid="bold-text"
        style={{ fontWeight: 'bold' }}
      >
        {children}
      </strong>
    );
  },
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onlyText = false,
  onlyDiagrams = false,
  excludeCitations = false,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // First, separate citations from content
  const { mainContent, citations } = separateContentAndCitations(content);

  // Separate content if needed
  let processedContent = mainContent;

  if (onlyText || onlyDiagrams) {
    const { textContent, diagramContent } =
      separateContentAndDiagrams(mainContent);
    processedContent = onlyText ? textContent : diagramContent;
  }

  // Apply mathematical notation preprocessing first
  processedContent = preprocessMathNotation(processedContent);

  // First, handle horizontal rules separately
  processedContent = processedContent.replace(
    /^ {0,3}([-*_]){3,}\s*$/gm,
    '\n\n<hr />\n\n'
  );
  // Use the new parser for improved sanitization (code blocks are preserved)
  processedContent = parseAndFormatContent(processedContent);

  // Additional replacements for spacing in lists and headings
  processedContent = processedContent
    .replace(/\n(#{1,6}\s)/g, '\n\n$1')
    .replace(/\n([*-]\s)/g, '\n$1')
    .replace(/\n(\d+\.\s)/g, '\n$1')
    .replace(/(\n\s*\n)/g, '$1\n');

  // Enhanced mathematical expression processing
  processedContent = processedContent
    // First, handle display math blocks
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => `\n\n$$${math.trim()}$$\n\n`)
    // Handle LaTeX-style delimiters
    .replace(/\\\(/g, '$$')
    .replace(/\\\)/g, '$$')
    // Handle inline math with better spacing and cleanup
    .replace(
      /\$\$([^$]+?)\$\$/g,
      (_, math) => `$${math.trim().replace(/\s+/g, ' ')}$`
    )
    .replace(
      /\$([^$\n]+?)\$/g,
      (_, math) => `$${math.trim().replace(/\s+/g, ' ')}$`
    )

    // Enhanced superscript and subscript handling
    .replace(/([a-zA-Z0-9])\^([a-zA-Z0-9]+)/g, '$1^{$2}') // a^n -> a^{n}
    .replace(/([a-zA-Z0-9])\^(\([^)]+\))/g, '$1^{$2}') // a^(n+1) -> a^{(n+1)}
    .replace(/([a-zA-Z0-9])_([a-zA-Z0-9]+)/g, '$1_{$2}') // x_i -> x_{i}
    .replace(/([a-zA-Z0-9])_(\([^)]+\))/g, '$1_{$2}') // x_(i+1) -> x_{(i+1)}

    // Complex superscript/subscript combinations
    .replace(/([a-zA-Z0-9])\^([a-zA-Z0-9]+)_([a-zA-Z0-9]+)/g, '$1^{$2}_{$3}')
    .replace(/([a-zA-Z0-9])_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '$1_{$2}^{$3}')

    // Mathematical operators and functions
    .replace(/\\vec\{([^}]*)\}/g, '\\vec{$1}')
    .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '\\sum_{$1}^{$2}')
    .replace(/\\prod_\{([^}]*)\}\^\{([^}]*)\}/g, '\\prod_{$1}^{$2}')
    .replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, '\\int_{$1}^{$2}')
    .replace(/\\lim_\{([^}]*)\}/g, '\\lim_{$1}')

    // Fractions and derivatives
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '\\frac{$1}{$2}')
    .replace(/\\frac\{d\}\{d([a-zA-Z])\}/g, '\\frac{d}{d$1}')
    .replace(/\\frac\{d([^}]*)\}\{d([a-zA-Z])\}/g, '\\frac{d$1}{d$2}')
    .replace(
      /\\frac\{\\partial\}\{\\partial ([a-zA-Z])\}/g,
      '\\frac{\\partial}{\\partial $1}'
    )
    .replace(
      /\\frac\{\\partial([^}]*)\}\{\\partial ([a-zA-Z])\}/g,
      '\\frac{\\partial$1}{\\partial $2}'
    )

    // Roots and powers
    .replace(/\\sqrt\{([^}]*)\}/g, '\\sqrt{$1}')
    .replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '\\sqrt[$1]{$2}')

    // Matrix environments
    .replace(
      /\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}/g,
      '\\begin{matrix}$1\\end{matrix}'
    )
    .replace(
      /\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g,
      '\\begin{pmatrix}$1\\end{pmatrix}'
    )
    .replace(
      /\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g,
      '\\begin{bmatrix}$1\\end{bmatrix}'
    )
    .replace(
      /\\begin\{vmatrix\}([\s\S]*?)\\end\{vmatrix\}/g,
      '\\begin{vmatrix}$1\\end{vmatrix}'
    )

    // Trigonometric and logarithmic functions
    .replace(
      /\\(sin|cos|tan|sec|csc|cot|sinh|cosh|tanh|arcsin|arccos|arctan)\{([^}]*)\}/g,
      '\\$1($2)'
    )
    .replace(/\\(log|ln|exp)\{([^}]*)\}/g, '\\$1($2)')

    // Set notation and logic
    .replace(/\\in\b/g, '\\in')
    .replace(/\\subset\b/g, '\\subset')
    .replace(/\\supset\b/g, '\\supset')
    .replace(/\\cup\b/g, '\\cup')
    .replace(/\\cap\b/g, '\\cap')
    .replace(/\\emptyset\b/g, '\\emptyset')
    .replace(/\\forall\b/g, '\\forall')
    .replace(/\\exists\b/g, '\\exists')
    .replace(/\\implies\b/g, '\\implies')
    .replace(/\\iff\b/g, '\\iff')

    // Inequalities and relations
    .replace(/\\leq\b/g, '\\leq')
    .replace(/\\geq\b/g, '\\geq')
    .replace(/\\neq\b/g, '\\neq')
    .replace(/\\approx\b/g, '\\approx')
    .replace(/\\equiv\b/g, '\\equiv')

    // Special formatting
    .replace(/\\boxed\{([\s\S]*?)\}/g, '\\boxed{$1}')
    .replace(/\\text\{([^}]*)\}/g, '\\text{$1}')
    .replace(/\\mathbf\{([^}]*)\}/g, '\\mathbf{$1}')
    .replace(/\\mathit\{([^}]*)\}/g, '\\mathit{$1}')
    .replace(/\\mathcal\{([^}]*)\}/g, '\\mathcal{$1}')

    // Function notation improvements
    .replace(/([a-zA-Z])\s*\(\s*([a-zA-Z0-9+\-*/^_]+)\s*\)/g, '$1($2)')

    // Greek letters (keeping existing ones and adding more)
    .replace(/\\alpha\b/g, '\\alpha')
    .replace(/\\beta\b/g, '\\beta')
    .replace(/\\gamma\b/g, '\\gamma')
    .replace(/\\delta\b/g, '\\delta')
    .replace(/\\epsilon\b/g, '\\epsilon')
    .replace(/\\varepsilon\b/g, '\\varepsilon')
    .replace(/\\zeta\b/g, '\\zeta')
    .replace(/\\eta\b/g, '\\eta')
    .replace(/\\theta\b/g, '\\theta')
    .replace(/\\vartheta\b/g, '\\vartheta')
    .replace(/\\iota\b/g, '\\iota')
    .replace(/\\kappa\b/g, '\\kappa')
    .replace(/\\lambda\b/g, '\\lambda')
    .replace(/\\mu\b/g, '\\mu')
    .replace(/\\nu\b/g, '\\nu')
    .replace(/\\xi\b/g, '\\xi')
    .replace(/\\pi\b/g, '\\pi')
    .replace(/\\varpi\b/g, '\\varpi')
    .replace(/\\rho\b/g, '\\rho')
    .replace(/\\varrho\b/g, '\\varrho')
    .replace(/\\sigma\b/g, '\\sigma')
    .replace(/\\varsigma\b/g, '\\varsigma')
    .replace(/\\tau\b/g, '\\tau')
    .replace(/\\upsilon\b/g, '\\upsilon')
    .replace(/\\phi\b/g, '\\phi')
    .replace(/\\varphi\b/g, '\\varphi')
    .replace(/\\chi\b/g, '\\chi')
    .replace(/\\psi\b/g, '\\psi')
    .replace(/\\omega\b/g, '\\omega')

    // Capital Greek letters
    .replace(/\\Gamma\b/g, '\\Gamma')
    .replace(/\\Delta\b/g, '\\Delta')
    .replace(/\\Theta\b/g, '\\Theta')
    .replace(/\\Lambda\b/g, '\\Lambda')
    .replace(/\\Xi\b/g, '\\Xi')
    .replace(/\\Pi\b/g, '\\Pi')
    .replace(/\\Sigma\b/g, '\\Sigma')
    .replace(/\\Upsilon\b/g, '\\Upsilon')
    .replace(/\\Phi\b/g, '\\Phi')
    .replace(/\\Psi\b/g, '\\Psi')
    .replace(/\\Omega\b/g, '\\Omega');

  return (
    <>
      <style>{`
        .katex {
          font-size: 1.1em !important;
          line-height: 1.6 !important;
          margin: 1rem 0 !important;
          padding: 0.5rem 0 !important;
        }
        .katex-display {
          font-size: 1.3em !important;
          line-height: 1.8 !important;
          margin: 2rem 0 !important;
          padding: 1.5rem 1rem !important;
          text-align: center !important;
          background: rgba(0, 0, 0, 0.02) !important;
          border-radius: 8px !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
        .dark .katex-display {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .katex:not(.katex-display) {
          font-size: 1.05em !important;
          margin: 0 0.2rem !important;
          padding: 0.1rem 0.2rem !important;
          background: rgba(0, 0, 0, 0.03) !important;
          border-radius: 4px !important;
        }
        .dark .katex:not(.katex-display) {
          background: rgba(255, 255, 255, 0.03) !important;
        }
        .katex .mbin,
        .katex .mrel {
          margin: 0 0.3em !important;
        }
        .katex .mrel.amsrm {
          margin: 0 0.4em !important;
        }
        .katex .mbin.amsrm {
          margin: 0 0.25em !important;
        }
        /* Proper list styling with custom bullets and numbering */
        .markdown-content ul {
          list-style-type: none !important;
          padding-left: 1.5rem !important;
        }
        .markdown-content ol {
          list-style-type: none !important;
          padding-left: 1.5rem !important;
          counter-reset: list-counter;
        }
        .markdown-content li {
          position: relative !important;
          margin: 0.5rem 0 !important;
        }
        .markdown-content ul > li::before {
          content: '•' !important;
          color: #99C5CB !important;
          font-weight: bold !important;
          position: absolute !important;
          left: -1.2rem !important;
          top: 0 !important;
          display: block !important;
        }
        .markdown-content ol > li {
          counter-increment: list-counter;
        }
        .markdown-content ol > li::before {
          content: counter(list-counter) ". " !important;
          color: #99C5CB !important; /* Or any color you prefer for numbers */
          font-weight: bold !important;
          position: absolute !important;
          left: -1.5rem !important; /* Adjust as needed for alignment */
          top: 0 !important;
          display: block !important;
          width: 1.5rem; /* Ensure space for the number */
          text-align: right; /* Align numbers to the right before the dot */
        }

        /* Ensure ::after pseudo-elements on list items are not displaying anything */
        .markdown-content ul > li::after,
        .markdown-content ol > li::after {
          content: "" !important;
          display: none !important;
        }


      `}</style>
      <div
        className="markdown-content max-w-none [&_.katex-display]:my-6 [&_.katex-display]:px-2 [&_.katex-display]:py-4 [&_.katex-display]:text-xl [&_.katex-mathml]:hidden [&_.katex]:my-4 [&_.katex]:text-lg [&_.katex]:leading-relaxed"
        data-oid="e3n597w"
      >
        <ReactMarkdown
          components={STABLE_MARKDOWN_COMPONENTS}
          data-oid=".54vk3j"
          rehypePlugins={REHYPE_PLUGINS as any}
          remarkPlugins={REMARK_PLUGINS as any}
        >
          {processedContent}
        </ReactMarkdown>

        {/* Render citations at the bottom if they exist and we're not filtering content */}
        {!(onlyText || onlyDiagrams || excludeCitations) && citations && (
          <CitationRenderer citations={citations} />
        )}
      </div>
    </>
  );
};

// Export the separation functions for use in other components
export { separateContentAndDiagrams, separateContentAndCitations };

// Export without SSR so DOMPurify and raw HTML parsing work only on client
const MarkdownRendererNoSSR = dynamic(() => Promise.resolve(MarkdownRenderer), {
  ssr: false,
});
export default MarkdownRendererNoSSR;
