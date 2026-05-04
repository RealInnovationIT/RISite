"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ModuleNode {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: "Beta" | "In Development" | "Planned";
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
}

const POS: Record<string, { x: number; y: number }> = {
  center:    { x: 50,  y: 48 },
  rotor:     { x: 28,  y: 10 },
  rootview:  { x: 73,  y: 13 },
  fastoo:    { x: 88,  y: 46 },
  lawrf:     { x: 75,  y: 80 },
  elytra:    { x: 47,  y: 88 },
  glide:     { x: 12,  y: 65 },
  verdanthr: { x: 13,  y: 27 },
};

const CONNECTIONS = [
  { from: "fastoo",   to: "rootview", label: "Cash Flow"    },
  { from: "lawrf",    to: "rootview", label: "Fiscal Audit" },
  { from: "glide",    to: "rotor",    label: "Workflows"    },
  { from: "glide",    to: "rootview", label: "Workflows"    },
  { from: "glide",    to: "fastoo",   label: "Workflows"    },
  { from: "glide",    to: "lawrf",    label: "Workflows"    },
  { from: "glide",    to: "elytra",   label: "Workflows"    },
];

const STATUS_CFG: Record<string, { color: string }> = {
  "Beta":           { color: "#10b981" },
  "In Development": { color: "#f59e0b" },
  "Planned":        { color: "#6b7280" },
};

function LeafLogo({ size = 40 }: { size?: number }) {
  return (
    <img src="/leaf-logo.svg" style={{ width: size, height: Math.round(size * 1.125) }}/>
  );
}

function ModuleIcon({ id, color, size = 24 }: { id: string; color: string; size?: number }) {
  const s = {
    width: size, height: size,
    fill: "none", stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "rotor": return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
    case "rootview": return (
      <svg viewBox="0 0 24 24" style={s}>
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="6"  y1="20" x2="6"  y2="16" />
        <line x1="2"  y1="20" x2="22" y2="20" />
      </svg>
    );
    case "fastoo": return (
      <svg viewBox="0 0 24 24" style={s}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
    case "lawrf": return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
    case "elytra": return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
    case "glide": return (
      <svg viewBox="0 0 24 24" style={s}>
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6"  cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    );
    case "verdanthr": return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8"  x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    );
    default: return (
      <svg viewBox="0 0 24 24" style={s}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
}

// ── Mobile Detail View ─────────────────────────────────────────────────────────
function MobileDetailView({ mod, onBack }: { mod: ModuleNode; onBack: () => void }) {
  const statusColor = STATUS_CFG[mod.status]?.color ?? "#6b7280";
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.2 }}>
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-5 transition-colors active:opacity-70">
        <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7" />
        </svg>
        Back to modules
      </button>
      <div className="rounded-2xl p-5 border" style={{ background: `${mod.color}06`, borderColor: `${mod.color}35` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${mod.color}18`, border: `1px solid ${mod.color}40` }}>
            <ModuleIcon id={mod.id} color={mod.color} size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{mod.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                {mod.status}
              </span>
            </div>
            <p className="text-sm" style={{ color: mod.color }}>{mod.tagline}</p>
          </div>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed mb-4">{mod.description}</p>
        <div className="space-y-3">
          {[
            { label: "PROBLEM SOLVED", value: mod.details.solves     },
            { label: "HOW IT WORKS",   value: mod.details.howItWorks },
            { label: "USE CASE",       value: mod.details.useCase    },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-4"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">{label}</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main EcosystemMap ─────────────────────────────────────────────────────────
export function EcosystemMap({
  modules,
  centerLabel = "Leaf",
  centerSublabel = "Event-Driven Core",
}: EcosystemMapProps) {
  const [hovered, setHovered]               = useState<string | null>(null);
  const [selected, setSelected]             = useState<ModuleNode | null>(null);
  const [isMobile, setIsMobile]             = useState(false);
  const [mobileSelected, setMobileSelected] = useState<ModuleNode | null>(null);

  // Body scroll lock for detail modal (desktop)
  useEffect(() => {
    if (selected) document.body.style.overflow = "hidden";
    else          document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const moduleIds   = new Set(modules.map((m) => m.id));
  const hoveredModule = hovered ? (modules.find((m) => m.id === hovered) ?? null) : null;

  const getConnected = useCallback((id: string): Set<string> => {
    const s = new Set<string>(["center"]);
    CONNECTIONS.forEach((c) => {
      if (c.from === id) s.add(c.to);
      if (c.to   === id) s.add(c.from);
    });
    return s;
  }, []);

  const isDimmed     = (id: string) => !!hovered && id !== hovered && !getConnected(hovered).has(id);
  const isEdgeActive = (a: string, b: string) => !!hovered && (a === hovered || b === hovered);

  // ── MOBILE VIEW ─────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        {mobileSelected ? (
          <motion.div key="detail">
            <MobileDetailView mod={mobileSelected} onBack={() => setMobileSelected(null)} />
          </motion.div>
        ) : (
          <motion.div key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}>
            {/* Leaf core indicator */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 mb-4">
              <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-neutral-950/90 flex items-center justify-center flex-shrink-0">
                <LeafLogo size={22} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{centerLabel}</div>
                <div className="text-xs text-emerald-400/60">{centerSublabel}</div>
              </div>
              <span className="ml-auto text-xs text-neutral-600">Tap to explore</span>
            </div>

            {/* Module grid */}
            <div className="grid grid-cols-2 gap-3">
              {modules.map((mod) => {
                const statusColor = STATUS_CFG[mod.status]?.color ?? "#6b7280";
                return (
                  <button key={mod.id}
                    onClick={() => setMobileSelected(mod)}
                    className="relative text-left w-full rounded-2xl p-4 border transition-all duration-150 active:scale-95"
                    style={{ background: `${mod.color}08`, borderColor: `${mod.color}30` }}>
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-neutral-950"
                      style={{ backgroundColor: statusColor }} />
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${mod.color}18`, border: `1px solid ${mod.color}35` }}>
                      <ModuleIcon id={mod.id} color={mod.color} size={22} />
                    </div>
                    <div className="text-sm font-bold text-white leading-tight">{mod.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: `${mod.color}bb` }}>{mod.tagline}</div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span>Beta</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /><span>In Dev</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-neutral-500" /><span>Planned</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── DESKTOP VIEW ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes ecmDash  { to { stroke-dashoffset: -18; } }
        @keyframes ecmPulse {
          0%,100% { box-shadow: 0 0 18px rgba(16,185,129,.15); }
          50%      { box-shadow: 0 0 42px rgba(16,185,129,.38); }
        }
      `}</style>

      {/* Layout: canvas + side panel */}
      <div style={{ display: "flex", flexDirection: "row", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Canvas */}
        <div style={{ flex: "1 1 480px", minWidth: 0, overflowX: "auto" }}>
          <div className="relative mx-auto"
            style={{ minWidth: 480, maxWidth: 820, paddingBottom: "60%", minHeight: 300 }}>

            <svg className="absolute inset-0 w-full h-full"
              style={{ zIndex: 1, pointerEvents: "none", overflow: "visible" }}>
              {modules.map((mod) => {
                const p = POS[mod.id]; const c = POS.center;
                if (!p) return null;
                const active = isEdgeActive("center", mod.id);
                return (
                  <line key={`hub-${mod.id}`}
                    x1={`${c.x}%`} y1={`${c.y}%`} x2={`${p.x}%`} y2={`${p.y}%`}
                    stroke={active ? "rgba(16,185,129,0.45)" : "rgba(255,255,255,0.07)"}
                    strokeWidth={active ? 1.5 : 1} strokeDasharray="3 8"
                    style={{ animation: "ecmDash 4s linear infinite" }} />
                );
              })}
              {CONNECTIONS.map((conn, i) => {
                const p1 = POS[conn.from]; const p2 = POS[conn.to];
                if (!p1 || !p2 || !moduleIds.has(conn.from) || !moduleIds.has(conn.to)) return null;
                const active = isEdgeActive(conn.from, conn.to);
                const mx = (p1.x + p2.x) / 2; const my = (p1.y + p2.y) / 2;
                return (
                  <g key={`conn-${i}`}>
                    <line x1={`${p1.x}%`} y1={`${p1.y}%`} x2={`${p2.x}%`} y2={`${p2.y}%`}
                      stroke={active ? "rgba(16,185,129,0.75)" : "rgba(16,185,129,0.22)"}
                      strokeWidth={active ? 2 : 1.5} strokeDasharray="5 5"
                      style={{ animation: "ecmDash 2.5s linear infinite" }} />
                    {active && (
                      <text x={`${mx}%`} y={`${my}%`} fill="rgba(52,211,153,0.9)"
                        fontSize="10" fontFamily="system-ui,sans-serif" fontWeight="600"
                        textAnchor="middle" dy="-5">{conn.label}</text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Center: Leaf */}
            <div className="absolute z-10"
              style={{ left: `${POS.center.x}%`, top: `${POS.center.y}%`, transform: "translate(-50%,-50%)" }}>
              <motion.div
                className="flex items-center justify-center rounded-full border-2 border-emerald-500/30 bg-neutral-950/90 backdrop-blur-sm"
                style={{ width: 90, height: 90, animation: "ecmPulse 3s ease-in-out infinite" }}
                whileHover={{ scale: 1.06 }}>
                <LeafLogo size={46} />
              </motion.div>
              <div className="text-center mt-1.5">
                <div className="text-[11px] font-bold text-white">{centerLabel}</div>
                <div className="text-[9px] text-emerald-400/60">{centerSublabel}</div>
              </div>
            </div>

            {/* Module nodes */}
            {modules.map((mod) => {
              const p = POS[mod.id];
              if (!p) return null;
              const statusColor = STATUS_CFG[mod.status]?.color ?? "#6b7280";
              const dimmed = isDimmed(mod.id);
              return (
                <motion.div key={mod.id}
                  className="absolute z-10 flex flex-col items-center cursor-pointer group"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
                  animate={{ opacity: dimmed ? 0.2 : 1 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={() => setHovered(mod.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(mod)}>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full z-20 border border-neutral-950"
                    style={{ backgroundColor: statusColor }} />
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                    style={{ backgroundColor: `${mod.color}18`, borderColor: `${mod.color}35` }}
                    whileHover={{ scale: 1.12, borderColor: mod.color, boxShadow: `0 0 22px ${mod.color}45` }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}>
                    <ModuleIcon id={mod.id} color={mod.color} size={26} />
                  </motion.div>
                  <span className="mt-1.5 text-[11px] font-semibold text-neutral-400 group-hover:text-white transition-colors whitespace-nowrap">
                    {mod.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {hoveredModule ? (
              <motion.div key={hoveredModule.id}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.16 }}
                className="rounded-2xl border p-5"
                style={{ background: "rgba(10,10,16,0.97)", borderColor: `${hoveredModule.color}35`, backdropFilter: "blur(16px)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${hoveredModule.color}18`, border: `1px solid ${hoveredModule.color}35` }}>
                    <ModuleIcon id={hoveredModule.id} color={hoveredModule.color} size={22} />
                  </div>
                  <div>
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mb-1"
                      style={{ backgroundColor: `${STATUS_CFG[hoveredModule.status]?.color}22`, color: STATUS_CFG[hoveredModule.status]?.color }}>
                      {hoveredModule.status}
                    </span>
                    <p className="text-sm font-bold text-white leading-none">{hoveredModule.name}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold mb-2" style={{ color: hoveredModule.color }}>{hoveredModule.tagline}</p>
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-4">{hoveredModule.description}</p>
                <button
                  className="mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: `${hoveredModule.color}18`, color: hoveredModule.color, border: `1px solid ${hoveredModule.color}35` }}
                  onClick={() => setSelected(hoveredModule)}
                  onMouseEnter={() => setHovered(hoveredModule.id)}>
                  Explore details →
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center text-center gap-3"
                style={{ background: "rgba(255,255,255,0.02)", minHeight: 220 }}>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                  <svg style={{ width: 20, height: 20, color: "#4b5563" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                  </svg>
                </div>
                <p className="text-neutral-500 text-sm">Hover any module<br />to explore its capabilities</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 mt-6 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 6" /></svg>
          <span>Event bus</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" strokeDasharray="5 4" /></svg>
          <span>Domain connection</span>
        </div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span>Beta</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span>In development</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-neutral-500" /><span>Planned</span></div>
      </div>

      {/* Detail modal — scrollable, body-locked */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
            style={{ backgroundColor: "rgba(0,0,0,0.87)" }}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="relative w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl my-4"
              style={{ background: "rgba(13,13,18,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)" }}
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelected(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <svg style={{ width: 16, height: 16, color: "#9ca3af" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${selected.color}20`, border: `1px solid ${selected.color}40` }}>
                  <ModuleIcon id={selected.id} color={selected.color} size={30} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${STATUS_CFG[selected.status]?.color}20`, color: STATUS_CFG[selected.status]?.color }}>
                      {selected.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: selected.color }}>{selected.tagline}</p>
                </div>
              </div>
              <p className="text-neutral-300 leading-relaxed mb-7">{selected.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Problem Solved", value: selected.details.solves     },
                  { label: "How It Works",   value: selected.details.howItWorks },
                  { label: "Use Case",       value: selected.details.useCase    },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">{label}</h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default EcosystemMap;
