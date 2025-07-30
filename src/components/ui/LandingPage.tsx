"use client";

import React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StackedLayers3D from "./stackedLayers3D";
import Knowledge from "./Knowledge";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  return (
    <div className="w-full bg-[#0c0c0c] text-white">
      {/* Hero Section */}

      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="flex items-center justify-center text-center leading-none tracking-tight">
          <h1 className="text-[5em] text-white">
            New <span className="font-serif italic">knowledge</span> layer{" "}
            <br></br> for your{" "}
            <span className="font-serif italic">collage</span>
          </h1>
        </div>

        {/* <div className="flex gap-3 p-3 text-xl">
          <button className="rounded-xl bg-[#151715] px-6 py-3 shadow-[inset_2.71375px_2.71375px_12.6965px_rgba(227,194,194,0.25)] backdrop-blur-[27.3425px]">
            <Link href="/waitlist">Waitlist</Link>
          </button>

          <button>Contact us</button>
        </div> */}
      </div>
      <div className="h-screen w-full items-center justify-center">
        <StackedLayers3D />
      </div>
      <div className="h-screen w-full items-center justify-center">
        <Knowledge />
      </div>
    </div>
  );
};

export default LandingPage;
