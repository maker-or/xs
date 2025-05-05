import { redirect } from 'next/navigation';

export default function RedirectPage({ params }: { params: { folderId: string } }) {
  redirect(`/student/folder/${params.folderId}`);
}
