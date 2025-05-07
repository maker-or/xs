import React from "react";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <main className="flex justify-center items-center ">
      <nav className="bg-[#1F1F1F] gap-2 border border-[#4a4a4a]  rounded-full z-[99999] fixed top-0  m-2 p-2  flex justify-center item-center">
        <button>

          <Image
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrg2K2riNsBQGN8KriC9uPWHlnIoFkxOYgeDpE7"
            width={100}
            height={100}
            alt="logo"
          />

        </button>
        <div className="p-3 bg-[#FF5E00]   rounded-full flex items-center justify-center text-[#0c0c0c]">
          <Link href="/role-selection">Sign In</Link>
        </div>
      </nav>
    </main>
  );
};
export default Header;
