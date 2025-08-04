"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Stage interface matching the schema
interface Stage {
  title: string;
  purpose: string;
  include: string[];
  outcome: string;
  discussion_prompt: string;
}

interface CourseCanvasProps {
  stages: Stage[];
  courseId: Id<"Course">;
}

// Generate curved path between two points for wave-like connections
const generateCurvedPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Create a gentle curve with control points
  const cp1x = start.x + dx * 0.5;
  const cp1y = start.y + dy * 0.5 + 20; // Add some wave
  const cp2x = end.x - dx * 0.5;
  const cp2y = end.y - dy * 0.5 - 20; // Add some wave

  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
};

// Generate horizontal positions with wave-like arrangement
const generateStagePositions = (stageCount: number, containerWidth: number) => {
  const positions: { x: number; y: number }[] = [];
  const spacing = containerWidth / (stageCount + 1);
  const centerY = 300;
  const waveHeight = 60;

  for (let i = 0; i < stageCount; i++) {
    const x = spacing * (i + 1);
    // Create wave pattern: first up, then down, then up
    const waveOffset = Math.sin((i / (stageCount - 1)) * Math.PI) * waveHeight;
    const y = centerY + waveOffset;

    positions.push({ x, y });
  }

  return positions;
};

const StageIsland: React.FC<{
  stage: Stage;
  index: number;
  position: { x: number; y: number };
  onClick: () => void;
  isReady?: boolean;
}> = ({ stage, index, position, onClick, isReady = false }) => {
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      {/* Island background */}
      <rect
        x={-50}
        y={-50}
        width={100}
        height={100}
        rx={16}
        fill={isReady ? "rgba(0, 0, 0, 0.8)" : "rgba(100, 100, 100, 0.6)"}
        stroke={isReady ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 165, 0, 0.5)"}
        strokeWidth={2}
        className="transition-all duration-300 hover:brightness-110"
      />

      {/* Loading indicator for stages being created */}
      {!isReady && (
        <circle
          cx={35}
          cy={-35}
          r={6}
          fill="rgba(255, 165, 0, 0.8)"
          className="animate-pulse"
        />
      )}

      {/* Stage number */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={32}
        fontWeight="bold"
        fill="white"
        className="select-none"
      >
        {index + 1}
      </text>

      {/* Stage title */}
      <text
        x={0}
        y={70}
        textAnchor="middle"
        fontSize={14}
        fill="rgba(255, 255, 255, 0.8)"
        className="select-none"
      >
        {stage.title.length > 12
          ? `${stage.title.substring(0, 12)}...`
          : stage.title}
      </text>
    </g>
  );
};

const CourseCanvas: React.FC<CourseCanvasProps> = ({ stages, courseId }) => {
  const stageIds = useQuery(api.stage.getstageIds, { courseId });
  const router = useRouter();

  // Handle stage click
  const handleStageClick = (stageIndex: number) => {
    // Get the actual stageId from the stageIds array
    if (stageIds && stageIds.stageIds && stageIds.stageIds[stageIndex]) {
      const stageId = stageIds.stageIds[stageIndex];
      router.push(`/learning/stage/${courseId}/${stageId}`);
    } else {
      // Stage not ready yet - show a message or do nothing
      console.log(`Stage ${stageIndex + 1} is still being created...`);
    }
  };

  // Handle back button
  const handleBack = () => {
    router.back();
  };

  // Generate stage positions
  const stagePositions = generateStagePositions(stages.length, 1200);

  return (
    <main className="relative min-h-[100svh] w-full bg-black">
      {/* Noise overlay */}
      <div
        className="absolute inset-0 z-10 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Back button and title */}
      <div className="absolute left-6 top-6 z-30 flex items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="rounded-lg border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-serif text-4xl italic text-white">Your Course</h1>
      </div>

      {/* Canvas */}
      <div className="relative z-20 h-full w-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 600"
          className="cursor-pointer"
        >
          {/* Connecting paths with arrows */}
          <g>
            {stagePositions.slice(0, -1).map((position, index) => {
              const nextPosition = stagePositions[index + 1];
              if (!position || !nextPosition) return null;
              const pathData = generateCurvedPath(position, nextPosition);

              return (
                <g key={`path-${index}`}>
                  {/* Glow effect */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={6}
                    filter="blur(3px)"
                  />
                  {/* Main path */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth={2}
                  />
                  {/* Arrowhead */}
                  <defs>
                    <marker
                      id={`arrowhead-${index}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="rgba(255, 255, 255, 0.6)"
                      />
                    </marker>
                  </defs>
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={2}
                    markerEnd={`url(#arrowhead-${index})`}
                  />
                </g>
              );
            })}
          </g>

          {/* Stage islands */}
          <g>
            {stages.map((stage, index) => {
              const isReady =
                stageIds && stageIds.stageIds && stageIds.stageIds[index];
              return (
                <StageIsland
                  key={index}
                  stage={stage}
                  index={index}
                  position={stagePositions[index]!}
                  onClick={() => handleStageClick(index)}
                  isReady={!!isReady}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Status text */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 transform">
        {stageIds && stageIds.stageIds ? (
          <p className="text-center text-lg text-white/60">
            {stageIds.stageIds.length === stages.length
              ? "All stages ready! Click any stage to explore."
              : `Creating content... ${stageIds.stageIds.length}/${stages.length} stages ready`}
          </p>
        ) : (
          <p className="text-center text-lg text-white/60">
            Creating context inside each stage...
          </p>
        )}
      </div>
    </main>
  );
};

export default CourseCanvas;
