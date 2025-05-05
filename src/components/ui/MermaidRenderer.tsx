"use client";
import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

// Add type definition for mermaid with version property
interface MermaidInstance {
  initialize: (config: MermaidConfig) => void;
  parse: (text: string) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
  version?: string;
}

// Add type for mermaid configuration
interface MermaidConfig {
  startOnLoad: boolean;
  theme: string;
  themeVariables: Record<string, string | boolean | number>;
  securityLevel: string;
  gantt?: Record<string, number | boolean>;
  sequence?: Record<string, number | boolean>;
  flowchart?: Record<string, number | boolean>;
  er?: Record<string, number | boolean>;
  class?: Record<string, number | boolean>;
}

interface MermaidRendererProps {
  chart: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const expandedContainerRef = useRef<HTMLDivElement>(null);
  const chartId = useRef(
    `mermaid-chart-${Math.random().toString(36).substring(7)}`,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderedSVG, setRenderedSVG] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1.35);

  // Define adjustSvgSize before it's used in the useEffect
  const adjustSvgSize = React.useCallback(
    (svg: string): string => {
      // Parse the SVG string to access and modify elements
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (svgElement) {
        // Get the original viewBox but we won't use it directly
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const viewBox = svgElement.getAttribute("viewBox");

        // Set minimum dimensions for visibility
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
        svgElement.style.minWidth = "600px";
        svgElement.style.minHeight = "300px";

        // If it's a sequence diagram, ensure it's wide enough
        if (chart.includes("sequenceDiagram")) {
          svgElement.style.minWidth = "800px";
        }

        // Apply scaling for better visibility in normal view
        svgElement.style.transform = "scale(1)";
        svgElement.style.transformOrigin = "center";
        svgElement.style.margin = "20px 0";
      }

      return new XMLSerializer().serializeToString(doc);
    },
    [chart],
  );

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false, // We control rendering manually
      theme: "dark",
      // Custom theme settings to match the desired appearance
      themeVariables: {
        darkMode: true,
        background: "#1e1e1e",
        primaryColor: "#333333",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#ffffff",
        lineColor: "#ffffff",
        secondaryColor: "#333333",
        tertiaryColor: "#333333",
        fontSize: "16px",
      },
      securityLevel: "strict",
      // Improve diagram size by setting proper defaults
      gantt: { useWidth: 800 },
      sequence: { useMaxWidth: false, width: 800 },
      flowchart: { useMaxWidth: false, htmlLabels: true },
      er: { useMaxWidth: false },
      class: { useMaxWidth: false },
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !chart) return;
    containerRef.current.innerHTML = "";

    // More comprehensive syntax normalization
    const sanitizedChart = chart
      // Fix common arrow syntax issues
      .replace(/-->\|(.+?)\|>/g, "-->|$1|")
      .replace(/--\|(.+?)\|(?!>)/g, "-->|$1|")
      // Fix standalone arrow connections without proper syntax
      .replace(/\s+--\|([^|]+?)\|\s+/g, " -->|$1| ")
      // Ensure proper spacing between connections
      .replace(/(\w+)\s*-->/g, "$1 -->")
      .replace(/-->(\w+)/g, "--> $1");

    if (!sanitizedChart.trim()) return;

    // Validate syntax first
    try {
      mermaid.parse(sanitizedChart);
    } catch {
      // Display syntax error in the style shown in the image
      const typedMermaid = mermaid as MermaidInstance;
      const mermaidVersion = typedMermaid.version || "11.6.0";

      containerRef.current.innerHTML = `
        <div class="flex flex-col items-start w-full">
          <div class="flex items-center mb-1">
            <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div>
              <div class="text-xl font-semibold text-white">Syntax error in text</div>
              <div class="text-gray-400">mermaid version ${mermaidVersion}</div>
            </div>
          </div>
        </div>`;
      return;
    }

    // Render diagram
    mermaid
      .render(chartId.current, sanitizedChart)
      .then(({ svg }) => {
        if (containerRef.current) {
          // Apply SVG adjustments for better sizing before inserting into DOM
          const enhancedSVG = adjustSvgSize(svg);
          containerRef.current.innerHTML = enhancedSVG;

          // Store the SVG for use in expanded view
          setRenderedSVG(enhancedSVG);

          // Remove the dynamic button addition since we're using a fixed button in the JSX
        }
      })
      .catch(() => {
        // Display syntax error in the style shown in the image
        const typedMermaid = mermaid as MermaidInstance;
        const mermaidVersion = typedMermaid.version || "11.6.0";

        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex flex-col items-start w-full">
              <div class="flex items-center mb-1">
                <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <div>
                  <div class="text-xl font-semibold text-white">Syntax error in text</div>
                  <div class="text-gray-400">mermaid version ${mermaidVersion}</div>
                </div>
              </div>
            </div>`;
        }
      });
  }, [chart, adjustSvgSize]);

  // Function to apply the current scale to the preview SVG
  // Using useCallback to avoid dependency issues
  const applyPreviewScale = React.useCallback(() => {
    if (!expandedContainerRef.current) return;

    const svgElement = expandedContainerRef.current.querySelector("svg");
    if (svgElement) {
      svgElement.setAttribute("width", "100%");
      svgElement.setAttribute("height", "100%");
      svgElement.style.minWidth = "800px";
      svgElement.style.minHeight = "500px";
      svgElement.style.maxHeight = "80vh";

      // Apply the current scale factor from state
      svgElement.style.transform = `scale(${previewScale})`;
      svgElement.style.transformOrigin = "center";
      svgElement.style.margin = "30px 0";
    }
  }, [previewScale]);

  // Effect to handle rendering in the expanded view
  useEffect(() => {
    if (isExpanded && expandedContainerRef.current && renderedSVG) {
      expandedContainerRef.current.innerHTML = renderedSVG;

      // Apply scale based on current previewScale state
      applyPreviewScale();
    }
  }, [isExpanded, renderedSVG, previewScale, applyPreviewScale]);

  // Scale adjustment handlers
  const zoomIn = () => {
    setPreviewScale((prev) => Math.min(prev + 0.25, 3.0)); // Cap at 3.0x zoom
  };

  const zoomOut = () => {
    setPreviewScale((prev) => Math.max(prev - 0.25, 0.5)); // Minimum 0.5x zoom
  };

  return (
    <>
      {/* Container with relative positioning and fixed expand button */}
      <div className="relative" data-oid="owb:zwf">
        {/* Diagram container */}
        <div
          ref={containerRef}
          className="mermaid-diagram-container my-4 flex justify-center bg-[#1e1e1e] rounded-lg p-4 w-full overflow-auto"
          style={{ minHeight: "350px" }}
          data-oid="fphr6bs"
        ></div>

        {/* Fixed expand button */}
        <button
          className="absolute top-6 right-6 p-1.5 rounded bg-[#0c0c0c] hover:bg-gray-700 text-gray-300 hover:text-white transition-colors z-10"
          onClick={() => setIsExpanded(true)}
          aria-label="Expand diagram"
          data-oid="31e2g4p"
        >
          <Maximize2 size={16} data-oid="5.5bxs8" />
        </button>
      </div>

      {/* Modal for expanded view */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-[#0c0c0c] flex items-center justify-center z-50 p-4"
          data-oid="ccg:u8q"
        >
          <div
            className="bg-[#1e1e1e] rounded-lg w-full max-w-6xl h-auto max-h-[90vh] overflow-auto relative"
            data-oid="03psrhi"
          >
            {/* Close button */}
            {/* <button 
            className="absolute top-3 right-3 p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors z-10"
            onClick={() => setIsExpanded(false)}
            aria-label="Close expanded view"
            >
            <X size={20} />
            </button> */}

            {/* Title and controls */}
            <div
              className="px-4 py-3 border-b border-gray-700 flex justify-between items-center"
              data-oid="zv.4huh"
            >
              <h3
                className="text-lg font-semibold text-white"
                data-oid="2uqxf54"
              >
                Diagram Preview
              </h3>

              {/* Scale controls */}
              <div className="flex items-center space-x-2" data-oid="4cuf8.b">
                <span className="text-gray-400 text-sm mr-2" data-oid="5dd7bau">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  className="p-1.5 rounded bg-[#0c0c0c] text-white hover:bg-gray-600 transition-colors"
                  onClick={zoomOut}
                  aria-label="Zoom out"
                  disabled={previewScale <= 0.5}
                  data-oid="5e0k3mi"
                >
                  <ZoomOut size={18} data-oid="o6k6l_y" />
                </button>
                <button
                  className="p-1.5 rounded bg-[#0c0c0c] text-white hover:bg-gray-600 transition-colors"
                  onClick={zoomIn}
                  aria-label="Zoom in"
                  disabled={previewScale >= 3.0}
                  data-oid="gtzlyj-"
                >
                  <ZoomIn size={18} data-oid="jpj1u3z" />
                </button>

                <button
                  className="p-1.5 rounded bg-[#0c0c0c] text-white hover:bg-gray-600 transition-colors"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close expanded view"
                  data-oid="1lc_jpv"
                >
                  <X size={18} data-oid="v8tdx5:" />
                </button>
              </div>
            </div>

            {/* Content with increased size */}
            <div
              className="p-6 flex items-center justify-center overflow-auto"
              style={{ minHeight: "500px" }}
              data-oid="2.:eaz8"
            >
              <div
                ref={expandedContainerRef}
                className="mermaid-expanded-container"
                data-oid="k1zljj6"
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MermaidRenderer;
