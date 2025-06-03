import ServerComponent from '~/components/ui/ServerComponent';
import { FolderProvider } from '~/components/ui/FolderContext';
import Greeting from '~/components/ui/Greeting';
import Navbar from '~/components/ui/Navbar';
import { Suspense } from 'react';

// Import the generated types to ensure compatibility
import { PageProps } from '.next/types/app/(students)/student/folder/[folderId]/page';

export default async function FolderPage(props: PageProps) {
  // Wait for params to resolve if it's a Promise
  const params = await props.params;
  const folderId = parseInt(params.folderId);

  return (
     <main className="flex min-h-[100svh] p-5 flex-col items-center justify-start bg-[#000000]  ">
    <FolderProvider>
      <Greeting />
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <ServerComponent folderId={folderId} />
      </Suspense>
    </FolderProvider>
   </main>
  );
}
