import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function StackedLayers3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layer1Ref = useRef<SVGGElement>(null);
  const layer2Ref = useRef<SVGGElement>(null);
  const layer3Ref = useRef<SVGGElement>(null);
  const layer4Ref = useRef<SVGGElement>(null);
  const connectorsRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const svg = svgRef.current;
    const layer1 = layer1Ref.current;
    const layer2 = layer2Ref.current;
    const layer3 = layer3Ref.current;
    const layer4 = layer4Ref.current;
    const connectors = connectorsRef.current;
    const text = textRef.current;

    if (
      !container ||
      !title ||
      !svg ||
      !layer1 ||
      !layer2 ||
      !layer3 ||
      !layer4 ||
      !connectors ||
      !text
    )
      return;

    // Set initial states
    gsap.set([title, svg], { opacity: 0, y: 50 });
    gsap.set([layer1, layer2, layer3, layer4], {
      opacity: 0,
      scale: 0.8,
      transformOrigin: "center",
    });
    gsap.set(connectors, {
      opacity: 0,
      strokeDasharray: "10,5",
      strokeDashoffset: 100,
    });
    gsap.set(text, { opacity: 0, y: 30 });

    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 50%",
        end: "bottom 90%",
        scrub: 1,
        markers: false,
      },
    });

    // Animate title first
    tl.to(title, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    })
      // Animate SVG container
      .to(
        svg,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2",
      )
      // Animate text labels
      .to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.1",
      )
      // Animate layers in sequence from bottom to top
      .to(
        layer1,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "-=0.1",
      )
      .to(
        layer2,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      )
      .to(
        layer3,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      )
      .to(
        layer4,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      )
      // Animate connectors last with dash animation
      .to(
        connectors,
        {
          opacity: 1,
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power2.inOut",
        },
        "-=0.2",
      );

    // Add floating animation for the entire SVG
    gsap.to(svg, {
      y: -10,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-[100svh] w-[100svw] items-center justify-center overflow-hidden bg-[#0c0c0c]"
      aria-hidden="true"
    >
      <div
        className="flex-col items-center justify-center gap-6"
        style={{ perspective: "400px", transformStyle: "preserve-3d" }}
      >
        <h1 ref={titleRef} className="text-[4em]">
          <span className="font-serif italic text-[#FF5E00]"> sphaereai </span>
          architecture
        </h1>
        <svg
          ref={svgRef}
          width="581"
          height="297"
          viewBox="0 0 581 297"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layer 1 - Bottom layer with longest arrows */}
          <g ref={layer1Ref}>
            <path d="M270.492 252V295.58" stroke="white" strokeWidth="1" />
            <path
              d="M265.891 291.3L270.491 295.9L275.091 291.3"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M294.492 246.46V290.05" stroke="white" strokeWidth="1" />
            <path
              d="M289.891 285.76L294.491 290.36L299.091 285.76"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M246.492 246.46V290.05" stroke="white" strokeWidth="1" />
            <path
              d="M241.891 285.76L246.491 290.36L251.091 285.76"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M222.492 240.92V284.51" stroke="white" strokeWidth="1" />
            <path
              d="M217.891 280.22L222.491 284.82L227.091 280.22"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M318.492 240.93V284.51" stroke="white" strokeWidth="1" />
            <path
              d="M313.891 280.23L318.491 284.83L323.091 280.23"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M198.492 235.38V278.97" stroke="white" strokeWidth="1" />
            <path
              d="M193.891 274.68L198.491 279.28L203.091 274.68"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M342.492 235.39V278.98" stroke="white" strokeWidth="1" />
            <path
              d="M337.891 274.69L342.491 279.29L347.091 274.69"
              stroke="white"
              strokeWidth="1"
            />
          </g>

          {/* Layer 2 - Middle layer */}
          <g ref={layer2Ref}>
            <path d="M270.492 180V223.58" stroke="white" strokeWidth="1" />
            <path
              d="M265.891 219.3L270.491 223.9L275.091 219.3"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M294.492 174.46V218.05" stroke="white" strokeWidth="1" />
            <path
              d="M289.891 213.76L294.491 218.36L299.091 213.76"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M246.492 174.46V218.05" stroke="white" strokeWidth="1" />
            <path
              d="M241.891 213.76L246.491 218.36L251.091 213.76"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M222.492 168.92V212.51" stroke="white" strokeWidth="1" />
            <path
              d="M217.891 208.22L222.491 212.82L227.091 208.22"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M318.492 168.93V212.51" stroke="white" strokeWidth="1" />
            <path
              d="M313.891 208.23L318.491 212.83L323.091 208.23"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M198.492 163.38V206.97" stroke="white" strokeWidth="1" />
            <path
              d="M193.891 202.68L198.491 207.28L203.091 202.68"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M342.492 163.39V206.98" stroke="white" strokeWidth="1" />
            <path
              d="M337.891 202.69L342.491 207.29L347.091 202.69"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M174.492 157.84V201.43" stroke="white" strokeWidth="1" />
            <path
              d="M169.891 197.14L174.491 201.74L179.091 197.14"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M366.492 157.86V201.44" stroke="white" strokeWidth="1" />
            <path
              d="M361.891 197.16L366.491 201.76L371.091 197.16"
              stroke="white"
              strokeWidth="1"
            />
          </g>

          {/* Layer 3 - Upper layer */}
          <g ref={layer3Ref}>
            <path d="M270.492 108V151.58" stroke="white" strokeWidth="1" />
            <path
              d="M265.891 147.3L270.491 151.9L275.091 147.3"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M294.492 102.46V146.05" stroke="white" strokeWidth="1" />
            <path
              d="M289.891 141.76L294.491 146.36L299.091 141.76"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M246.492 102.46V146.05" stroke="white" strokeWidth="1" />
            <path
              d="M241.891 141.76L246.491 146.36L251.091 141.76"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M222.492 96.9199V140.51" stroke="white" strokeWidth="1" />
            <path
              d="M217.891 136.22L222.491 140.82L227.091 136.22"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M318.492 96.9299V140.51" stroke="white" strokeWidth="1" />
            <path
              d="M313.891 136.23L318.491 140.83L323.091 136.23"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M198.492 91.3799V134.97" stroke="white" strokeWidth="1" />
            <path
              d="M193.891 130.68L198.491 135.28L203.091 130.68"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M342.492 91.3901V134.98" stroke="white" strokeWidth="1" />
            <path
              d="M337.891 130.69L342.491 135.29L347.091 130.69"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M174.492 85.8401V129.43" stroke="white" strokeWidth="1" />
            <path
              d="M169.891 125.14L174.491 129.74L179.091 125.14"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M366.492 85.8599V129.44" stroke="white" strokeWidth="1" />
            <path
              d="M361.891 125.16L366.491 129.76L371.091 125.16"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M150.492 80.3V123.89" stroke="white" strokeWidth="1" />
            <path
              d="M145.891 119.6L150.491 124.2L155.091 119.6"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M390.492 80.3201V123.91" stroke="white" strokeWidth="1" />
            <path
              d="M385.891 119.62L390.491 124.22L395.091 119.62"
              stroke="white"
              strokeWidth="1"
            />
          </g>

          {/* Layer 4 - Top layer */}
          <g ref={layer4Ref}>
            <path d="M270.492 0V79.58" stroke="white" strokeWidth="1" />
            <path
              d="M265.891 75.3L270.491 79.9L275.091 75.3"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M294.492 12V74.05" stroke="white" strokeWidth="1" />
            <path
              d="M289.891 69.8L294.491 74.4L299.091 69.8"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M246.492 12V74.05" stroke="white" strokeWidth="1" />
            <path
              d="M241.891 69.8L246.491 74.4L251.091 69.8"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M222.492 0V68.51" stroke="white" strokeWidth="1" />
            <path
              d="M217.891 64.3L222.491 68.9L227.091 64.3"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M318.492 0V68.51" stroke="white" strokeWidth="1" />
            <path
              d="M313.891 64.3L318.491 68.9L323.091 64.3"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M198.492 12V62.97" stroke="white" strokeWidth="1" />
            <path
              d="M193.891 58.7L198.491 63.2999L203.091 58.7"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M342.492 12V62.98" stroke="white" strokeWidth="1" />
            <path
              d="M337.891 58.7L342.491 63.2999L347.091 58.7"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M174.492 0V57.43" stroke="white" strokeWidth="1" />
            <path
              d="M169.891 53.2L174.491 57.8L179.091 53.2"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M366.492 0V57.44" stroke="white" strokeWidth="1" />
            <path
              d="M361.891 53.2L366.491 57.8L371.091 53.2"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M150.492 12V51.89" stroke="white" strokeWidth="1" />
            <path
              d="M145.891 47.6001L150.491 52.2001L155.091 47.6001"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M390.492 12V51.91" stroke="white" strokeWidth="1" />
            <path
              d="M385.891 47.7L390.491 52.2999L395.091 47.7"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M126.492 0V46.35" stroke="white" strokeWidth="1" />
            <path
              d="M121.891 42.1001L126.491 46.7001L131.091 42.1001"
              stroke="white"
              strokeWidth="1"
            />
            <path d="M414.492 0V46.37" stroke="white" strokeWidth="1" />
            <path
              d="M409.891 42.1001L414.491 46.7001L419.091 42.1001"
              stroke="white"
              strokeWidth="1"
            />
          </g>

          {/* Connectors - Horizontal lines that connect layers */}
          <g ref={connectorsRef}>
            <path
              d="M114.492 204V216L270.492 252L426.492 216V204M114.492 204L270.464 240L426.492 204M114.492 204L244.492 174L270.492 180L296.492 174L426.492 204"
              stroke="white"
              strokeWidth="1"
            />
            <path
              d="M114.492 132V144L270.492 180L426.492 144V132M114.492 132L270.464 168L426.492 132M114.492 132L244.492 102L270.492 108L296.492 102L426.492 132"
              stroke="white"
              strokeWidth="1"
            />
            <path
              d="M114.492 60V72L270.492 108L426.492 72V60M114.492 60L270.492 24L426.492 60M114.492 60L270.492 96L426.492 60"
              stroke="white"
              strokeWidth="1"
            />
          </g>

          {/* Text elements */}
          <g ref={textRef}>
            <text
              x="50"
              y="150"
              fill="#F4F4F4"
              fontSize="14"
              fontFamily="Arial, sans-serif"
            >
              LLM Layer
            </text>
            <text
              x="450"
              y="70"
              fill="#F4F4F4"
              fontSize="14"
              fontFamily="Arial, sans-serif"
            >
              Knowledge Base
            </text>
            <text
              x="450"
              y="220"
              fill="#F4F4F4"
              fontSize="14"
              fontFamily="Arial, sans-serif"
            >
              Tools Layer
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  return <StackedLayers3D />;
}
