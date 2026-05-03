"use client";

import { cn } from "@/lib/utils";

interface AnimatedHeroProps {
  className?: string;
  children?: React.ReactNode;
}

export function AnimatedHero({ className, children }: AnimatedHeroProps) {
  return (
    <section
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      {/* Aurora rainbow stripes */}
      <div
        className="absolute inset-0 animate-aurora-shift opacity-60"
        style={{
          background: `repeating-linear-gradient(
            100deg,
            var(--color-1) 10%,
            var(--color-2) 15%,
            var(--color-3) 20%,
            var(--color-4) 25%,
            var(--color-5) 30%
          )`,
          backgroundSize: "200% 200%",
          mixBlendMode: "difference",
        }}
      />

      {/* Second layer for depth */}
      <div
        className="absolute inset-0 animate-aurora-shift-reverse opacity-40"
        style={{
          background: `repeating-linear-gradient(
            100deg,
            var(--color-1) 10%,
            var(--color-2) 15%,
            var(--color-3) 20%,
            var(--color-4) 25%,
            var(--color-5) 30%
          )`,
          backgroundSize: "300% 300%",
          mixBlendMode: "difference",
          filter: "blur(10px)",
        }}
      />

      {/* Glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,190,128,0.1),transparent_60%)]" />

      {/* Blur overlay for readability */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,15,0.8)_100%)]" />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}

export default AnimatedHero;
