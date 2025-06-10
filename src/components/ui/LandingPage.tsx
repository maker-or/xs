"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const productivityRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const productivity = productivityRef.current;
    const cards = cardsRef.current;

    if (!hero || !productivity || !cards) return;

    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const getScrollDistance = () => {
      const cardWidth = 400;
      const totalWidth = cardWidth * 7;
      const containerWidth = window.innerWidth;
      return Math.max(0, totalWidth - containerWidth + 200);
    };

    // Hero to Productivity transition
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(hero, { y: -progress * window.innerHeight });
      },
    });

    // Horizontal scroll for cards
    ScrollTrigger.create({
      trigger: productivity,
      start: "top top",
      end: () => `+=${getScrollDistance()}`,
      scrub: 1,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const scrollDistance = getScrollDistance();
        gsap.set(cards, { x: -progress * scrollDistance });
      },
      onRefresh: () => {
        // Recalculate on window resize
      },
    });

    // Mouse wheel enhancement for horizontal scroll
    const handleWheel = (e: WheelEvent) => {
      const productivityRect = productivity.getBoundingClientRect();
      const isProductivityActive =
        productivityRect.top <= 0 &&
        productivityRect.bottom >= window.innerHeight;

      if (isProductivityActive) {
        e.preventDefault();
        const scrollAmount = e.deltaY * 2;
        window.scrollBy({ top: scrollAmount, behavior: "auto" });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const cardData = [
    {
      title: "Focus Mode",
      description: "Submit the quarterly report by Friday",
      svg: (
        <svg
          width="200"
          height="140"
          viewBox="0 0 490 327"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-300 group-hover:opacity-80"
        >
          <path
            d="M241.41 314.731L259.516 291.299C264.014 285.478 270.956 282.07 278.312 282.07H355.723C368.841 282.07 379.476 271.435 379.476 258.317V83.1364C379.476 70.8378 369.506 60.8677 357.208 60.8677V60.8677M357.208 60.8677V185.055C357.208 191.98 354.185 198.561 348.932 203.073L241.41 295.431M357.208 60.8677L349.203 35.6215C343.945 19.0388 323.232 13.5472 310.449 25.3468L241.41 89.0747M241.41 295.431V89.0747M241.41 295.431L117.294 274.958C105.822 273.066 97.4062 263.148 97.4062 251.522V89.7251C97.4062 74.7741 111.053 63.5408 125.725 66.4148L241.41 89.0747"
            stroke="url(#paint0_linear_4173_1975)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear_4173_1975"
              x1="97.4062"
              y1="157.365"
              x2="379.476"
              y2="157.365"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "Calendar",
      description: "Plan your Semester",
      svg: (
        <svg
          width="200"
          height="140"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-300 group-hover:opacity-80"
        >
          <rect
            x="50"
            y="50"
            width="300"
            height="200"
            rx="10"
            stroke="url(#paint_calendar)"
            strokeWidth="3"
            fill="none"
          />
          <line
            x1="80"
            y1="90"
            x2="320"
            y2="90"
            stroke="url(#paint_calendar)"
            strokeWidth="2"
          />
          <line
            x1="80"
            y1="130"
            x2="320"
            y2="130"
            stroke="url(#paint_calendar)"
            strokeWidth="2"
          />
          <line
            x1="80"
            y1="170"
            x2="320"
            y2="170"
            stroke="url(#paint_calendar)"
            strokeWidth="2"
          />
          <line
            x1="80"
            y1="210"
            x2="320"
            y2="210"
            stroke="url(#paint_calendar)"
            strokeWidth="2"
          />
          <text
            x="200"
            y="80"
            textAnchor="middle"
            fill="url(#paint_calendar)"
            fontSize="16"
          >
            Calendar
          </text>
          <defs>
            <linearGradient
              id="paint_calendar"
              x1="50"
              y1="150"
              x2="350"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "Task Manager",
      description: "Organize your daily workflow",
      svg: (
        <svg
          width="200"
          height="140"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-300 group-hover:opacity-80"
        >
          <rect
            x="50"
            y="50"
            width="300"
            height="200"
            rx="10"
            stroke="url(#paint_task)"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="100" cy="100" r="8" fill="url(#paint_task)" />
          <line
            x1="120"
            y1="100"
            x2="320"
            y2="100"
            stroke="url(#paint_task)"
            strokeWidth="2"
          />
          <circle cx="100" cy="140" r="8" fill="url(#paint_task)" />
          <line
            x1="120"
            y1="140"
            x2="280"
            y2="140"
            stroke="url(#paint_task)"
            strokeWidth="2"
          />
          <circle cx="100" cy="180" r="8" fill="url(#paint_task)" />
          <line
            x1="120"
            y1="180"
            x2="250"
            y2="180"
            stroke="url(#paint_task)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient
              id="paint_task"
              x1="50"
              y1="150"
              x2="350"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "Analytics",
      description: "Track your productivity metrics",
      svg: (
        <svg
          width="200"
          height="140"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-300 group-hover:opacity-80"
        >
          <rect
            x="80"
            y="200"
            width="40"
            height="80"
            fill="url(#paint_analytics)"
          />
          <rect
            x="140"
            y="150"
            width="40"
            height="130"
            fill="url(#paint_analytics)"
          />
          <rect
            x="200"
            y="100"
            width="40"
            height="180"
            fill="url(#paint_analytics)"
          />
          <rect
            x="260"
            y="120"
            width="40"
            height="160"
            fill="url(#paint_analytics)"
          />
          <line
            x1="50"
            y1="280"
            x2="350"
            y2="280"
            stroke="url(#paint_analytics)"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="280"
            x2="50"
            y2="50"
            stroke="url(#paint_analytics)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient
              id="paint_analytics"
              x1="50"
              y1="150"
              x2="350"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "Notes",
      description: "Capture ideas and thoughts",
      svg: (
        <svg
          width="200"
          height="140"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-300 group-hover:opacity-80"
        >
          <rect
            x="80"
            y="60"
            width="240"
            height="180"
            rx="10"
            stroke="url(#paint_notes)"
            strokeWidth="3"
            fill="none"
          />
          <line
            x1="110"
            y1="100"
            x2="290"
            y2="100"
            stroke="url(#paint_notes)"
            strokeWidth="2"
          />
          <line
            x1="110"
            y1="130"
            x2="270"
            y2="130"
            stroke="url(#paint_notes)"
            strokeWidth="2"
          />
          <line
            x1="110"
            y1="160"
            x2="250"
            y2="160"
            stroke="url(#paint_notes)"
            strokeWidth="2"
          />
          <line
            x1="110"
            y1="190"
            x2="280"
            y2="190"
            stroke="url(#paint_notes)"
            strokeWidth="2"
          />
          <circle cx="300" cy="80" r="15" fill="url(#paint_notes)" />
          <path
            d="M295 80 L298 83 L305 75"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient
              id="paint_notes"
              x1="80"
              y1="150"
              x2="320"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "Time Tracker",
      description: "Monitor time spent on tasks",
      svg: (
        <svg
          width="200"
          height="140"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-300 group-hover:opacity-80"
        >
          <circle
            cx="200"
            cy="150"
            r="80"
            stroke="url(#paint_time)"
            strokeWidth="4"
            fill="none"
          />
          <line
            x1="200"
            y1="150"
            x2="200"
            y2="100"
            stroke="url(#paint_time)"
            strokeWidth="3"
          />
          <line
            x1="200"
            y1="150"
            x2="240"
            y2="150"
            stroke="url(#paint_time)"
            strokeWidth="3"
          />
          <circle cx="200" cy="80" r="4" fill="url(#paint_time)" />
          <circle cx="200" cy="220" r="4" fill="url(#paint_time)" />
          <circle cx="280" cy="150" r="4" fill="url(#paint_time)" />
          <circle cx="120" cy="150" r="4" fill="url(#paint_time)" />
          <defs>
            <linearGradient
              id="paint_time"
              x1="120"
              y1="150"
              x2="280"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "Goals",
      description: "Set and achieve your objectives",
      svg: (
        <svg
          width="200"
          height="140"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-300 group-hover:opacity-80"
        >
          <circle
            cx="200"
            cy="150"
            r="60"
            stroke="url(#paint_goals)"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="200"
            cy="150"
            r="40"
            stroke="url(#paint_goals)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="200"
            cy="150"
            r="20"
            stroke="url(#paint_goals)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="200" cy="150" r="8" fill="url(#paint_goals)" />
          <path
            d="M180 130 L195 145 L220 120"
            stroke="url(#paint_goals)"
            strokeWidth="3"
            fill="none"
          />
          <defs>
            <linearGradient
              id="paint_goals"
              x1="140"
              y1="150"
              x2="260"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full bg-black text-white">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="flex h-screen w-full flex-col items-center justify-center"
      >
        <div className="flex items-center justify-center text-center leading-none tracking-tight">
          <h1 className="text-[5em] text-white">
            New <span className="font-serif italic">knowledge</span> layer{" "}
            <br></br> for your{" "}
            <span className="font-serif italic">collage</span>
          </h1>
        </div>

        <div className="flex gap-3 p-3 text-xl">
          <button className="rounded-lg border border-[#08090A] bg-black px-6 py-3 shadow-[inset_2.71375px_2.71375px_12.6965px_rgba(227,194,194,0.25)] backdrop-blur-[27.3425px]">
            Sign in
          </button>
          <button>Contact us</button>
        </div>
      </div>

      {/* Productivity Section */}
      <div ref={productivityRef} className="h-[100svh] w-full bg-black">
        <div className="py-12 md:px-8 lg:px-12">
          <header className="mx-auto mb-8 max-w-7xl text-center md:text-left">
            <h1 className="text-4xl font-medium md:text-5xl lg:text-6xl">
              Productivity
            </h1>
          </header>
        </div>

        <div className="flex h-96 w-full items-center overflow-hidden">
          <div
            ref={cardsRef}
            className="flex gap-8 px-8 will-change-transform"
            style={{ width: "fit-content" }}
          >
            {cardData.map((card, index) => (
              <div
                key={index}
                className="group flex-shrink-0 transform rounded-xl border-2 border-[#5B5B5C] p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                style={{ width: "380px", height: "350px" }}
              >
                <div className="mb-4">
                  <h2 className="mb-2 font-serif text-2xl font-bold text-white">
                    {card.title}
                  </h2>
                  <p className="text-sm text-[#5B5B5C]">{card.description}</p>
                </div>
                <div className="flex h-48 items-center justify-center">
                  {card.svg}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="fixed bottom-8 right-8 z-10 text-sm text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <span>Scroll ↓</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
