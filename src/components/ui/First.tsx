'use client'

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

const First = () => {
    const floatingBoxesRef = useRef<(HTMLDivElement | null)[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    
    // Handle window resize and initial check
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        // Check on mount
        checkIfMobile();
        
        // Add event listener for window resize
        window.addEventListener('resize', checkIfMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Updated floating boxes with responsive sizing and positioning
    const floatingBoxes = [
        { 
            size: { desktop: 120, mobile: 80 }, 
            left: { desktop: '15%', mobile: '5%' }, 
            top: { desktop: '20%', mobile: '15%' }, 
            rotation: -15, 
            imagePath: 'https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgPaiz9ylVUBCkXwNQOpI5g7lzEM8eoKYtH6i3',
            alt: 'Abstract design' 
        },
        { 
            size: { desktop: 160, mobile: 100 }, 
            left: { desktop: '75%', mobile: '65%' }, 
            top: { desktop: '25%', mobile: '20%' }, 
            rotation: 12, 
            imagePath: 'https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgtZ08Ke5EmkbQ2MF9PAfO5i3logRYxzSHVZdu',
            alt: 'Creative concept' 
        },
        { 
            size: { desktop: 100, mobile: 70 }, 
            left: { desktop: '65%', mobile: '55%' }, 
            top: { desktop: '75%', mobile: '70%' }, 
            rotation: -8, 
            imagePath: 'https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrghOpcO0QsgOX2TlA3KWitnEIxzF1juPoVe60Z',
            alt: 'Design inspiration' 
        },
    ];

    return (
        <div className="min-w-[100svw] min-h-[100svh] flex flex-col items-center justify-end bg-[#000000] overflow-hidden">
            <div className="relative flex flex-col tracking-tighter leading-none text-[2.5em] md:text-[4em] lg:text-[6em] text-black items-center justify-center w-[99svw] h-[100svh] bg-[#f7eee3] rounded-b-[40px] md:rounded-b-[70px] lg:rounded-b-[100px]">
                {/* Floating boxes with images */}
                {floatingBoxes.map((box, index) => (
                    <div
                        key={`floating-box-${index}`}
                        ref={el => {
                            if (floatingBoxesRef.current.length <= index) {
                                floatingBoxesRef.current.push(el);
                            } else {
                                floatingBoxesRef.current[index] = el;
                            }
                        }}
                        className="absolute rounded-[10%] border-4 border-[#e8d58b] overflow-hidden hidden sm:block"
                        style={{
                            width: `${typeof box.size === 'object' 
                                ? `clamp(${box.size.mobile}px, ${box.size.mobile/10}vw + ${box.size.mobile/2}px, ${box.size.desktop}px)`
                                : box.size + 'px'
                            }`,
                            height: `${typeof box.size === 'object' 
                                ? `clamp(${box.size.mobile}px, ${box.size.mobile/10}vw + ${box.size.mobile/2}px, ${box.size.desktop}px)`
                                : box.size + 'px'
                            }`,
                            left: typeof box.left === 'object' 
                                ? isMobile ? box.left.mobile : box.left.desktop
                                : box.left,
                            top: typeof box.top === 'object' 
                                ? isMobile ? box.top.mobile : box.top.desktop
                                : box.top,
                            transform: `rotate(${box.rotation}deg)`
                        }}
                    >
                        <Image 
                            src={box.imagePath}
                            alt={box.alt}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority={true}
                            quality={90}
                            unoptimized={true}
                        />
                    </div>
                ))}
                
                {/* Main text */}
                <div className="relative z-10 text-center px-4">
                    Knowledge base for <br /> you collages
                </div>
            </div>
        </div>
    );
}

export default First