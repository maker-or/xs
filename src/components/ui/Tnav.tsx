'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

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
      return (
        pathName === '/teacher/test' || pathName.startsWith('/teacher/test/')
      );
    }
    return pathName === path || pathName.startsWith(path + '/');
  };

  return (
    <nav className=" font-serif">
      <div className="flex items-center">
        <ul className="mx-auto inline-flex flex-row items-center rounded-full border border-[#f7eee332] bg-[#1f1f1f] px-1 py-2.5 font-medium text-[#646464] text-[1.2rem]">
          <li className="px-2">
            <Link href="/ai" prefetch={true} target="_blank">
              <Image
                alt="logo"
                decoding="sync"
                height={50}
                loading="eager"
                priority
                src="https://utfs.io/f/orc4evzyNtrg2K2riNsBQGN8KriC9uPWHlnIoFkxOYgeDpE7"
                width={100}
              />
            </Link>
          </li>

          <li className="px-2">
            <Link href="/teacher/test" prefetch={true}>
              <button
                className={`rounded-full px-5 py-3 ${
                  isActive('teacher/test') ? 'bg-[#FF5E00] text-[#f7eee3]' : ''
                }`}
              >
                Test
              </button>
            </Link>
          </li>

          <li className="px-2">
            <Link href="/teacher" prefetch={true} rel="preload">
              <button
                className={`rounded-full px-4 py-3 ${
                  isActive('/teacher') ? 'bg-[#FF5E00] text-[#f7eee3]' : ''
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
