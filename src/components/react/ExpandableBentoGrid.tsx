"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
}

interface ExpandableBentoGridProps {
  items: BentoItem[];
  className?: string;
  gridClassName?: string;
}

function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, callback: () => void) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") callback();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, callback]);
}

export function ExpandableBentoGrid({ items, className, gridClassName }: ExpandableBentoGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setActiveId(null), []);
  useOutsideClick(overlayRef, close);

  useEffect(() => {
    if (activeId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeId]);

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <div className={cn("relative", className)}>
      {/* Expanded overlay */}
      <AnimatePresence>
        {activeItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                ref={overlayRef}
                layoutId={`bento-card-${activeItem.id}`}
                className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-neutral-900/95 border border-white/10 p-8 shadow-2xl"
              >
                <motion.div layoutId={`bento-icon-${activeItem.id}`} className="mb-4">
                  {activeItem.icon}
                </motion.div>
                <motion.h3
                  layoutId={`bento-title-${activeItem.id}`}
                  className="text-2xl font-bold text-white mb-4"
                >
                  {activeItem.title}
                </motion.h3>
                <motion.p
                  layoutId={`bento-desc-${activeItem.id}`}
                  className="text-neutral-300 mb-6"
                >
                  {activeItem.description}
                </motion.p>
                {activeItem.content && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {activeItem.content}
                  </motion.div>
                )}
                <button
                  onClick={close}
                  className="mt-6 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm hover:bg-emerald-500/30 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div
        className={cn(
          "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          gridClassName
        )}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`bento-card-${item.id}`}
            onClick={() => setActiveId(item.id)}
            className={cn(
              "relative cursor-pointer group rounded-2xl p-6",
              "bg-neutral-900/50 border border-white/5 backdrop-blur-sm",
              "hover:border-emerald-500/30 hover:bg-neutral-800/50 transition-colors duration-300",
              item.className
            )}
          >
            <motion.div layoutId={`bento-icon-${item.id}`} className="mb-3">
              {item.icon}
            </motion.div>
            <motion.h3
              layoutId={`bento-title-${item.id}`}
              className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors"
            >
              {item.title}
            </motion.h3>
            <motion.p
              layoutId={`bento-desc-${item.id}`}
              className="text-neutral-400 text-sm line-clamp-2"
            >
              {item.description}
            </motion.p>

            {/* Subtle corner glow on hover */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-tr-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ExpandableBentoGrid;
