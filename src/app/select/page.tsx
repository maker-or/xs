"use client";

import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  return (
    <main className="relative h-[100svh] w-[100svw] overflow-hidden bg-[#0c0c0c]">
      {/* Noise background */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Overlay grid and circles */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Vertical lines */}
        <div className="absolute left-[20%] top-0 h-full w-px bg-white/20" />
        <div className="absolute left-[80%] top-0 h-full w-px bg-white/20" />
        {/* Horizontal lines */}
        <div className="absolute left-[20%] top-[9%] h-px w-[60%] bg-white/20" />
        <div className="absolute left-[20%] top-[90%] h-px w-[60%] bg-white/20" />
        {/* Corner circles */}
        <div className="absolute left-[20%] top-[9%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        <div className="absolute left-[80%] top-[9%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        <div className="absolute left-[20%] top-[90%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        <div className="absolute left-[80%] top-[90%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
      </div>

      {/* Main content */}
      <div className="relative z-30 flex h-full w-full items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <h1 className="text-balance p-2 text-[3em] font-light tracking-tighter text-white">
            Continue <span className="font-serif italic">with</span>
          </h1>
          <div className="flex w-full flex-col items-center gap-2">
            <Button
              className="w-1/4 bg-[#313131] p-6 text-[1.2em] font-light hover:bg-[#f7eee3] hover:text-[#313131]"
              onClick={() => {
                router.push("/indauth");
              }}
            >
              Google
            </Button>
            <Button
              className="w-1/4 bg-[#313131] p-6 text-[1.2em] font-light hover:bg-[#f7eee3] hover:text-[#313131]"
              onClick={() => {
                router.push("/signin");
              }}
            >
              Collage account
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
