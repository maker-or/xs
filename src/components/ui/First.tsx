'use client'

import React, { useRef, useEffect, useState, Suspense, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

// Create a lazy loaded version of the shader component
const LazyShaderGradient = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const shaderRef = useRef(null);
    
    useEffect(() => {
        // Create an Intersection Observer to detect when component is in viewport
        const observer = new IntersectionObserver((entries) => {
            // Fixed TypeScript error by checking each entry directly
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, {
            rootMargin: '200px 0px', // Load earlier when approaching viewport
            threshold: 0.01,
        });
        
        if (shaderRef.current) {
            observer.observe(shaderRef.current);
        }
        
        return () => {
            if (shaderRef.current) {
                observer.unobserve(shaderRef.current);
            }
        };
    }, []);
    
    // Set loaded state after a delay to simulate loading completion
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsLoaded(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);
    
    return (
        <div ref={shaderRef} className="absolute inset-0 z-0">
            {/* Show loading placeholder while shader is initializing */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#73bfc4]/30 to-[#ff810a]/30 flex items-center justify-center">
                    <div className="animate-pulse text-white/50">Loading visual...</div>
                </div>
            )}
            
            {/* Only render the shader when visible */}
            {isVisible && (
                <ShaderGradientCanvas
                    style={{
                        width: '100%',
                        height: '100%',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.5s ease-in',
                    }}
                    pixelDensity={0.8} // Reduced for better performance
                    pointerEvents='none'
                >
                    <ShaderGradient
                        animate='off'
                        type='sphere'
                        wireframe={false}
                        shader='defaults'
                        uTime={0}
                        uSpeed={0.3}
                        uStrength={0.3}
                        uDensity={0.8}
                        uFrequency={5.5}
                        uAmplitude={3.2}
                        positionX={-0.1}
                        positionY={0}
                        positionZ={0}
                        rotationX={0}
                        rotationY={130}
                        rotationZ={70}
                        color1='#73bfc4'
                        color2='#ff810a'
                        color3='#8da0ce'
                        reflection={0.4}
                        cAzimuthAngle={270}
                        cPolarAngle={180}
                        cDistance={0.5}
                        cameraZoom={15.1}
                        lightType='env'
                        brightness={0.8}
                        envPreset='city'
                        grain='on'
                        toggleAxis={false}
                        zoomOut={false}
                        enableTransition={true}
                    />
                </ShaderGradientCanvas>
            )}
        </div>
    );
};

const First = () => {
    const boxRef = useRef<(HTMLSpanElement | null)[]>([null]);

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
                        start: "top 80%",
                        end: "top 20%",
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
        <div className="min-w-[100svw] min-h-[100svh] relative flex flex-col items-start justify-end bg-[#0c0c0c] p-8">
            {/* Shader with lazy loading and persistence */}
            <Suspense fallback={
                <div className="absolute inset-0 bg-gradient-to-br from-[#73bfc4]/30 to-[#ff810a]/30" />
            }>
                <LazyShaderGradient />
            </Suspense>
            
            {/* Content - with z-index to appear above the gradient */}
            <div className="text-[#ffffff] text-[15em] font-bold flex items-center relative z-10">
                Sphere <span className='text-[#FF5E00]'>.</span>
            </div>
        </div>
    );
}

export default First