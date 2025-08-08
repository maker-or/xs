'use client';

import { useAuth } from '@clerk/nextjs';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '~/components/ui/button';

const LibraryPage = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  // Removed pagination state – all courses rendered in one scrollable grid


  // Load a large batch – adjust if you expect more; consider virtualization for very large sets
  const MAX_COURSES = 1000;

  // Get all courses with pagination - always load unless searching
  const allCoursesData = useQuery(
    api.course.getAllCourses,
    isSignedIn && searchQuery.trim().length === 0
      ? {
          limit: MAX_COURSES,
          offset: 0
        }
      : 'skip'
  );

  // Search courses when user enters search query
  const searchResults = useQuery(
    api.course.searchAllCourses,
    isSignedIn && searchQuery.trim().length > 0
      ? {
          query: searchQuery.trim(),
          limit: 50
        }
      : 'skip'
  );

  // Determine which data to show - always show all courses unless actively searching
  const displayData = useMemo(() => {
    if (searchQuery.trim().length > 0 && searchResults) {
      return {
        courses: searchResults || [],
        total: searchResults?.length || 0
      };
    }
    return allCoursesData || { courses: [], total: 0 };
  }, [searchQuery, searchResults, allCoursesData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/learning/learn/${courseId}?public=true`);
  };

  // Utility – kept if needed later (currently not displayed)
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">
            Please sign in to access the library
          </h1>
          <p className="text-gray-600">
            You need to be authenticated to browse courses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-black">
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px'
        }}
      />

      {/* Header */}
      <div className="relative z-20 border-b border-white/20 bg-black/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center  gap-4 space-y-4">
            <div className="flex justify-start">
              <Button
                onClick={() => router.push('/learning')}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                ←
              </Button>
            </div>
            <div className='flex-col items-start'>
              <div className="text-left">
                <h1 className="text-5xl font-light text-white">
                <span className="font-serif italic">Knowledge</span> Library
                </h1>
              </div>
              {displayData.courses.length > 0 && (
                <div className="text-left text-sm text-white/60">
                  {searchQuery.trim().length > 0
                    ? `Found ${displayData.total} results`
                    : `${displayData.total} courses`}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 w-full  ">
        {displayData.courses.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              border-l border-t border-white/20
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-6
            "
          >
            {displayData.courses.map((course, idx) => {
              // Global index (1-based)
              const indexNumber = (allCoursesData?.courses || []).findIndex(
                (c: any) => c._id === course._id
              );
              const displayIndex =
                indexNumber >= 0 ? indexNumber + 1 : idx + 1; // fallback
              const paddedIndex = displayIndex.toString().padStart(2, '0');
              const stagesCount = course.stages?.length || 0;

              return (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => handleCourseClick(course._id)}
                  className="
                    group
                    flex
                    h-72
                    w-full
                    flex-col
                    border-b
                    border-r
                    border-white/20
                    bg-black/40
                    p-6
                    text-left
                    transition-colors
                    hover:bg-white/5
                    focus:outline-none
                    focus:ring-2
                    focus:ring-white/40
                  "
                  aria-label={`Course ${paddedIndex}: ${truncateText(
                    course.prompt,
                    80
                  )} – ${stagesCount} ${stagesCount === 1 ? 'stage' : 'stages'}`}
                >
                  <div className="flex-col items-start justify-start">
                    <div className="text-[4em] font-light tracking-tight text-white">
                      {paddedIndex}
                    </div>
                    <div className="text-xs font-normal  tracking-wide text-white/50">
                      {stagesCount} {stagesCount === 1 ? 'stage' : 'stages'}
                    </div>
                  </div>
                  {/*<div className="mt-6 h-px w-full bg-white/10" />*/}
                  <p
                    className="
                      mt-6
                      line-clamp-6
                      text-md
                      leading-relaxed
                      text-white/80
                      group-hover:text-white
                    "
                  >
                    {course.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search bar (fixed) */}
      <div className="fixed bottom-8 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <MagnifyingGlassIcon
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-full border border-white/30 bg-black/20 px-12 py-4 text-white placeholder-white/50 backdrop-blur-md focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
};

export default LibraryPage;
