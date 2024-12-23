import ServerComponent from '~/components/ui/ServerComponent';
import { FolderProvider } from '~/components/ui/FolderContext';
import Greeting from '~/components/ui/Greeting';
import Navbar from '~/components/ui/Navbar';

interface PageProps {
  params: Promise<{
    folderId: number;
  }>;
}
export default async function FolderPage(props: PageProps) {
  const params = await props.params;
  const folderId = parseInt(params.folderId.toString());

  return (
    <FolderProvider>
            <Greeting/>
            <Navbar/>
      <ServerComponent folderId={folderId} />
    </FolderProvider>
  );
}