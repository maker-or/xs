"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import StageInfo from "~/components/StageInfo";

interface StagePageProps {
  params: Promise<{
    courseId: string;
    stageId: string;
  }>;
}

const StagePage = ({ params }: StagePageProps) => {
  const { courseId, stageId } = use(params);

  // Validate that we have valid Convex IDs
  const courseIdTyped = courseId as Id<"Course">;
  const stageIdTyped = stageId as Id<"Stage">;

  // Fetch the stage data
  const stageResult = useQuery(api.stage.getStage, {
    courseId: courseIdTyped,
    stageId: stageIdTyped,
  });

  // Show loading state
  if (stageResult === undefined) {
    return (
      <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black" />
        <div
          className="absolute inset-0 z-10 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />
        <div className="relative z-20 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          <p className="text-white/80">Loading stage...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (stageResult.error || !stageResult.stage) {
    return (
      <main className="relative min-h-[100svh] w-[100svw]">
        {/* Black background */}
        <div className="absolute inset-0 z-0 bg-black" />

        {/* Noise overlay */}
        <div
          className="absolute inset-0 z-10 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />

        {/* Back button */}
        <Link
          href={`/learning/learn/${courseId}`}
          className="absolute left-6 top-6 z-30 rounded-lg border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Error content */}
        <div className="relative z-20 flex h-full w-full flex-col items-center justify-center px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-light text-red-400">
              Error Loading Stage
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-white/60">
              {stageResult.error || "Stage not found"}
            </p>
            <Link
              href={`/learning/learn/${courseId}`}
              className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-white transition-all duration-200 hover:bg-white/20"
            >
              Back to Course Map
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Render the stage with StageInfo component
  return (
    <div className="relative">
      {/* Back button overlay */}
      <Link
        href={`/learning/learn/${courseId}`}
        className="absolute left-6 top-6 z-50 rounded-lg border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      {/* Stage content */}
      <StageInfo stage={stageResult.stage} />
    </div>
  );
};

export default StagePage;
