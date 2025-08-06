import { Waitlist } from '@clerk/nextjs';

const page = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Waitlist />
    </div>
  );
};
export default page;
