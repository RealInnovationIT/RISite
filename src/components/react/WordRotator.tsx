"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WordRotatorProps {
  words: string[];
  className?: string;
  interval?: number;
}

export function WordRotator({ words, className, interval = 2400 }: WordRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // in → hold after 600ms
    const holdTimer = setTimeout(() => setPhase("hold"), 600);
    return () => clearTimeout(holdTimer);
  }, [currentIndex]);

  useEffect(() => {
    if (phase !== "hold") return;
    // hold → out after interval
    const outTimer = setTimeout(() => setPhase("out"), interval - 600 - 400);
    return () => clearTimeout(outTimer);
  }, [phase, interval]);

  useEffect(() => {
    if (phase !== "out") return;
    // out → next word after 400ms
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      setPhase("in");
    }, 400);
    return () => clearTimeout(nextTimer);
  }, [phase, words.length]);

  const styles: React.CSSProperties = {
    display: "inline-block",
    transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)",
    opacity: phase === "hold" ? 1 : 0,
    transform: phase === "in" ? "translateY(16px) scale(0.96)" : phase === "out" ? "translateY(-14px) scale(0.96)" : "translateY(0) scale(1)",
  };

  return (
    <div className={cn("overflow-hidden flex items-center justify-center", className)}>
      <span style={styles}>{words[currentIndex]}</span>
    </div>
  );
}
