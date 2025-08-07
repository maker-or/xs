import type React from 'react';
import Navbar from '~/components/ui/Navbar';

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="p-6">
      <Navbar />
      {children}
    </div>
  );
}
