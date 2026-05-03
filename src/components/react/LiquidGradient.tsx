"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function LiquidGradient({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const circles = svgRef.current.querySelectorAll<SVGCircleElement>("circle[data-animate]");
    const animations: number[] = [];

    circles.forEach((circle, i) => {
      const speed = 0.0003 + i * 0.0001;
      const offset = i * (Math.PI / 3);
      const radiusRange = [80, 160];
      const cxRange = [250, 750];
      const cyRange = [250, 550];

      let start: number | null = null;
      function step(timestamp: number) {
        if (start === null) start = timestamp;
        const elapsed = (timestamp - start) * speed;

        circle.setAttribute("cx", `${cxRange[0] + ((Math.sin(elapsed + offset) + 1) / 2) * (cxRange[1] - cxRange[0])}`);
        circle.setAttribute("cy", `${cyRange[0] + ((Math.cos(elapsed * 0.7 + offset * 2) + 1) / 2) * (cyRange[1] - cyRange[0])}`);
        circle.setAttribute("r", `${radiusRange[0] + ((Math.sin(elapsed * 1.3 + offset * 3) + 1) / 2) * (radiusRange[1] - radiusRange[0])}`);

        animations.push(requestAnimationFrame(step));
      }
      animations.push(requestAnimationFrame(step));
    });

    return () => animations.forEach(cancelAnimationFrame);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 800"
      className={cn("absolute inset-0 w-full h-full", className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="liquid-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
        </filter>
      </defs>
      <g filter="url(#liquid-blur)" opacity="0.4">
        <circle data-animate cx="300" cy="400" r="120" fill="#14be80" style={{ mixBlendMode: "hard-light" }} />
        <circle data-animate cx="500" cy="300" r="100" fill="#06b6d4" style={{ mixBlendMode: "hard-light" }} />
        <circle data-animate cx="700" cy="500" r="140" fill="#22c55e" style={{ mixBlendMode: "hard-light" }} />
        <circle data-animate cx="400" cy="600" r="90" fill="#10b981" style={{ mixBlendMode: "difference" }} />
        <circle data-animate cx="600" cy="200" r="110" fill="#0ea5e9" style={{ mixBlendMode: "hard-light" }} />
        <circle data-animate cx="200" cy="300" r="130" fill="#34d399" style={{ mixBlendMode: "difference" }} />
        <circle data-animate cx="800" cy="400" r="100" fill="#14be80" style={{ mixBlendMode: "hard-light" }} />
      </g>
    </svg>
  );
}

export default LiquidGradient;
