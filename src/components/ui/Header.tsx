import React from "react";
import { SignInButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <main className="flex justify-center items-center ">
      <nav className="bg-[#1a1a1a] gap-2 border-2 border-[#444343] rounded-full z-[99999] fixed top-0  m-2 p-2  flex justify-center item-center">
        <button>
          <img src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrg2K2riNsBQGN8KriC9uPWHlnIoFkxOYgeDpE7" alt="" width={100} height={100}/>
        </button>
        <div className="p-3 bg-[#f7eee3] rounded-full flex items-center justify-center text-[#0c0c0c]"> <SignInButton/></div>
      </nav>
    </main>
  );
};
export default Header;
