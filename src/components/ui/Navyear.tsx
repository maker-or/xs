'use client';
import React,{useState} from 'react';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Navyear = ({yearprop}:{yearprop ?: string}) => {
  // const pathName = usePathname();
  const [year, setYear] = useState<number>(yearprop ? Number(yearprop) : 1);

  const YEARS = [
    { year: 1 },
    { year: 2 },
    { year: 3 },
    { year: 4 },
  ]

  return (
    <nav className="mt-2 md:mt-4 font-serif w-full px-2 md:px-0">
      <div className="flex justify-center w-full">
        <ul className="flex flex-row items-center justify-between w-full md:w-auto overflow-x-auto no-scrollbar bg-[#1f1f1f] border-[#f7eee332] py-2 md:py-3 px-2 md:px-4 rounded-full border text-[#646464] text-sm md:text-[1.2rem] font-medium">  
          {YEARS.map((el,index) => (
            <li key={index} className="px-1 md:px-2 min-w-fit">
              <Link href={`/repo/year/${index+1}`}>
                <button 
                  onClick={() => setYear(index+1)}
                  className={`rounded-full px-3 md:px-4 py-2 md:py-3 transition-all duration-300 whitespace-nowrap ${
                    year === el.year ? 'bg-[#FF5E00] text-[#000000]' : 'hover:bg-[#2a2a2a]'
                  }`}
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
}

export default Navyear;
