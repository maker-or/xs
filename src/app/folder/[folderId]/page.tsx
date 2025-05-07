import { redirect } from 'next/navigation';

// Remove all type annotations and let Next.js infer the types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RedirectPage(props: any) {
  const folderId = props.params?.folderId;
  
  if (typeof folderId === 'string') {
    redirect(`/student/folder/${folderId}`);
  } else {
    // Fallback if folderId is missing or not a string
    redirect('/student');
  }
}
