"use client";

import React from "react";

const First = () => {
  return (
    <div className="flex h-[100svh] w-[100svw] flex-col items-center justify-center overflow-hidden bg-[#000000]">
      <div className="flex items-center justify-center text-center leading-none tracking-tight">
        <h1 className="text-[5em] text-white">
          New <span className="font-serif italic">knowledge</span> layer{" "}
          <br></br> for your <span className="font-serif italic">collage</span>
        </h1>
      </div>

      <div className="flex gap-3 p-3 text-xl">
        <button className="rounded-lg border border-[#08090A] bg-black px-6 py-3 shadow-[inset_2.71375px_2.71375px_12.6965px_rgba(227,194,194,0.25)] backdrop-blur-[27.3425px]">
          Sign in
        </button>

        <button>Contact us</button>
      </div>
    </div>
  );
};

export default First;
