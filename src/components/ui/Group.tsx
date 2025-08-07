'use client';
import Image from 'next/image';
import React from 'react';

const Group = () => {
  return (
    <div className="h-full w-full overflow-hidden">
      <h1 className="absolute z-0 text-[#fff3] text-[20rem]">
        <Image
          alt="Sphere logo"
          decoding="sync"
          layout="fill"
          loading="eager"
          objectFit="cover"
          priority
          src="https://utfs.io/f/orc4evzyNtrg2K2riNsBQGN8KriC9uPWHlnIoFkxOYgeDpE7"
        />
      </h1>
      <div className="relative z-10"></div>
    </div>
  );
};

export default Group;
