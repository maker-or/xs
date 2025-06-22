// Knowledge.tsx

"use client";

import React from "react";

const Knowledge = () => {
  return (
    <div className="flex min-h-[100svh] min-w-[100svw] flex-col items-center justify-center bg-[#0c0c0c] py-20 text-white">
      <h1 className="flex justify-center text-center text-[4em]">
        What is{" "}
        <span className="ml-2 font-serif italic text-[#FF5E00]">sphereai</span>
      </h1>

      <div className="mt-8 flex items-center justify-center gap-3 p-3">
        <h1 className="text-2xl">Knowledge base</h1>
        <svg
          width="24"
          height="24"
          viewBox="0 0 35 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 0.5L19.3082 13.6347L29.8744 5.62563L21.8653 16.1918L35 18L21.8653 19.8082L29.8744 30.3744L19.3082 22.3653L17.5 35.5L15.6918 22.3653L5.12563 30.3744L13.1347 19.8082L0 18L13.1347 16.1918L5.12563 5.62563L15.6918 13.6347L17.5 0.5Z"
            fill="#D9D9D9"
          />
        </svg>
        <h1 className="text-2xl">Intelligences</h1>
        <svg
          width="24"
          height="24"
          viewBox="0 0 35 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 0.5L19.3082 13.6347L29.8744 5.62563L21.8653 16.1918L35 18L21.8653 19.8082L29.8744 30.3744L19.3082 22.3653L17.5 35.5L15.6918 22.3653L5.12563 30.3744L13.1347 19.8082L0 18L13.1347 16.1918L5.12563 5.62563L15.6918 13.6347L17.5 0.5Z"
            fill="#D9D9D9"
          />
        </svg>
        <h1 className="text-2xl">Productivity tools</h1>
        <svg
          width="24"
          height="24"
          viewBox="0 0 35 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 0.5L19.3082 13.6347L29.8744 5.62563L21.8653 16.1918L35 18L21.8653 19.8082L29.8744 30.3744L19.3082 22.3653L17.5 35.5L15.6918 22.3653L5.12563 30.3744L13.1347 19.8082L0 18L13.1347 16.1918L5.12563 5.62563L15.6918 13.6347L17.5 0.5Z"
            fill="#D9D9D9"
          />
        </svg>
        <h1 className="text-2xl">Personalized learning</h1>
      </div>

      <div className="mt-8 flex w-full items-center justify-center font-light">
        <div className="w-full max-w-2xl p-3">
          <p className="break-words text-center text-4xl leading-snug">
            Sphereai is a knowledge management system that focuses on two
            things:
            <br />
            improving the productivity of students and teachers and reimagining
            how knowledge is shared between students and teachers with the help
            of GenAI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
