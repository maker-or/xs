import React from 'react';

export default function ExamStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#e1ddd6]">
      <div className="container mx-auto py-8">
        {children}
      </div>
    </div>
  );
}