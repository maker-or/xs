// "use client";

// import React from "react";
// import StackedLayers3D from "../../components/ui/stackedLayers3D";

// export default function TestLayersPage() {
//   return (
//     <div className="min-h-screen bg-gray-900">
//       {/* Header section to enable scrolling */}
//       <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
//         <h1 className="mb-8 text-center text-6xl font-bold text-white">
//           GSAP Animated Architecture
//         </h1>
//         <p className="max-w-2xl text-center text-xl text-gray-300">
//           Scroll down to see the layered architecture animation powered by GSAP
//           and ScrollTrigger. Each layer will appear sequentially as you scroll.
//         </p>
//         <div className="mt-8 animate-bounce">
//           <svg
//             className="h-6 w-6 text-white"
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
//           </svg>
//         </div>
//       </div>

//       {/* Main animation component */}
//       <StackedLayers3D />

//       {/* Footer section */}
//       <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-t from-gray-900 to-gray-800 px-4">
//         <h2 className="mb-6 text-center text-4xl font-bold text-white">
//           Animation Features
//         </h2>
//         <div className="max-w-4xl space-y-6 text-center text-lg text-gray-300">
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//             <div className="rounded-lg bg-gray-800 p-6">
//               <h3 className="mb-3 text-xl font-semibold text-orange-400">
//                 Scroll-Triggered
//               </h3>
//               <p>
//                 Animations are triggered by scroll position using GSAP's
//                 ScrollTrigger plugin for smooth, responsive interactions.
//               </p>
//             </div>
//             <div className="rounded-lg bg-gray-800 p-6">
//               <h3 className="mb-3 text-xl font-semibold text-orange-400">
//                 Layered Animation
//               </h3>
//               <p>
//                 Each layer appears sequentially from bottom to top, creating a
//                 building effect that visualizes the architecture layers.
//               </p>
//             </div>
//             <div className="rounded-lg bg-gray-800 p-6">
//               <h3 className="mb-3 text-xl font-semibold text-orange-400">
//                 Smooth Transitions
//               </h3>
//               <p>
//                 Uses advanced easing functions and timeline animations for
//                 professional-quality motion design.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
