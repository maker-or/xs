import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
// Remove unused import
import rehypeExternalLinks from "rehype-external-links";
import DOMPurify from "dompurify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import GrammarRenderer from "./GrammarRenderer";
import "katex/dist/katex.min.css";
import { Copy, Check } from "lucide-react";
import MermaidRenderer from "./MermaidRenderer";
import TypogramRenderer from "./TypogramRenderer";
import AutomataRenderer from "./AutomataRenderer";
// Import Next.js Image component

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
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 rounded-t-md border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
                    data-oid="_k3d_3a"
                  >
                    <span data-oid="jd-i1wy">ASCII Diagram</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        setCopiedCode(codeString);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      aria-label="Copy diagram"
                      data-oid="sin_7cb"
                    >
                      {copiedCode === codeString ? (
                        <Check
                          className="h-3.5 w-3.5 text-green-500"
                          data-oid="6sjm:ml"
                        />
                      ) : (
                        <Copy
                          className="h-3.5 w-3.5 text-gray-400"
                          data-oid="j9jj6am"
                        />
                      )}
                    </button>
                  </div>
                  <pre
                    className="p-4 bg-gray-100 dark:bg-gray-800 font-mono text-sm overflow-x-auto rounded-b-md whitespace-pre leading-snug"
                    data-oid="adm38kv"
                  >
                    <code data-oid="guy9a1-">{codeString}</code>
                  </pre>
                </div>
              );
            }

            if (match) {
              return (
                <div
                  className="relative group my-4 overflow-hidden rounded-lg bg-[#1E1E1E] dark:bg-[#1E1E1E] shadow-lg"
                  data-oid="55b3pr-"
                >
                  {/* Language display */}
                  <div
                    className="flex items-center justify-between px-4 py-1.5 bg-[#2D2D2D] dark:bg-[#2D2D2D] text-gray-300 border-b border-[#3E3E3E]"
                    data-oid="fo.ghxm"
                  >
                    <span
                      className="text-xs font-mono font-medium"
                      data-oid="ln9uu5k"
                    >
                      {language}
                    </span>
                    {/* Copy button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        setCopiedCode(codeString);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      aria-label="Copy code"
                      data-oid="b-viu6e"
                    >
                      {copiedCode === codeString ? (
                        <Check
                          className="h-4 w-4 text-green-500"
                          data-oid="ph75ewx"
                        />
                      ) : (
                        <Copy
                          className="h-4 w-4 text-gray-400"
                          data-oid="s_7ntd6"
                        />
                      )}
                    </button>
                  </div>

                  {/* Enhanced code syntax highlighting */}
                  <div
                    className="syntax-highlighting-wrapper font-mono text-[15px] p-4"
                    data-oid=".l49u5k"
                  >
                    <SyntaxHighlighter
                      style={{
                        ...vscDarkPlus,
                        "hljs-keyword": { color: "#C678DD", fontWeight: "600" },
                        "hljs-built_in": { color: "#61AFEF" },
                        "hljs-string": { color: "#98C379" },
                        "hljs-literal": { color: "#56B6C2" },
                        "hljs-number": { color: "#D19A66" },
                        "hljs-comment": {
                          color: "#5C6370",
                          fontStyle: "italic",
                        },
                        "hljs-function": { color: "#E5C07B" },
                        "hljs-params": { color: "#ABB2BF" },
                        "hljs-variable": { color: "#E06C75" },
                        "hljs-operator": { color: "#56B6C2" },
                        "hljs-punctuation": { color: "#ABB2BF" },
                        "hljs-property": { color: "#61AFEF" },
                        "hljs-title": { color: "#E5C07B" },
                      }}
                      language={language}
                      showLineNumbers={true}
                      wrapLines={false}
                      customStyle={{
                        margin: 0,
                        padding: 0,
                        backgroundColor: "transparent",
                        lineHeight: 1.5,
                        fontSize: "0.95em",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                      codeTagProps={{
                        style: { fontSize: "inherit", lineHeight: "inherit" },
                      }}
                      lineNumberStyle={{
                        minWidth: "2.5em",
                        paddingRight: "1em",
                        marginRight: "1em",
                        textAlign: "right",
                        borderRight: "1px solid #4B5563",
                        color: "#0c0c0c",
                        fontSize: "0.85em",
                        userSelect: "none",
                      }}
                      lineProps={() => ({
                        style: { display: "table-row", width: "100%" },
                      })}
                      wrapLongLines={true}
                      data-oid="inshlvt"
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }
            return (
              <code
                className={`${className} text-base md:text-lg`}
                {...restProps}
                data-oid="wunoen6"
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div data-oid="6ghyp8y">{children}</div>;
          },
          img({ src, alt, ...props }) {
            // Only handle string URLs (skip Blobs or undefined)
            if (typeof src !== "string") return null;

            // Destructure and omit potential width and height props to satisfy Next.js Image requirements
            const {
              width: _width,
              height: _height,
             
            } = props as React.DetailedHTMLProps<
              React.ImgHTMLAttributes<HTMLImageElement>,
              HTMLImageElement
            >;

            return (
              <span
                className="relative block w-full max-w-full my-4"
                data-oid="ee-27pw"
              >
                <div
                  className="relative w-full max-w-full"
                  style={{ maxHeight: "500px" }}
                  data-oid="x:cu-qm"
                >
                  {/* <Image
                    src={src}
                    alt={alt || ""}
                    className="rounded-lg object-contain mx-auto"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain" }}
                    priority={false}
                    {...restProps}
                    data-oid="mvs_rgy"
                  /> */}
                </div>
                {alt && (
                  <span
                    className="block text-center text-sm md:text-base text-gray-500 mt-1"
                    data-oid="64bmpid"
                  >
                    {alt}
                  </span>
                )}
              </span>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4" data-oid=".cc3p93">
                <table
                  className="border-collapse w-full border border-gray-700 text-base md:text-lg"
                  data-oid="j4e6.77"
                >
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th
                className="border border-gray-700 bg-gray-800 px-4 py-2 text-left text-base md:text-lg"
                data-oid="wdw04dy"
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td
                className="border border-gray-700 px-4 py-2 text-base md:text-lg"
                data-oid="wjskacf"
              >
                {children}
              </td>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote
                className="border-l-4 pl-4 italic my-4 text-lg md:text-xl"
                data-oid=".owqao-"
              >
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-3xl font-bold mt-6 mb-4" data-oid="9bs6rr3">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-2xl font-bold mt-5 mb-3" data-oid="-zv0i8.">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3
                className="text-xl font-semibold mt-4 mb-2"
                data-oid="4crs1_7"
              >
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return (
              <ul
                className="list-disc list-inside pl-4 my-4 space-y-1 text-base md:text-lg"
                data-oid=":t-evn6"
              >
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol
                className="list-decimal list-inside pl-4 my-4 space-y-1 text-base md:text-lg"
                data-oid="ekx21yb"
              >
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li className="text-base md:text-lg flex" data-oid="j3vlew5">
                <span className="mr-2" data-oid="f3vwq.6">
                  •
                </span>
                <span className="flex-1" data-oid=":u-up5-">
                  {children}
                </span>
              </li>
            );
          },
          p({ children }) {
            return (
              <p className="text-base md:text-lg my-3" data-oid="9wwc_61">
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

import dynamic from "next/dynamic";

// Export without SSR so DOMPurify and raw HTML parsing work only on client
const MarkdownRendererNoSSR = dynamic(() => Promise.resolve(MarkdownRenderer), {
  ssr: false,
});
export default MarkdownRendererNoSSR;
