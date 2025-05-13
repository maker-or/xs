"use client";

import React from 'react';
import Link from 'next/link';
import ExamStatus from '~/components/ui/ExamStatus';
import { Button } from '~/components/ui/button';

const ExamStatusPage = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exam Status</h1>
        <Link href="/student">
          <Button variant="outline" className="text-sm">
            Return to Dashboard
          </Button>
        </Link>
      </div>
      
      <p className="text-gray-300 mb-6">
        View your current exam availability and status below.
      </p>
      
      <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
        <ExamStatus />
      </div>
    </div>
  );
};

export default ExamStatusPage;