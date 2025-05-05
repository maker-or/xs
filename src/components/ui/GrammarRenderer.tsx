"use client";

import React from "react";

interface GrammarRendererProps {
  grammar: string;
}

const GrammarRenderer: React.FC<GrammarRendererProps> = ({ grammar }) => {
  // Split the grammar into individual production rules
  const rules = grammar
    .split(/\n|(?<=\)|\w)(?=\w→)/g)
    .filter((rule) => rule.trim());

  // Process each rule to separate the left and right sides
  const processedRules = rules.map((rule) => {
    // Handle rules with explicit left and right sides
    if (rule.includes("→")) {
      const [left, right] = rule.split("→").map((part) => part.trim());

      // Process the right side to separate alternatives
      const alternatives = right.split("|").map((alt) => alt.trim());

      return { left, alternatives };
    }

    // Handle rules that might just be continuation alternatives
    if (rule.includes("|")) {
      return {
        left: "",
        alternatives: rule.split("|").map((alt) => alt.trim()),
      };
    }

    return { left: "", alternatives: [rule.trim()] };
  });

  return (
    <div className="grammar-renderer my-6 overflow-x-auto" data-oid="jta::p6">
      <table
        className="grammar-table min-w-fit border-collapse text-lg"
        data-oid="-kyodxh"
      >
        <tbody data-oid=".n_gz.9">
          {processedRules.map((rule, ruleIndex) => (
            <tr
              key={ruleIndex}
              className="border-b border-gray-200 dark:border-gray-700 last:border-0"
              data-oid="nr4m8:b"
            >
              <td
                className="py-2 pr-3 text-right font-medium min-w-[3rem] text-gray-800 dark:text-gray-200"
                data-oid="gii5s8u"
              >
                {rule.left}
              </td>
              <td
                className="py-2 px-3 text-blue-600 dark:text-blue-400 font-medium"
                data-oid="3ftckni"
              >
                →
              </td>
              <td className="py-2 pl-3" data-oid="vq7q7vj">
                {rule.alternatives.map((alt, altIndex) => (
                  <div
                    key={altIndex}
                    className="grammar-alternative"
                    data-oid="m18j33l"
                  >
                    {altIndex > 0 && (
                      <span
                        className="mx-2 text-gray-500 dark:text-gray-400 font-medium"
                        data-oid="0qfuhmu"
                      >
                        |
                      </span>
                    )}
                    <span className="grammar-symbols" data-oid="sx1g73k">
                      {alt.split(/\s+/).map((symbol, symIndex) => {
                        // Special formatting for different symbol types
                        if (symbol === "ε") {
                          return (
                            <span
                              key={symIndex}
                              className="mx-1 italic text-gray-500 dark:text-gray-400"
                              data-oid="bwqc5y7"
                            >
                              ε
                            </span>
                          );
                        } else if (/^[A-Z](')?$/.test(symbol)) {
                          // Non-terminals (uppercase with optional prime)
                          return (
                            <span
                              key={symIndex}
                              className="mx-1 font-medium text-green-600 dark:text-green-400"
                              data-oid="t:n9a8r"
                            >
                              {symbol}
                            </span>
                          );
                        } else if (/^[a-z]+$/.test(symbol)) {
                          // Terminals (lowercase identifiers)
                          return (
                            <span
                              key={symIndex}
                              className="mx-1 font-mono text-purple-600 dark:text-purple-400"
                              data-oid="r1n4xdk"
                            >
                              {symbol}
                            </span>
                          );
                        } else if (/^[+*()^]$/.test(symbol)) {
                          // Operators and parens
                          return (
                            <span
                              key={symIndex}
                              className="mx-1 font-bold text-orange-600 dark:text-orange-400"
                              data-oid="iibvy:2"
                            >
                              {symbol}
                            </span>
                          );
                        } else {
                          // Other symbols
                          return (
                            <span
                              key={symIndex}
                              className="mx-1"
                              data-oid="iaxq_-k"
                            >
                              {symbol}
                            </span>
                          );
                        }
                      })}
                    </span>
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GrammarRenderer;
