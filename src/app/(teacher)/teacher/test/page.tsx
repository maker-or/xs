import React from 'react'
import Link from "next/link";
import Navbar from "~/components/ui/Navbar";
import Tnav from "~/components/ui/Tnav";


import { Plus, BarChart3 } from "lucide-react";

const page = () => {
  return (
    <div className="w-[100svw] h-[100svh] bg-black relative overflow-hidden">
      <div className='z-50 relative'>
           <Tnav />
      </div>
   
      {/* 4x4 Grid Container - Full screen */}
      <div className="absolute inset-0 w-[100svw] h-[100svh]">
        <div
          className="w-full h-full grid relative"
          style={{
            gridTemplateColumns: '0.5fr 2fr 2fr 0.5fr', // Column widths: narrow, wide (square), wide (square), narrow
            gridTemplateRows: '1fr 3fr 0.8fr 1fr' // Row heights: medium, tall (for cards), short (for names), medium
          }}
        >

          {/* Grid Lines and Intersection Dots */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical Lines */}
            {[1, 2, 3].map((i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-px bg-white opacity-[0.08]"
                style={{
                  left: i === 1 ? '10%' : i === 2 ? '50%' : '90%' // Adjusted for new column widths: 0.5fr, 2fr, 2fr, 0.5fr
                }}
              />
            ))}

            {/* Horizontal Lines */}
            {[1, 2, 3].map((i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-px bg-white opacity-[0.08]"
                style={{
                  top: i === 1 ? '17.39%' : i === 2 ? '69.57%' : '83.48%' // Adjusted for new row heights: 1fr, 3fr, 0.8fr, 1fr
                }}
              />
            ))}

            {/* Intersection Dots */}
            {[0, 17.39, 69.57, 83.48, 100].map((row, rowIndex) =>
              [0, 10, 50, 90, 100].map((col, colIndex) => (
                <div
                  key={`dot-${rowIndex}-${colIndex}`}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                  style={{
                    left: `${col}%`,
                    top: `${row}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))
            )}
          </div>

          {/* Row 1: Medium height - Empty */}
          <div className="col-span-4"></div>

          {/* Row 2: Tallest height - Cards (exactly in the middle) */}
          <div className="col-span-1"></div>
          <div className="col-span-1 flex items-center justify-center p-4">
            <Link href="/teacher/exams" className="group w-full h-full">
              <div className="bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all duration-300 rounded-3xl flex items-center justify-center w-full h-full border border-[#333] hover:border-[#444] cursor-pointer min-h-[200px]">
                <div className=" group-hover:bg-[#3a3a3a] transition-colors duration-300 rounded-2xl p-8">
                  <Plus className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          </div>
          <div className="col-span-1 flex items-center justify-center p-4">
            <Link href="/teacher/exams/results" className="group w-full h-full">
              <div className="bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all duration-300 rounded-3xl flex items-center justify-center w-full h-full border border-[#333] hover:border-[#444] cursor-pointer min-h-[200px]">
                <div className="group-hover:bg-[#3a3a3a] transition-colors duration-300 rounded-2xl p-8">
                  <BarChart3 className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          </div>
          <div className="col-span-1"></div>

          {/* Row 3: Short height - Text Labels */}
          <div className="col-span-1"></div>
          <div className="col-span-1 flex items-center justify-center">
            <h3 className="text-white text-lg font-medium opacity-60">New exam</h3>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <h3 className="text-white text-lg font-medium opacity-60">Results</h3>
          </div>
          <div className="col-span-1"></div>

          {/* Row 4: Medium height - Empty */}
          <div className="col-span-4"></div>
        </div>
      </div>
    </div>
  )
}

export default page
