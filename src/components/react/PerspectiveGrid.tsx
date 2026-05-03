"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface PerspectiveGridProps {
  className?: string;
  gridSize?: number;
  showOverlay?: boolean;
  fadeRadius?: number;
}

export function PerspectiveGrid({
  className,
  gridSize = 30,
  showOverlay = true,
  fadeRadius = 75,
}: PerspectiveGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tiles = useMemo(() => Array.from({ length: gridSize * gridSize }), [gridSize]);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        className
      )}
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute w-[80rem] aspect-square grid origin-center"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) rotateX(30deg) rotateY(-5deg) rotateZ(20deg) scale(2)",
          transformStyle: "preserve-3d",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {mounted &&
          tiles.map((_, i) => (
            <div
              key={i}
              className="tile min-h-[1px] min-w-[1px] border border-emerald-500/10 dark:border-emerald-400/[0.07] bg-transparent transition-colors duration-[1500ms] hover:duration-0 hover:bg-emerald-500/20"
            />
          ))}
      </div>

      {showOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle, transparent 25%, var(--bg-primary, #0a0a0f) ${fadeRadius}%)`,
          }}
        />
      )}
    </div>
  );
}

export default PerspectiveGrid;
