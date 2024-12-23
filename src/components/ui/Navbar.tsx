'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const Navbar = () => {
  const pathName = usePathname();

  // Function to check if the current path matches the link's path
  const isActive = (path: string) => pathName === path;

  return (
    <nav className="py-5 font-serif">
      <div className="items-center flex">
        <ul className="inline-flex flex-row items-center mx-auto bg-[#1f1f1f] py-2.5 px-1 rounded-full border text-[#646464] text-[1.2rem] font-medium">
          <li className="px-2">
            <Link href="/ai" target="_blank">
              <Image src="https://utfs.io/f/orc4evzyNtrg2K2riNsBQGN8KriC9uPWHlnIoFkxOYgeDpE7" alt="logo" width={100} height={50} />
            </Link>
          </li>


          <li className="px-2">
            <Link href="/repo">
              <button
                className={`rounded-full px-4 py-3 ${isActive('/repo') ? 'bg-[#FF5E00] text-[#f7eee3]' : ''
                  }`}
              >
                Repos
              </button>
            </Link>
          </li>

          <li className="px-2">
            <Link href="/">
              <button
                className={`rounded-full px-4 py-3 ${isActive('/') ? 'bg-[#FF5E00] text-[#0c0c0c]' : ''
                  }`}
              >
                Space
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
export default Navbar;
