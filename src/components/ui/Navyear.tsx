'use client';
import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


const Navyear = () => {
  const pathName = usePathname();

  // Function to check if the current path matches the link's path
  const isActive = (path: string) => pathName === path;
    return (
      <nav className="py-5">
        <div   className="items-center flex">
          <ul className="inline-flex flex-row items-center mx-auto  py-3 px-4 rounded-full border text-[#646464] text-[1.2rem] font-medium">  

             <li className="px-2">
              <Link href="/1 year">
                <button
                  className={`rounded-full px-4 py-3 ${
                    isActive('/Forum') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
                >
                  1 year
                </button>
              </Link>
            </li> 
  
            <li className="px-2">
              <Link href="/2 year">
                <button
                  className={`rounded-full px-4 py-3 ${
                    isActive('/Repos') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
                >
                  2 year
                </button>
              </Link>
            </li>
  
            <li className="px-2">
              <Link href="/3 year">
                <button
                  className={`rounded-full px-4 py-3 ${
                    isActive('/') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
                >
                  3 year
                </button>
              </Link>
            </li>
              
            <li className="px-2">
              <Link href="/4 year">
                <button
                  className={`rounded-full px-4 py-3 ${
                    isActive('/') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
                >
                  4 year
                </button>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
  )
}

export default Navyear
