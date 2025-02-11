'use client'

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from "~/components/ui/Header";

const First = () => {
    // Explicitly type the ref as an array of HTMLSpanElement (or null)
    const boxRef = useRef<(HTMLSpanElement | null)[]>([null, null]);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Loop over each referenced element and animate it individually.
        const animations = boxRef.current.map((box) => {
            if (!box) return null; // Skip if box is null

            return gsap.fromTo(
                box,
                {
                    scale: 0,
                    opacity: 0,
                    transformOrigin: "center center",
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: box,
                        start: "top 80%", // starts when the box hits 80% of the viewport height
                        end: "top 20%",   // ends when the box reaches 20%
                        markers: false,
                    },
                }
            );
        });

        // Cleanup animations when component unmounts
        return () => {
            animations.forEach((animation) => {
                if (animation) {
                    if (animation.scrollTrigger) {
                        animation.scrollTrigger.kill();
                    }
                    animation.kill();
                }
            });
        };
    }, []);

    return (
        <div className="min-w-[100svw] min-h-[100svh] relative flex  items-center justify-center  bg-[#0c0c0c]">
           
            <h1 className="text-center text-[#f7eee3] font-serif text-[8em] leading-[1]">
                Your College
                <span
                    ref={(el) => {
                        if (el) {
                            boxRef.current[0] = el;
                        }
                    }}
                    className="absolute -translate-x-[5rem] -translate-y-[5rem] rotate-[6deg]"
                >
                    👍
                </span>
                <br />
                <span
                    ref={(el) => {
                        if (el) {
                            boxRef.current[1] = el;
                        }
                    }}
                    className="absolute -translate-x-[3rem] translate-y-[7rem] "
                >
                    ❤️
                </span>
                Your AI
            </h1>
        </div>
    );
}

export default First