import { use } from 'react';
import Course from '~/components/ui/Course';

const Page = ({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { courseId } = use(params);
  const resolvedSearchParams = use(searchParams);
  const isPublic = resolvedSearchParams.public === 'true';

  console.log('=== ROUTE PAGE LOADED ===');
  console.log('Route params:', { courseId });
  console.log('Is public access:', isPublic);

  return <Course courseId={courseId} isPublic={isPublic} />;
};

export default Page;
