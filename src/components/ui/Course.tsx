'use client';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import CourseCanvas from '~/components/ui/CourseCanvas';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

interface CourseProps {
  courseId: string;
  isPublic?: boolean;
}

const Course = ({ courseId, isPublic = false }: CourseProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const courseIdTyped = courseId as Id<'Course'>;

  console.log('=== COURSE COMPONENT DEBUG ===');
  console.log('the course id is', courseIdTyped);
  console.log('typeof courseId:', typeof courseIdTyped);
  console.log('courseId length:', courseIdTyped?.length);
  console.log('isSignedIn:', isSignedIn);
  console.log('isLoaded:', isLoaded);
  console.log('=== END DEBUG ===');

  // use to get the current course based on the courseId from the url
  const course = useQuery(
    isPublic ? api.course.getPublicCourse : api.course.getCourse,
    courseIdTyped ? { courseId: courseIdTyped } : 'skip'
  );
  console.log('course query result:', course);

  // it is used to get all the course that are created by this particular user
  // const allCourses = useQuery(api.course.listCourse);

  // get all the stages from the current course to display them
  const stages = course?.course?.stages;

  console.log('the different courses', stages);

  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black" />
        <div className="relative z-20 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-white border-b-2" />
          <p className="text-white/80">Checking authentication...</p>
        </div>
      </main>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    router.push('/signin');
    return null;
  }

  // Show error if no courseId
  if (!courseIdTyped) {
    return (
      <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black" />
        <div className="relative z-20 text-center">
          <p className="text-red-400">Error: No course ID provided</p>
          <p className="mt-2 text-white/60">
            URL should be /learning/learn/[courseId]
          </p>
        </div>
      </main>
    );
  }

  // Show loading state while course is being fetched
  if (!(course && stages)) {
    return (
      <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black" />
        <div
          className="absolute inset-0 z-10 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
        <div className="relative z-20 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-white border-b-2" />
          <p className="text-white/80">Loading course...</p>
        </div>
      </main>
    );
  }

  // Show error state if course fetch failed
  if (course.error) {
    return (
      <main className="relative flex h-[100svh] w-[100svw] flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black" />
        <div className="relative z-20 text-center">
          <p className="text-red-400">Error: {course.error}</p>
          {course.error === 'Authentication required' && (
            <p className="mt-2 text-white/60">
              Please sign in to view this course
            </p>
          )}
          {course.error === 'You are not authorized to view this course' && !isPublic && (
            <p className="mt-2 text-white/60">
              This course belongs to another user
            </p>
          )}
          {course.error === 'Course not found' && (
            <p className="mt-2 text-white/60">
              The course you're looking for doesn't exist
            </p>
          )}
        </div>
      </main>
    );
  }

  return <CourseCanvas courseId={courseIdTyped} stages={stages} />;
};

export default Course;
