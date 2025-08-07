'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';

const Navyear = ({ yearprop }: { yearprop?: string }) => {
  // const pathName = usePathname();
  const [year, setYear] = useState<number>(yearprop ? Number(yearprop) : 1);

  const YEARS = [{ year: 1 }, { year: 2 }, { year: 3 }, { year: 4 }];

  return (
    <nav className="mt-2 w-full px-2 font-serif md:mt-4 md:px-0">
      <div className="flex w-full justify-center">
        <ul className="no-scrollbar flex w-full flex-row items-center justify-between overflow-x-auto rounded-full border border-[#f7eee332] bg-[#1f1f1f] px-2 py-2 font-medium text-[#646464] text-sm md:w-auto md:px-4 md:py-3 md:text-[1.2rem]">
          {YEARS.map((el, index) => (
            <li className="min-w-fit px-1 md:px-2" key={index}>
              <Link href={`/repo/year/${index + 1}`}>
                <button
                  className={`whitespace-nowrap rounded-full px-3 py-2 transition-all duration-300 md:px-4 md:py-3 ${
                    year === el.year
                      ? 'bg-[#FF5E00] text-[#000000]'
                      : 'hover:bg-[#2a2a2a]'
                  }`}
                  onClick={() => setYear(index + 1)}
                >
                  {el.year} year
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navyear;
