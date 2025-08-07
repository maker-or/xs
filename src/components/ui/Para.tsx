import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const Para = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cards = cardsRef.current;

    if (!(container && cards)) return;

    const updateScrollDistance = () => {
      const cardWidth = 400;
      const totalWidth = cardWidth * 7;
      const containerWidth = container.offsetWidth;
      return Math.max(0, totalWidth - containerWidth + 100);
    };

    let scrollDistance = updateScrollDistance();

    // Set up horizontal scroll animation
    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: container,
      start: 'top bottom',
      end: () => `+=${scrollDistance}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: -1,
      pinSpacing: true,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(cards, {
          x: -scrollDistance * progress,
        });
      },
      onRefresh: () => {
        scrollDistance = updateScrollDistance();
      },
    });

    // Improved mouse wheel handling for better reverse scrolling
    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInViewport && !isScrolling) {
        const scrollTrigger = scrollTriggerInstance;
        if (scrollTrigger && scrollTrigger.isActive) {
          // Only prevent default when we're in the pinned section
          if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
            e.preventDefault();
            isScrolling = true;

            const currentProgress = scrollTrigger.progress || 0;
            const delta = e.deltaY > 0 ? 0.02 : -0.02;
            const newProgress = Math.max(
              0,
              Math.min(1, currentProgress + delta)
            );

            // Update scroll position
            scrollTrigger.scroll(
              scrollTrigger.start +
                (scrollTrigger.end - scrollTrigger.start) * newProgress
            );

            setTimeout(() => {
              isScrolling = false;
            }, 50);
          }
        }
      }
    };

    // Add smooth scroll behavior for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const rect = container.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInViewport && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const scrollTrigger = scrollTriggerInstance;
        if (scrollTrigger) {
          const currentProgress = scrollTrigger.progress || 0;
          const delta = e.key === 'ArrowRight' ? 0.1 : -0.1;
          const newProgress = Math.max(0, Math.min(1, currentProgress + delta));

          scrollTrigger.scroll(
            scrollTrigger.start +
              (scrollTrigger.end - scrollTrigger.start) * newProgress
          );
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      scrollTriggerInstance.kill();
    };
  }, []);

  const cardData = [
    {
      title: 'Focus Mode',
      description: 'Submit the quarterly report by Friday',
      svg: (
        <svg
          className="transition-opacity duration-300 group-hover:opacity-80"
          fill="none"
          height="140"
          viewBox="0 0 490 327"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M241.41 314.731L259.516 291.299C264.014 285.478 270.956 282.07 278.312 282.07H355.723C368.841 282.07 379.476 271.435 379.476 258.317V83.1364C379.476 70.8378 369.506 60.8677 357.208 60.8677V60.8677M357.208 60.8677V185.055C357.208 191.98 354.185 198.561 348.932 203.073L241.41 295.431M357.208 60.8677L349.203 35.6215C343.945 19.0388 323.232 13.5472 310.449 25.3468L241.41 89.0747M241.41 295.431V89.0747M241.41 295.431L117.294 274.958C105.822 273.066 97.4062 263.148 97.4062 251.522V89.7251C97.4062 74.7741 111.053 63.5408 125.725 66.4148L241.41 89.0747"
            stroke="url(#paint0_linear_4173_1975)"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_linear_4173_1975"
              x1="97.4062"
              x2="379.476"
              y1="157.365"
              y2="157.365"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: 'Calendar',
      description: 'Plan your Semester',
      svg: (
        <svg
          className="transition-opacity duration-300 group-hover:opacity-80"
          fill="none"
          height="140"
          viewBox="0 0 597 207"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect fill="#0F1010" height="205" rx="20" width="203" x="1" y="1" />
          <rect
            height="205"
            rx="20"
            stroke="url(#paint0_linear_4177_2009)"
            strokeWidth="2"
            width="203"
            x="1"
            y="1"
          />
          <path
            d="M42.5308 145.945L42.5861 138.533L78.5914 106.013C81.6886 103.21 83.735 100.556 84.7305 98.0482C85.7629 95.5041 86.2791 92.8493 86.2791 90.0839C86.2791 86.8024 85.5048 83.8342 83.9562 81.1794C82.4076 78.5246 80.3243 76.4229 77.7064 74.8743C75.0886 73.2888 72.1572 72.4961 68.9125 72.4961C65.5203 72.4961 62.4968 73.3073 59.8421 74.9296C57.1873 76.552 55.0856 78.6906 53.537 81.3453C52.0253 84.0001 51.2878 86.8945 51.3247 90.0286H43.0285C43.0285 85.1984 44.1716 80.866 46.4576 77.0313C48.7437 73.1967 51.8409 70.1916 55.7493 68.0162C59.6577 65.8039 64.0823 64.6977 69.0231 64.6977C73.8533 64.6977 78.1858 65.8407 82.0204 68.1268C85.892 70.376 88.9339 73.4363 91.1462 77.3079C93.3954 81.1425 94.52 85.4197 94.52 90.1393C94.52 93.4577 94.1144 96.389 93.3032 98.9332C92.5289 101.44 91.2937 103.782 89.5976 105.957C87.9384 108.096 85.8182 110.308 83.2372 112.594L51.2694 141.465L49.9973 138.146H94.52V145.945H42.5308ZM133.823 147.659C128.919 147.659 124.494 146.516 120.549 144.23C116.641 141.944 113.544 138.847 111.257 134.938C108.971 130.993 107.828 126.569 107.828 121.665V90.6923C107.828 85.7884 108.971 81.3822 111.257 77.4738C113.544 73.5285 116.641 70.4128 120.549 68.1268C124.494 65.8407 128.919 64.6977 133.823 64.6977C138.727 64.6977 143.133 65.8407 147.042 68.1268C150.987 70.4128 154.102 73.5285 156.389 77.4738C158.675 81.3822 159.818 85.7884 159.818 90.6923V121.665C159.818 126.569 158.675 130.993 156.389 134.938C154.102 138.847 150.987 141.944 147.042 144.23C143.133 146.516 138.727 147.659 133.823 147.659ZM133.823 139.806C137.105 139.806 140.091 139.013 142.783 137.427C145.474 135.805 147.613 133.648 149.199 130.956C150.784 128.265 151.577 125.296 151.577 122.052V90.3052C151.577 87.0236 150.784 84.037 149.199 81.3453C147.613 78.6537 145.474 76.5151 142.783 74.9296C140.091 73.3073 137.105 72.4961 133.823 72.4961C130.541 72.4961 127.555 73.3073 124.863 74.9296C122.172 76.5151 120.033 78.6537 118.447 81.3453C116.862 84.037 116.069 87.0236 116.069 90.3052V122.052C116.069 125.296 116.862 128.265 118.447 130.956C120.033 133.648 122.172 135.805 124.863 137.427C127.555 139.013 130.541 139.806 133.823 139.806Z"
            fill="white"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_linear_4177_2009"
              x1="205"
              x2="69.2906"
              y1="116.955"
              y2="116.568"
            >
              <stop stopColor="#0F0F10" />
              <stop offset="1" stopColor="#A5A5A5" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: 'Task Manager',
      description: 'Organize your daily workflow',
      svg: (
        <svg
          className="transition-opacity duration-300 group-hover:opacity-80"
          fill="none"
          height="140"
          viewBox="0 0 400 300"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            fill="none"
            height="200"
            rx="10"
            stroke="url(#paint_task)"
            strokeWidth="3"
            width="300"
            x="50"
            y="50"
          />
          <circle cx="100" cy="100" fill="url(#paint_task)" r="8" />
          <line
            stroke="url(#paint_task)"
            strokeWidth="2"
            x1="120"
            x2="320"
            y1="100"
            y2="100"
          />
          <circle cx="100" cy="140" fill="url(#paint_task)" r="8" />
          <line
            stroke="url(#paint_task)"
            strokeWidth="2"
            x1="120"
            x2="280"
            y1="140"
            y2="140"
          />
          <circle cx="100" cy="180" fill="url(#paint_task)" r="8" />
          <line
            stroke="url(#paint_task)"
            strokeWidth="2"
            x1="120"
            x2="250"
            y1="180"
            y2="180"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint_task"
              x1="50"
              x2="350"
              y1="150"
              y2="150"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: 'Analytics',
      description: 'Track your productivity metrics',
      svg: (
        <svg
          className="transition-opacity duration-300 group-hover:opacity-80"
          fill="none"
          height="140"
          viewBox="0 0 400 300"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            fill="url(#paint_analytics)"
            height="80"
            width="40"
            x="80"
            y="200"
          />
          <rect
            fill="url(#paint_analytics)"
            height="130"
            width="40"
            x="140"
            y="150"
          />
          <rect
            fill="url(#paint_analytics)"
            height="180"
            width="40"
            x="200"
            y="100"
          />
          <rect
            fill="url(#paint_analytics)"
            height="160"
            width="40"
            x="260"
            y="120"
          />
          <line
            stroke="url(#paint_analytics)"
            strokeWidth="2"
            x1="50"
            x2="350"
            y1="280"
            y2="280"
          />
          <line
            stroke="url(#paint_analytics)"
            strokeWidth="2"
            x1="50"
            x2="50"
            y1="280"
            y2="50"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint_analytics"
              x1="50"
              x2="350"
              y1="150"
              y2="150"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: 'Notes',
      description: 'Capture ideas and thoughts',
      svg: (
        <svg
          className="transition-opacity duration-300 group-hover:opacity-80"
          fill="none"
          height="140"
          viewBox="0 0 400 300"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            fill="none"
            height="180"
            rx="10"
            stroke="url(#paint_notes)"
            strokeWidth="3"
            width="240"
            x="80"
            y="60"
          />
          <line
            stroke="url(#paint_notes)"
            strokeWidth="2"
            x1="110"
            x2="290"
            y1="100"
            y2="100"
          />
          <line
            stroke="url(#paint_notes)"
            strokeWidth="2"
            x1="110"
            x2="270"
            y1="130"
            y2="130"
          />
          <line
            stroke="url(#paint_notes)"
            strokeWidth="2"
            x1="110"
            x2="250"
            y1="160"
            y2="160"
          />
          <line
            stroke="url(#paint_notes)"
            strokeWidth="2"
            x1="110"
            x2="280"
            y1="190"
            y2="190"
          />
          <circle cx="300" cy="80" fill="url(#paint_notes)" r="15" />
          <path
            d="M295 80 L298 83 L305 75"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint_notes"
              x1="80"
              x2="320"
              y1="150"
              y2="150"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: 'Time Tracker',
      description: 'Monitor time spent on tasks',
      svg: (
        <svg
          className="transition-opacity duration-300 group-hover:opacity-80"
          fill="none"
          height="140"
          viewBox="0 0 400 300"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="200"
            cy="150"
            fill="none"
            r="80"
            stroke="url(#paint_time)"
            strokeWidth="4"
          />
          <line
            stroke="url(#paint_time)"
            strokeWidth="3"
            x1="200"
            x2="200"
            y1="150"
            y2="100"
          />
          <line
            stroke="url(#paint_time)"
            strokeWidth="3"
            x1="200"
            x2="240"
            y1="150"
            y2="150"
          />
          <circle cx="200" cy="80" fill="url(#paint_time)" r="4" />
          <circle cx="200" cy="220" fill="url(#paint_time)" r="4" />
          <circle cx="280" cy="150" fill="url(#paint_time)" r="4" />
          <circle cx="120" cy="150" fill="url(#paint_time)" r="4" />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint_time"
              x1="120"
              x2="280"
              y1="150"
              y2="150"
            >
              <stop stopColor="#0F1011" />
              <stop offset="1" stopColor="#FFFCFC" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: 'Goals',
      description: 'Set and achieve your objectives',
      svg: (
        <svg
          className="transition-opacity duration-300 group-hover:opacity-80"
          fill="none"
          height="140"
          viewBox="0 0 400 300"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="200"
            cy="150"
            fill="none"
            r="60"
            stroke="url(#paint_goals)"
            strokeWidth="3"
          />
          <circle
            cx="200"
            cy="150"
            fill="none"
            r="40"
            stroke="url(#paint_goals)"
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="150"
            fill="none"
            r="20"
            stroke="url(#paint_goals)"
            strokeWidth="2"
          />
          <circle cx="200" cy="150" fill="url(#paint_goals)" r="8" />
          <path
            d="M180 130 L195 145 L220 120"
            fill="none"
            stroke="url(#paint_goals)"
            strokeWidth="3"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint_goals"
              x1="140"
              x2="260"
              y1="150"
              y2="150"
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
      <div className="px-4 py-8 md:px-8 lg:px-12">
        <header className="mx-auto mb-12 max-w-7xl text-center md:text-left">
          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl">
            Productivity
          </h1>
          <p className="mt-4 text-gray-400 text-lg md:text-xl">
            Manage your tasks and schedule efficiently
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Scroll vertically to explore all features horizontally • Use ← →
            keys for precise control
          </p>
        </header>
      </div>

      <div
        className="relative flex h-screen w-full items-center overflow-hidden"
        ref={containerRef}
      >
        <div
          className="flex gap-8 px-8 will-change-transform"
          ref={cardsRef}
          style={{ width: 'fit-content' }}
        >
          {cardData.map((card, index) => (
            <div
              className="group flex-shrink-0 transform rounded-xl border-2 border-[#5B5B5C] bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              key={index}
              style={{ width: '380px', height: '500px' }}
            >
              <div className="mb-6">
                <h2 className="mb-3 font-bold font-serif text-3xl text-white">
                  {card.title}
                </h2>
                <p className="text-[#5B5B5C] text-sm md:text-base">
                  {card.description}
                </p>
              </div>
              <div className="flex h-64 items-center justify-center">
                {card.svg}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="fixed right-8 bottom-8 z-10 text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <span>Scroll ↓↑</span>
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-600" />
            <div
              className="h-2 w-2 animate-pulse rounded-full bg-gray-600"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="h-2 w-2 animate-pulse rounded-full bg-gray-600"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
          <span className="text-xs">← → Keys</span>
        </div>
      </div>
    </div>
  );
};

export default Para;
