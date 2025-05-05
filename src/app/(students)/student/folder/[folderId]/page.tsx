import ServerComponent from '~/components/ui/ServerComponent';
import { FolderProvider } from '~/components/ui/FolderContext';
import Greeting from '~/components/ui/Greeting';
import Navbar from '~/components/ui/Navbar';

interface PageProps {
  params: {
    folderId: string;
  };
}

export default function FolderPage({ params }: PageProps) {
  const folderId = parseInt(params.folderId);

  return (
    <FolderProvider>
      <Greeting />
      <Navbar />
      <ServerComponent folderId={folderId} />
    </FolderProvider>
  );
}
