import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Header = () => {
  return (
    <main className="flex items-center justify-center">
      <nav className="item-center fixed top-0 z-[99999] m-2 flex justify-center gap-2 rounded-full border border-white/20 bg-black/40 p-2 shadow-lg backdrop-blur-md">
        <button>
          <Image
            alt="logo"
            height={100}
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrg2K2riNsBQGN8KriC9uPWHlnIoFkxOYgeDpE7"
            width={100}
          />
        </button>
        <div className="flex items-center justify-center rounded-full bg-[#FF5E00] p-3 text-[#000000]">
          <Link href="/waitlist">waitlist</Link>
        </div>
      </nav>
    </main>
  );
};
export default Header;
