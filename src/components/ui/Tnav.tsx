'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const Tnav = () => {
  const pathName = usePathname();

  // Function to check if the current path matches the link's path
  const isActive = (path: string) => {
    if (path === '/teacher') {
      // For /teacher, only match exact path, not /teacher/test
      return pathName === '/teacher';
    }
    if (path === 'teacher/test') {
      // For teacher/test, match /teacher/test
      return pathName === '/teacher/test' || pathName.startsWith('/teacher/test/');
    }
    return pathName === path || pathName.startsWith(path + '/');
  };


  return (
    <nav className=" font-serif">
      <div className="items-center flex">
        <ul className="inline-flex flex-row items-center mx-auto bg-[#1f1f1f] py-2.5 px-1 rounded-full border border-[#f7eee332] text-[#646464] text-[1.2rem] font-medium">
          <li className="px-2">
            <Link href="/ai" target="_blank"  prefetch={true}>
              <Image src="https://utfs.io/f/orc4evzyNtrg2K2riNsBQGN8KriC9uPWHlnIoFkxOYgeDpE7" alt="logo" width={100} height={50} decoding="sync"  priority loading="eager"/>
            </Link>
          </li>


          <li className="px-2">
            <Link href="/teacher/test"  prefetch={true}   >
              <button
                className={`rounded-full px-5 py-3 ${isActive('teacher/test') ? 'bg-[#FF5E00] text-[#f7eee3]' : ''
                  }`}
              >
                Test
              </button>
            </Link>
          </li>



          <li className="px-2">
            <Link href="/teacher" prefetch={true} rel="preload">
              <button
                className={`rounded-full px-4 py-3 ${isActive('/teacher') ? 'bg-[#FF5E00] text-[#f7eee3]' : ''
                  }`}
              >
                upload
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
export default Tnav;
