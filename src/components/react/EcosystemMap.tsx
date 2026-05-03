"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ModuleNode {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: string;
  icon: string;
  color: string;
  details: {
    solves: string;
    howItWorks: string;
    useCase: string;
  };
}

interface EcosystemMapProps {
  modules: ModuleNode[];
  centerLabel?: string;
  centerSublabel?: string;
  className?: string;
}

export function EcosystemMap({
  modules,
  centerLabel = "Leaf",
  centerSublabel = "Ecosystem",
  className,
}: EcosystemMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleNode | null>(null);

  const getPosition = useCallback(
    (index: number, total: number) => {
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
      const radiusX = 38;
      const radiusY = 36;
      return {
        x: 50 + radiusX * Math.cos(angle),
        y: 50 + radiusY * Math.sin(angle),
      };
    },
    []
  );

  return (
    <div className={cn("relative w-full", className)}>
      {/* SVG connection lines */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(20,190,128,0.1)" />
            <stop offset="50%" stopColor="rgba(20,190,128,0.3)" />
            <stop offset="100%" stopColor="rgba(20,190,128,0.1)" />
          </linearGradient>
          <filter id="glow-line">
            <feGaussianBlur stdDeviation="0.3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lines from center to each module */}
        {modules.map((mod, i) => {
          const pos = getPosition(i, modules.length);
          const isActive = hoveredId === mod.id;
          return (
            <line
              key={`line-${mod.id}`}
              x1="50"
              y1="50"
              x2={pos.x}
              y2={pos.y}
              stroke={isActive ? mod.color : "rgba(20,190,128,0.15)"}
              strokeWidth={isActive ? "0.4" : "0.15"}
              strokeDasharray={isActive ? "none" : "1 1"}
              filter={isActive ? "url(#glow-line)" : undefined}
              className="transition-all duration-500"
            />
          );
        })}

        {/* Lines between adjacent modules */}
        {modules.map((mod, i) => {
          const pos1 = getPosition(i, modules.length);
          const pos2 = getPosition((i + 1) % modules.length, modules.length);
          return (
            <line
              key={`arc-${mod.id}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke="rgba(20,190,128,0.07)"
              strokeWidth="0.1"
              strokeDasharray="0.5 1.5"
            />
          );
        })}

        {/* Orbital ring */}
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="none"
          stroke="rgba(20,190,128,0.06)"
          strokeWidth="0.15"
          strokeDasharray="2 3"
        />
      </svg>

      {/* Center hub */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-spin" style={{ animationDuration: "20s" }} />
          <div className="absolute inset-1 rounded-full border border-emerald-500/10 animate-spin" style={{ animationDuration: "30s", animationDirection: "reverse" }} />
          
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-sm border border-emerald-500/30 flex flex-col items-center justify-center">
            <span className="text-lg md:text-2xl font-black text-white tracking-tight">{centerLabel}</span>
            <span className="text-[10px] md:text-xs text-emerald-400/70 font-medium">{centerSublabel}</span>
          </div>
        </div>
      </div>

      {/* Module nodes */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        {modules.map((mod, i) => {
          const pos = getPosition(i, modules.length);
          const isHovered = hoveredId === mod.id;

          return (
            <div
              key={mod.id}
              className="absolute z-10"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                className={cn(
                  "relative cursor-pointer group",
                  "flex flex-col items-center"
                )}
                onMouseEnter={() => setHoveredId(mod.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedModule(mod)}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Node circle */}
                <div
                  className={cn(
                    "w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
                    "border backdrop-blur-sm",
                    isHovered
                      ? "border-emerald-400/50 bg-neutral-800/80 shadow-lg shadow-emerald-500/10"
                      : "border-white/10 bg-neutral-900/60"
                  )}
                >
                  <span className="text-xl md:text-3xl">{mod.icon}</span>
                </div>

                {/* Label */}
                <span className={cn(
                  "mt-2 text-xs md:text-sm font-semibold transition-colors duration-300 text-center leading-tight",
                  isHovered ? "text-white" : "text-neutral-400"
                )}>
                  {mod.name}
                </span>

                {/* Hover tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-4 z-30 w-48 md:w-56 p-3 rounded-xl bg-neutral-900/95 border border-white/10 backdrop-blur-xl shadow-2xl pointer-events-none"
                    >
                      <p className="text-xs font-semibold text-emerald-400 mb-1">{mod.tagline}</p>
                      <p className="text-xs text-neutral-300 leading-relaxed">{mod.description}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          mod.status === "Beta" ? "bg-emerald-400" :
                          mod.status === "In Development" ? "bg-yellow-400" :
                          "bg-neutral-500"
                        )} />
                        <span className="text-[10px] text-neutral-500">{mod.status}</span>
                      </div>
                      <p className="text-[10px] text-emerald-500/60 mt-2">Click to learn more →</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status dot */}
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-neutral-900",
                  mod.status === "Beta" ? "bg-emerald-400" :
                  mod.status === "In Development" ? "bg-yellow-400" :
                  "bg-neutral-600"
                )} />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-lg rounded-2xl bg-neutral-900/95 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header gradient */}
              <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, ${selectedModule.color}, transparent)` }}
              />

              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-2xl">
                      {selectedModule.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedModule.name}</h3>
                      <p className="text-sm text-emerald-400 font-medium">{selectedModule.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Description */}
                <p className="text-neutral-300 leading-relaxed mb-6">{selectedModule.description}</p>

                {/* Details grid */}
                <div className="space-y-4">
                  <div className="rounded-xl p-4 bg-neutral-800/50 border border-white/5">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">What it Solves</h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">{selectedModule.details.solves}</p>
                  </div>
                  <div className="rounded-xl p-4 bg-neutral-800/50 border border-white/5">
                    <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">How it Works</h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">{selectedModule.details.howItWorks}</p>
                  </div>
                  <div className="rounded-xl p-4 bg-neutral-800/50 border border-white/5">
                    <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Enterprise Use Case</h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">{selectedModule.details.useCase}</p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="mt-6 flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    selectedModule.status === "Beta"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : selectedModule.status === "In Development"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                  )}>
                    {selectedModule.status}
                  </span>
                  <span className="text-xs text-neutral-500">Cloud-native · Event-driven · Multi-tenant</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EcosystemMap;
