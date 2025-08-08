// Knowledge.tsx

'use client';

import React from 'react';

const Knowledge = () => {
  return (
    <section className="flex min-h-[100svh] w-full flex-col items-center justify-center bg-[#0c0c0c] px-4 py-16 text-white">
      <h1 className="flex justify-center text-center font-semibold leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
        What is{' '}
        <span className="ml-2 font-serif text-[#FF5E00] italic">sphereai</span>
      </h1>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 p-2 text-sm sm:text-base">
        <span className="flex items-center gap-2">
          <span className="text-lg font-medium sm:text-2xl">Knowledge base</span>
          <svg
            fill="none"
            height="24"
            viewBox="0 0 35 36"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <title>Star icon</title>
            <path
              d="M17.5 0.5L19.3082 13.6347L29.8744 5.62563L21.8653 16.1918L35 18L21.8653 19.8082L29.8744 30.3744L19.3082 22.3653L17.5 35.5L15.6918 22.3653L5.12563 30.3744L13.1347 19.8082L0 18L13.1347 16.1918L5.12563 5.62563L15.6918 13.6347L17.5 0.5Z"
              fill="#D9D9D9"
            />
          </svg>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-lg font-medium sm:text-2xl">Intelligences</span>
          <svg
            fill="none"
            height="24"
            viewBox="0 0 35 36"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <title>Star icon</title>
            <path
              d="M17.5 0.5L19.3082 13.6347L29.8744 5.62563L21.8653 16.1918L35 18L21.8653 19.8082L29.8744 30.3744L19.3082 22.3653L17.5 35.5L15.6918 22.3653L5.12563 30.3744L13.1347 19.8082L0 18L13.1347 16.1918L5.12563 5.62563L15.6918 13.6347L17.5 0.5Z"
              fill="#D9D9D9"
            />
          </svg>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-lg font-medium sm:text-2xl">Productivity tools</span>
          <svg
            fill="none"
            height="24"
            viewBox="0 0 35 36"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <title>Star icon</title>
            <path
              d="M17.5 0.5L19.3082 13.6347L29.8744 5.62563L21.8653 16.1918L35 18L21.8653 19.8082L29.8744 30.3744L19.3082 22.3653L17.5 35.5L15.6918 22.3653L5.12563 30.3744L13.1347 19.8082L0 18L13.1347 16.1918L5.12563 5.62563L15.6918 13.6347L17.5 0.5Z"
              fill="#D9D9D9"
            />
          </svg>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-lg font-medium sm:text-2xl">Personalized learning</span>
          <svg
            fill="none"
            height="24"
            viewBox="0 0 35 36"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <title>Star icon</title>
            <path
              d="M17.5 0.5L19.3082 13.6347L29.8744 5.62563L21.8653 16.1918L35 18L21.8653 19.8082L29.8744 30.3744L19.3082 22.3653L17.5 35.5L15.6918 22.3653L5.12563 30.3744L13.1347 19.8082L0 18L13.1347 16.1918L5.12563 5.62563L15.6918 13.6347L17.5 0.5Z"
              fill="#D9D9D9"
            />
          </svg>
        </span>
      </div>

      <div className="mt-8 flex w-full items-center justify-center font-light">
        <div className="w-full max-w-4xl p-2 sm:p-3">
          <p className="mx-auto text-pretty break-words text-center text-lg leading-relaxed sm:text-2xl md:text-3xl">
            Sphereai is a next-generation knowledge management system dedicated to
            transforming productivity for students and teachers. By harnessing the
            power of GenAI, Sphereai reimagines the way knowledge is created,
            shared, and experienced—empowering educators and learners to connect,
            collaborate, and achieve more together.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Knowledge;
