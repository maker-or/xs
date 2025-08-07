'use client';

import type React from 'react';

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
    if (rule.includes('→')) {
      const parts = rule.split('→').map((part) => part.trim());
      const left = parts[0] || '';
      const right = parts[1] || '';

      // Process the right side to separate alternatives
      const alternatives = right.split('|').map((alt) => alt.trim());

      return { left, alternatives };
    }

    // Handle rules that might just be continuation alternatives
    if (rule.includes('|')) {
      return {
        left: '',
        alternatives: rule.split('|').map((alt) => alt.trim()),
      };
    }

    return { left: '', alternatives: [rule.trim()] };
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
              className="border-gray-200 border-b last:border-0 dark:border-gray-700"
              data-oid="nr4m8:b"
              key={ruleIndex}
            >
              <td
                className="min-w-[3rem] py-2 pr-3 text-right font-medium text-gray-800 dark:text-gray-200"
                data-oid="gii5s8u"
              >
                {rule.left}
              </td>
              <td
                className="px-3 py-2 font-medium text-blue-600 dark:text-blue-400"
                data-oid="3ftckni"
              >
                →
              </td>
              <td className="py-2 pl-3" data-oid="vq7q7vj">
                {rule.alternatives.map((alt, altIndex) => (
                  <div
                    className="grammar-alternative"
                    data-oid="m18j33l"
                    key={altIndex}
                  >
                    {altIndex > 0 && (
                      <span
                        className="mx-2 font-medium text-gray-500 dark:text-gray-400"
                        data-oid="0qfuhmu"
                      >
                        |
                      </span>
                    )}
                    <span className="grammar-symbols" data-oid="sx1g73k">
                      {alt.split(/\s+/).map((symbol, symIndex) => {
                        // Special formatting for different symbol types
                        if (symbol === 'ε') {
                          return (
                            <span
                              className="mx-1 text-gray-500 italic dark:text-gray-400"
                              data-oid="bwqc5y7"
                              key={symIndex}
                            >
                              ε
                            </span>
                          );
                        }
                        if (/^[A-Z](')?$/.test(symbol)) {
                          // Non-terminals (uppercase with optional prime)
                          return (
                            <span
                              className="mx-1 font-medium text-green-600 dark:text-green-400"
                              data-oid="t:n9a8r"
                              key={symIndex}
                            >
                              {symbol}
                            </span>
                          );
                        }
                        if (/^[a-z]+$/.test(symbol)) {
                          // Terminals (lowercase identifiers)
                          return (
                            <span
                              className="mx-1 font-mono text-purple-600 dark:text-purple-400"
                              data-oid="r1n4xdk"
                              key={symIndex}
                            >
                              {symbol}
                            </span>
                          );
                        }
                        if (/^[+*()^]$/.test(symbol)) {
                          // Operators and parens
                          return (
                            <span
                              className="mx-1 font-bold text-orange-600 dark:text-orange-400"
                              data-oid="iibvy:2"
                              key={symIndex}
                            >
                              {symbol}
                            </span>
                          );
                        }
                        // Other symbols
                        return (
                          <span
                            className="mx-1"
                            data-oid="iaxq_-k"
                            key={symIndex}
                          >
                            {symbol}
                          </span>
                        );
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
