"use client";

// src/pages/Indauth.tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { useState } from "react";

const zschema = z.object({
  userPrompt: z
    .string()
    .trim()
    .email()
    .min(2, { message: "Input cannot be empty or just spaces" }),
});

type FormValues = z.infer<typeof zschema>;

const Indauth = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allowedDomains = ["vvit.net"]; // Add similar domains here, e.g., ["vvit.net", "example.edu"]

  const form = useForm({
    defaultValues: {
      userPrompt: "",
    } as FormValues,
    onSubmit: async ({ value }) => {
      const email = value.userPrompt;
      const domain = email.split("@")[1]?.toLowerCase();

      if (domain && allowedDomains.includes(domain)) {
        console.log("the values are:", value);
        setErrorMessage(null); // Clear any previous error
        form.reset();
      } else {
        setErrorMessage("Your college doesn't have access to sphereai");
      }
    },
    validators: {
      onSubmit: zschema,
    },
  });

  return (
    <main className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0c0c0c]">
      {/* Noise background */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Decorative grid lines and circles */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Vertical lines */}
        <div className="absolute left-[20%] top-0 h-full w-px bg-gradient-to-b from-white/30 via-white/10 to-white/30" />
        <div className="absolute left-[80%] top-0 h-full w-px bg-gradient-to-b from-white/30 via-white/10 to-white/30" />
        {/* Horizontal lines */}
        <div className="absolute left-[20%] top-[15%] h-px w-[60%] bg-gradient-to-r from-white/30 via-white/10 to-white/30" />
        <div className="absolute left-[20%] top-[85%] h-px w-[60%] bg-gradient-to-r from-white/30 via-white/10 to-white/30" />
        {/* Corner circles */}
        <div className="absolute left-[20%] top-[15%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 shadow-lg" />
        <div className="absolute left-[80%] top-[15%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 shadow-lg" />
        <div className="absolute left-[20%] top-[85%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 shadow-lg" />
        <div className="absolute left-[80%] top-[85%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 shadow-lg" />
      </div>

      {/* Main content */}
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-[2em] font-light">
          Enter your{" "}
          <span className="font-serif italic">college mail</span>{" "}
        </h1>
        <form.Field name="userPrompt">
          {({ state, handleBlur, handleChange }) => (
            <>
              <textarea
                className="min-h-[40px] w-1/4 resize-none rounded-lg border-none bg-[#313131] px-2 py-2 text-lg text-[#f7eee3] placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-0"
                value={state.value}
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void form.handleSubmit();
                  }
                }}
              />
              {errorMessage && (
                <p className="mt-2 text-red-500">{errorMessage}</p>
              )}
            </>
          )}
        </form.Field>
      </div>
    </main>
  );
};

export default Indauth;
