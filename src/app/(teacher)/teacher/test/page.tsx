import { BarChart3, Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Navbar from '~/components/ui/Navbar';
import Tnav from '~/components/ui/Tnav';

const page = () => {
  return (
    <div className="relative h-[100svh] w-[100svw] overflow-hidden bg-black">
      <div className="relative z-50">
        <Tnav />
      </div>

      {/* 4x4 Grid Container - Full screen */}
      <div className="absolute inset-0 h-[100svh] w-[100svw]">
        <div
          className="relative grid h-full w-full"
          style={{
            gridTemplateColumns: '0.5fr 2fr 2fr 0.5fr', // Column widths: narrow, wide (square), wide (square), narrow
            gridTemplateRows: '1fr 3fr 0.8fr 1fr', // Row heights: medium, tall (for cards), short (for names), medium
          }}
        >
          {/* Grid Lines and Intersection Dots */}
          <div className="pointer-events-none absolute inset-0">
            {/* Vertical Lines */}
            {[1, 2, 3].map((i) => (
              <div
                className="absolute top-0 bottom-0 w-px bg-white opacity-[0.08]"
                key={`v-${i}`}
                style={{
                  left: i === 1 ? '10%' : i === 2 ? '50%' : '90%', // Adjusted for new column widths: 0.5fr, 2fr, 2fr, 0.5fr
                }}
              />
            ))}

            {/* Horizontal Lines */}
            {[1, 2, 3].map((i) => (
              <div
                className="absolute right-0 left-0 h-px bg-white opacity-[0.08]"
                key={`h-${i}`}
                style={{
                  top: i === 1 ? '17.39%' : i === 2 ? '69.57%' : '83.48%', // Adjusted for new row heights: 1fr, 3fr, 0.8fr, 1fr
                }}
              />
            ))}

            {/* Intersection Dots */}
            {[0, 17.39, 69.57, 83.48, 100].map((row, rowIndex) =>
              [0, 10, 50, 90, 100].map((col, colIndex) => (
                <div
                  className="absolute h-1 w-1 rounded-full bg-white opacity-20"
                  key={`dot-${rowIndex}-${colIndex}`}
                  style={{
                    left: `${col}%`,
                    top: `${row}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))
            )}
          </div>

          {/* Row 1: Medium height - Empty */}
          <div className="col-span-4" />

          {/* Row 2: Tallest height - Cards (exactly in the middle) */}
          <div className="col-span-1" />
          <div className="col-span-1 flex items-center justify-center p-4">
            <Link className="group h-full w-full" href="/teacher/exams">
              <div className="flex h-full min-h-[200px] w-full cursor-pointer items-center justify-center rounded-3xl border border-[#333] bg-[#1a1a1a] transition-all duration-300 hover:border-[#444] hover:bg-[#2a2a2a]">
                <div className=" rounded-2xl p-8 transition-colors duration-300 group-hover:bg-[#3a3a3a]">
                  <Plus className="h-16 w-16 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          </div>
          <div className="col-span-1 flex items-center justify-center p-4">
            <Link className="group h-full w-full" href="/teacher/exams/results">
              <div className="flex h-full min-h-[200px] w-full cursor-pointer items-center justify-center rounded-3xl border border-[#333] bg-[#1a1a1a] transition-all duration-300 hover:border-[#444] hover:bg-[#2a2a2a]">
                <div className="rounded-2xl p-8 transition-colors duration-300 group-hover:bg-[#3a3a3a]">
                  <BarChart3
                    className="h-16 w-16 text-white"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </Link>
          </div>
          <div className="col-span-1" />

          {/* Row 3: Short height - Text Labels */}
          <div className="col-span-1" />
          <div className="col-span-1 flex items-center justify-center">
            <h3 className="font-medium text-lg text-white opacity-60">
              New exam
            </h3>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <h3 className="font-medium text-lg text-white opacity-60">
              Results
            </h3>
          </div>
          <div className="col-span-1" />

          {/* Row 4: Medium height - Empty */}
          <div className="col-span-4" />
        </div>
      </div>
    </div>
  );
};

export default page;
