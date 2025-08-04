import { use } from "react";
import Course from "~/components/ui/Course";

const Page = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const { courseId } = use(params);
  console.log("=== ROUTE PAGE LOADED ===");
  console.log("Route params:", { courseId });
  return <Course courseId={courseId} />;
};

export default Page;
