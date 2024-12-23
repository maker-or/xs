import getMyImages from "../../server/quries"; // Assuming this is a server-side function
import ClientComponent from "./ClientComponent"; // This will be your client-side code

interface ServerComponentProps {
  folderId: number;
}

export default async function ServerComponent({
  folderId,
}: ServerComponentProps) {
  const images = await getMyImages(Number(folderId)); // Pass folderId to getMyImages

  return <ClientComponent folderId={folderId}  images={images ?? []} />;
}
//folderId={folderId} 