'use client';
import React,{useState} from 'react';

// import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Navyear = ({yearprop}:{yearprop ?: string}) => {
  const pathName = usePathname();
  const [year, setYear] = useState<number>(yearprop ? Number(yearprop) : 1);

  const YEARS = [
    {
      year: 1
    },
    {
      year: 2
    },
    {
      year: 3
    },
    {
      year: 4
    },
  ]

  // Function to check if the current path matches the link's path
  const isActive = (path: string) => pathName === path;
    return (
      <nav className="mt-4">
        <div   className="items-center flex ">
          <ul className="inline-flex flex-row items-center mx-auto bg-[#1f1f1f] border-[#f7eee332] py-3 px-4 rounded-full border text-[#646464] text-[1.2rem] font-medium">  

             {
              YEARS.map((el,index) => <li key={index} className="px-2">
                <Link href={`/repo/year/${index+1}`}>
                  <button 
                    onClick={() => setYear(index+1)}
                      className={`rounded-full px-4 py-3 transition-all duration-300 ${
                        year === el.year ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                      }`}
                    >
                    {el.year} year
                  </button>
                </Link>
          </li> )
             }
  
            {/* <li className="px-2">
                <button
                  className={`rounded-full px-4 py-3 ${
                    isActive('/Repos') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
                >
                  2 year
                </button>
            </li>
  
            <li className="px-2">
                <button
                  className={`rounded-full px-4 py-3 ${
                    isActive('/') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
                >
                  3 year
                </button>
            </li>
              
            <li className="px-2">
                <button
                  className={`rounded-full px-4 py-3 ${
                    isActive('/') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
                >
                  4 year
                </button>
            </li> */}
          </ul>
        </div>
      </nav>
  )
}

export default Navyear
