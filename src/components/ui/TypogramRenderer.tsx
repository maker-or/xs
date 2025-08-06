import type React from 'react';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    typograms?: {
      create: (source: string, zoom?: number, debug?: boolean) => SVGSVGElement;
    };
  }
}

interface TypogramRendererProps {
  source: string;
  zoom?: number;
  debug?: boolean;
}

const TypogramRenderer: React.FC<TypogramRendererProps> = ({
  source,
  zoom = 0.3,
  debug = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.typograms &&
      containerRef.current
    ) {
      const svg = window.typograms.create(source, zoom, debug);
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(svg);
    }
  }, [source, zoom, debug]);

  return <div className="my-4" ref={containerRef} />;
};

export default TypogramRenderer;
