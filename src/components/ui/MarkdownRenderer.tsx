import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import GrammarRenderer from "./GrammarRenderer";
import "katex/dist/katex.min.css";
import { Copy, Check } from "lucide-react";
import MermaidRenderer from "./MermaidRenderer";
import TypogramRenderer from "./TypogramRenderer";
import AutomataRenderer from "./AutomataRenderer";

// Dynamic import for CircuitBricksRenderer to avoid SSR issues
const CircuitBricksRenderer = dynamic(
  () => import("./CircuitBricksRenderer"),
  { ssr: false }
);



// Fix interface to include className, width and height props
interface MarkdownRendererProps {
  content: string;
  className?: string;
  width?: number | string;
  height?: number | string;
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
      FORBID_TAGS: ["style"],
      ADD_TAGS: ["script"],
      ADD_ATTR: ["type"],
    });
    segments.push(sanitizedNonCode);

    // Keep the code block intact, but trim the inner code
    const lang = match[1];
    const code = (match[2] ?? "").trim();
    segments.push(
      `\n\n<pre><code class="language-${lang}">${code}</code></pre>\n\n`,
    );
    lastIndex = match.index + match[0].length;
  }
  // Sanitize any remaining part after the last code block
  const remaining = content.substr(lastIndex);
  const sanitizedRemaining = DOMPurify.sanitize(remaining, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style"],
    ADD_TAGS: ["script"],
    ADD_ATTR: ["type"],
  });
  segments.push(sanitizedRemaining);

  // Return the combined content
  return segments.join("");
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

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // First, handle horizontal rules separately
  let processedContent = content.replace(
    /^ {0,3}([-*_]){3,}\s*$/gm,
    "\n\n<hr />\n\n",
  );
  // Use the new parser for improved sanitization (code blocks are preserved)
  processedContent = parseAndFormatContent(processedContent);

  // Additional replacements for spacing in lists and headings
  processedContent = processedContent
    .replace(/\n(#{1,6}\s)/g, "\n\n$1")
    .replace(/\n([*-]\s)/g, "\n$1")
    .replace(/\n(\d+\.\s)/g, "\n$1")
    .replace(/(\n\s*\n)/g, "$1\n");

  // Better handling for math expressions
  processedContent = processedContent
    .replace(
      /\$\$([\s\S]*?)\$\$/g,
      (match, math) => `\n\n$$${math.trim()}$$\n\n`,
    )
    .replace(/\\\(/g, "$$")
    .replace(/\\\)/g, "$$")
    .replace(
      /\$([^$\n]+?)\$/g,
      (match, math) => `$${math.trim().replace(/\s+/g, " ")}$`,
    )
    .replace(/\\vec\{([^}]*)\}/g, "\\vec{$1}")
    .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, "\\sum_{$1}^{$2}")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "\\frac{$1}{$2}")
    .replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, "\\int_{$1}^{$2}")
    .replace(/\\frac\{d\}\{d([a-zA-Z])\}/g, "\\frac{d}{d$1}")
    .replace(
      /\\frac\{\\partial\}\{\\partial ([a-zA-Z])\}/g,
      "\\frac{\\partial}{\\partial $1}",
    )
    .replace(/\\boxed\{([\s\S]*?)\}/g, "$1")
    .replace(
      /\\(sin|cos|tan|log|ln|exp|sec|csc|cot|arcsin|arccos|arctan)\{([^}]*)\}/g,
      "\\$1($2)",
    )
    .replace(/([a-zA-Z])\s*\(\s*([a-zA-Z0-9+\-*/^_]+)\s*\)/g, "$1($2)")
    .replace(
      /\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}/g,
      "\\begin{matrix}$1\\end{matrix}",
    )
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ")
    .replace(/\\omega/g, "ω");

  return (
    <div
      className="prose max-w-none dark:prose-invert prose-lg"
      data-oid="e3n597w"
    >
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkBreaks,
          remarkEmoji,
          [
            remarkMath,
            { singleDollarTextMath: true, doubleBacktickMathDisplay: false },
          ],
        ]}
        rehypePlugins={[
          rehypeHighlight,
          [
            rehypeKatex,
            {
              strict: false,
              trust: true,
              macros: { "\\vec": "\\overrightarrow{#1}" },
            },
          ],

          rehypeRaw,
          rehypeSlug,
          [
            rehypeExternalLinks,
            { target: "_blank", rel: ["nofollow", "noopener", "noreferrer"] },
          ],
        ]}
        components={{
          code(props) {
            const { className, children, ...restProps } = props as {
              className?: string;
              children: React.ReactNode;
              [key: string]: unknown;
            };
            const isInline = !className || !/language-(\w+)/.test(className);
            if (isInline) {
              return (
                <code
                  className={`${className} text-base md:text-lg`}
                  {...restProps}
                  data-oid="cqf0ne7"
                >
                  {children}
                </code>
              );
            }
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const language = match ? match[1] : "";
            // Typogram rendering for ASCII diagrams
            if (language === "typogram") {
              return (
                <TypogramRenderer
                  source={codeString}
                  zoom={0.3}
                  debug={false}
                  data-oid="5ot1p9l"
                />
              );
            }
            // Grammar rendering for automata languages
            if (language === "grammar") {
              return (
                <GrammarRenderer grammar={codeString} data-oid="x0f:jrz" />
              );
            }
            // Automata rendering for finite state machines
            if (language === "automata") {
              return (
                <AutomataRenderer automata={codeString} data-oid="xxbh19:" />
              );
            }
            // Detect Mermaid diagrams by keywords even if no language tag is provided
            const trimmed = codeString.trim();
            const mermaidKeywords =
              /^(graph|flowchart|sequenceDiagram|stateDiagram|classDiagram|gantt|pie|erDiagram)/;
            const isMermaid =
              language === "mermaid" ||
              (!language && mermaidKeywords.test(trimmed));
            if (isMermaid) {
              return <MermaidRenderer chart={codeString} data-oid="tji:5pw" />;
            }

            // Falstad circuit diagram rendering
            if (language === "cct") {
              const circuitData = encodeURIComponent(codeString);
              const falstadUrl = `https://www.falstad.com/circuit/circuitjs.html?cct=${circuitData}`;
              return (
                <div className="relative my-6" data-oid="falstad-container">
                  <div
                    className="px-3 py-1.5 bg-gray-800 text-xs text-gray-300 rounded-t-md border-b border-gray-700 flex justify-between items-center"
                    data-oid="falstad-header"
                  >
                    <span data-oid="falstad-title">Electrical Circuit Diagram (Falstad)</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        setCopiedCode(codeString);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      aria-label="Copy CCT string"
                      data-oid="falstad-copy-button"
                    >
                      {copiedCode === codeString ? (
                        <Check
                          className="h-3.5 w-3.5 text-green-500"
                          data-oid="falstad-check-icon"
                        />
                      ) : (
                        <Copy
                          className="h-3.5 w-3.5 text-gray-400"
                          data-oid="falstad-copy-icon"
                        />
                      )}
                    </button>
                  </div>
                  <iframe
                    src={falstadUrl}
                    title="Falstad Circuit Simulator"
                    className="w-full h-96 border border-gray-700 rounded-b-md"
                    data-oid="falstad-iframe"
                  ></iframe>
                </div>
              );
            }

            // Circuit-Bricks circuit diagram rendering
            if (language === "circuit-bricks" || language === "circuit") {
              // Verify the circuit data is valid JSON before attempting to render
              let isValidJSON = true;
              try {
                JSON.parse(codeString);
              } catch (e) {
                isValidJSON = false;
              }

              return (
                <div className="relative my-6" data-oid="circuit-bricks-container">


                  {isValidJSON ? (
                    <div>
                      <CircuitBricksRenderer circuitData={codeString} />
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-b-md bg-red-50 dark:bg-red-900 dark:bg-opacity-20">
                      <strong>Invalid Circuit JSON:</strong> Could not parse the circuit data.
                      <div className="mt-2">
                        Please ensure your circuit definition is valid JSON and includes proper component and wire definitions.
                      </div>
                      <pre className="mt-3 p-3 bg-gray-900 rounded text-gray-300 text-xs overflow-auto">
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
                    className="px-3 py-1.5 bg-gray-800 text-xs text-gray-300 rounded-t-md border-b border-gray-700 flex justify-between items-center"
                    data-oid="4l4h924"
                  >
                    <span data-oid="a8m7p1o">
                      Finite State Machine / Automaton Diagram (ASCII)
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        setCopiedCode(codeString);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      aria-label="Copy diagram"
                      data-oid="brz05dt"
                    >
                      {copiedCode === codeString ? (
                        <Check
                          className="h-3.5 w-3.5 text-green-500"
                          data-oid="hfwy-el"
                        />
                      ) : (
                        <Copy
                          className="h-3.5 w-3.5 text-gray-400"
                          data-oid="5sazyxv"
                        />
                      )}
                    </button>
                  </div>
                  <pre
                    className="p-4 bg-gray-900 font-mono text-sm overflow-x-auto rounded-b-md whitespace-pre leading-snug text-gray-200 border border-gray-700"
                    data-oid="1by4g82"
                  >
                    <code data-oid="vqoj6aa">{codeString}</code>
                  </pre>
                </div>
              );
            }

            // Enhanced ASCII diagram detection
            const isNetworkDiagram =
              !language &&
              codeString.includes("(") &&
              (codeString.includes("|") ||
                codeString.includes("/") ||
                codeString.includes("\\"));

            // General ASCII art pattern detection (improved)
            const asciiArtPattern =
              /[/\\|\-_]{2,}|[A-Z]\([0-9]\)|[A-Z]\([0-9]+\)/;
            const multilineWithSpecialChars =
              codeString.split("\n").length > 1 &&
              (asciiArtPattern.test(codeString) ||
                /[|/\\]{2,}/.test(codeString) ||
                (/\([0-9]+\)/.test(codeString) &&
                  /[A-Z][/|\\]/.test(codeString)));

            const isAsciiArt =
              !language && (multilineWithSpecialChars || isNetworkDiagram);

            // Render ASCII diagrams with preserved whitespace and monospace font
            if (isAsciiArt) {
              return (
                <div className="relative group my-6" data-oid="6b4n4bt">
                  <div
                    className="px-3 py-1.5 bg-gray-800 text-xs text-gray-300 rounded-t-md border-b border-gray-700 flex justify-between items-center"
                    data-oid="35l5yv6"
                  >
                    <span data-oid="1ejpw7n">ASCII Diagram</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        setCopiedCode(codeString);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      aria-label="Copy diagram"
                      data-oid="o3uy1i1"
                    >
                      {copiedCode === codeString ? (
                        <Check
                          className="h-3.5 w-3.5 text-green-500"
                          data-oid="o-uihc-"
                        />
                      ) : (
                        <Copy
                          className="h-3.5 w-3.5 text-gray-400"
                          data-oid=":w1wdeg"
                        />
                      )}
                    </button>
                  </div>
                  <pre
                    className="p-4 bg-gray-900 font-mono text-sm overflow-x-auto rounded-b-md whitespace-pre leading-snug text-gray-200 border border-gray-700"
                    data-oid="d.yfjpc"
                  >
                    <code data-oid="qn-uqv4">{codeString}</code>
                  </pre>
                </div>
              );
            }

            if (match) {
              return (
                <div className="relative group my-6" data-oid="ysa:q4e">
                  <div
                    className="px-3 py-1.5 bg-gray-800 text-xs text-gray-300 rounded-t-md border-b border-gray-700 flex justify-between items-center"
                    data-oid="xgm02at"
                  >
                    <span data-oid="s0xzq2k">
                      {language
                        ? language.charAt(0).toUpperCase() +
                          language.slice(1) +
                          (language.toLowerCase() === "typescript"
                            ? " (TS)"
                            : language.toLowerCase() === "javascript"
                            ? " (JS)"
                            : "")
                        : "Code"}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        setCopiedCode(codeString);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      aria-label="Copy code"
                      data-oid="qjn7tun"
                    >
                      {copiedCode === codeString ? (
                        <Check
                          className="h-3.5 w-3.5 text-green-500"
                          data-oid="bjl8pir"
                        />
                      ) : (
                        <Copy
                          className="h-3.5 w-3.5 text-gray-400"
                          data-oid="3qe5x-0"
                        />
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={language || "text"}
                    style={vscDarkPlus}
                    className="rounded-t-none !mt-0 !bg-gray-900 rounded-b-md"
                    customStyle={{
                      marginTop: 0,
                      border: "1px solid rgb(55, 65, 81)",
                      borderTop: "none",
                    }}
                    data-oid="9.6yjrk"
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
          pre({ children }) {
            return <>{children}</>;
          },
          img({ src, alt, ...props }) {
            // Only handle string URLs (skip Blobs or undefined)
            if (typeof src !== "string" || !src) {
              // For non-string sources or undefined, fall back to standard img tag
              return (
                <img
                  src={src as string}
                  alt={alt || ""}
                  className="max-w-full h-auto rounded-md"
                  {...props}
                  data-oid="87b00d8"
                />
              );
            }

            // For string sources, use Next.js Image component
            // Destructure and omit potential width and height props to satisfy Next.js Image requirements
            const {
              width: _width,
              height: _height,
              ...restProps
            } = props as React.DetailedHTMLProps<
              React.ImgHTMLAttributes<HTMLImageElement>,
              HTMLImageElement
            >;

            // Use div wrapper with standard img tag instead of Next Image to avoid type issues
            return (
              <div
                className="relative flex justify-center my-4"
                data-oid="nfvv77z"
              >
                <img
                  src={src}
                  alt={alt || ""}
                  className="max-w-full h-auto rounded-md"
                  {...restProps}
                  data-oid="fk34z3k"
                />
              </div>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4" data-oid="f1d:qqk">
                <table className="border-collapse w-full" data-oid="2tl4x:d">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th
                className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left bg-gray-100 dark:bg-gray-800"
                data-oid="h81ue5i"
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td
                className="border border-gray-300 dark:border-gray-700 px-4 py-2"
                data-oid="n.o38h0"
              >
                {children}
              </td>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote
                className="border-l-4 border-blue-500 pl-4 italic my-4"
                data-oid="z4jrfzc"
              >
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return (
              <h1
                className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800"
                data-oid="5mw00sa"
              >
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2
                className="text-2xl font-bold mt-5 mb-3 pb-1"
                data-oid="19rjxuk"
              >
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-xl font-bold mt-4 mb-2" data-oid="k2n:wqm">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-outside pl-6 my-4" data-oid="swyr7.k">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol
                className="list-decimal list-outside pl-6 my-4"
                data-oid="6yjdj89"
              >
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li className="my-1" data-oid="l8rvb-5">
                {children}
              </li>
            );
          },
          p({ children }) {
            return (
              <p className="my-4 leading-relaxed" data-oid="v06:sbi">
                {children}
              </p>
            );
          },
        }}
        data-oid=".54vk3j"
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

// Export without SSR so DOMPurify and raw HTML parsing work only on client
const MarkdownRendererNoSSR = dynamic(() => Promise.resolve(MarkdownRenderer), {
  ssr: false,
});
export default MarkdownRendererNoSSR;
