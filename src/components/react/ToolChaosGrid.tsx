import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

interface Tool {
  name: string;
  color: string;
  abbr: string;
  x: number;
  y: number;
}

// Organic scattered positions — NOT a grid
const TOOLS: Tool[] = [
  { name: 'Zucchetti',     color: '#818cf8', abbr: 'ZU',  x: 78,  y: 62 },
  { name: 'Excel',         color: '#4ade80', abbr: 'XL',  x: 212, y: 46 },
  { name: 'TeamSystem',    color: '#60a5fa', abbr: 'TS',  x: 350, y: 58 },
  { name: 'HubSpot',       color: '#fb923c', abbr: 'HS',  x: 498, y: 72 },
  { name: 'SAP',           color: '#38bdf8', abbr: 'SAP', x: 56,  y: 192 },
  { name: 'Odoo',          color: '#c084fc', abbr: 'OD',  x: 198, y: 180 },
  { name: 'Salesforce',    color: '#22d3ee', abbr: 'SF',  x: 340, y: 195 },
  { name: 'MS Teams',      color: '#818cf8', abbr: 'MT',  x: 502, y: 200 },
  { name: 'Google Sheets', color: '#4ade80', abbr: 'GS',  x: 88,  y: 322 },
  { name: 'Slack',         color: '#fb7185', abbr: 'SL',  x: 226, y: 310 },
  { name: 'Fatture Cloud', color: '#38bdf8', abbr: 'FC',  x: 372, y: 324 },
  { name: 'Notion',        color: '#d4d4d4', abbr: 'NO',  x: 512, y: 332 },
];

// Curved connections: [from, to, curvature]
const CONNS: [number, number, number][] = [
  [0, 1, 14],   [1, 2, -11],  [2, 3, 16],
  [0, 4, -12],  [4, 5, 13],   [5, 6, -15],
  [6, 7, 11],   [3, 7, -14],  [4, 8, 12],
  [8, 9, -16],  [9, 10, 14],  [10, 11, -11],
  [1, 5, 18],   [5, 9, -13],  [2, 6, 15],
  [6, 10, -11], [7, 11, 12],  [3, 6, -18],
];

// Per-tool floating offsets (deterministic)
const FLOATS = [
  { dx: 3, dy: -2.5, d: 5.2 }, { dx: -2.5, dy: 3, d: 6.1 },
  { dx: 3.5, dy: 2, d: 4.8 },  { dx: -3, dy: -3, d: 5.5 },
  { dx: 2.5, dy: 3.5, d: 6.4 },{ dx: -3.5, dy: -2, d: 5.0 },
  { dx: 3, dy: -3, d: 5.8 },   { dx: -2, dy: 3, d: 6.2 },
  { dx: 3.5, dy: 2.5, d: 5.3 },{ dx: -3, dy: -2.5, d: 6.0 },
  { dx: 2.5, dy: -3, d: 5.6 }, { dx: -2.5, dy: 3, d: 5.9 },
];

function qPath(a: Tool, b: Tool, c: number) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  const l = Math.sqrt(dx * dx + dy * dy) || 1;
  return `M${a.x},${a.y} Q${mx + (-dy / l) * c},${my + (dx / l) * c} ${b.x},${b.y}`;
}

interface Props {
  className?: string;
  questionText?: string;
  punchlineText?: string;
  captionText?: string;
}

export function ToolChaosGrid({
  className = '',
  questionText = 'And how many exchange data automatically?',
  punchlineText = '0',
  captionText = "Every data transfer is manual. Every month-end is a reconciliation marathon. Every decision is based on yesterday's numbers.",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [phase, setPhase] = useState<'idle' | 'appear' | 'connect' | 'break' | 'reveal'>('idle');

  useEffect(() => {
    if (!inView) return;
    const t = [
      setTimeout(() => setPhase('appear'), 200),
      setTimeout(() => setPhase('connect'), 1500),
      setTimeout(() => setPhase('break'), 4200),
      setTimeout(() => setPhase('reveal'), 6400),
    ];
    return () => t.forEach(clearTimeout);
  }, [inView]);

  const show = phase !== 'idle';
  const lines = phase === 'connect' || phase === 'break' || phase === 'reveal';
  const breaking = phase === 'break' || phase === 'reveal';
  const revealed = phase === 'reveal';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <motion.svg
          viewBox="0 0 580 400"
          className="w-full"
          style={{ maxHeight: 420 }}
          animate={{ opacity: revealed ? 0.08 : 1 }}
          transition={{ duration: 1.2 }}
        >
          <defs>
            <filter id="cg-spark" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="cg-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Connection curves ── */}
          {CONNS.map(([fi, ti, cv], i) => {
            const a = TOOLS[fi], b = TOOLS[ti];
            const d = qPath(a, b, cv);
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const rd = (CONNS.length - 1 - i) * 0.065;

            return (
              <g key={`l${i}`}>
                <path d={d} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth={1} />

                <motion.path
                  d={d} fill="none" strokeWidth={1.5} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0, stroke: 'rgba(255,255,255,0.16)' }}
                  animate={
                    breaking
                      ? { pathLength: 1, opacity: [0.5, 0.85, 0], stroke: ['rgba(255,255,255,0.16)', 'rgba(239,68,68,0.75)', 'rgba(239,68,68,0.1)'] }
                      : lines
                        ? { pathLength: 1, opacity: 0.5, stroke: 'rgba(255,255,255,0.16)' }
                        : { pathLength: 0, opacity: 0, stroke: 'rgba(255,255,255,0.16)' }
                  }
                  transition={{
                    pathLength: { duration: 0.7, delay: lines && !breaking ? i * 0.065 : 0, ease: 'easeOut' },
                    opacity: { duration: breaking ? 1.5 : 0.3, delay: breaking ? rd : i * 0.065 },
                    stroke: { duration: breaking ? 1.3 : 0.3, delay: breaking ? rd : 0 },
                  }}
                />

                {/* Spark */}
                {breaking && !revealed && (
                  <motion.circle
                    cx={mx} cy={my} r={5} fill="#ef4444" filter="url(#cg-spark)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.55, delay: rd + 0.12 }}
                    style={{ transformOrigin: `${mx}px ${my}px` }}
                  />
                )}
              </g>
            );
          })}

          {/* ── Data pulse dots (connect phase) ── */}
          {phase === 'connect' && CONNS.map(([fi, ti], i) => {
            const a = TOOLS[fi], b = TOOLS[ti];
            return (
              <motion.circle
                key={`p${i}`} r={2.5} fill="rgba(255,255,255,0.6)" filter="url(#cg-soft)"
                initial={{ opacity: 0 }}
                animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 0.9, 0.9, 0] }}
                transition={{ duration: 1.3, delay: 0.5 + i * 0.1, ease: 'easeInOut' }}
              />
            );
          })}

          {/* ── Nodes ── */}
          {TOOLS.map((t, i) => {
            const f = FLOATS[i];
            return (
              <motion.g
                key={t.name}
                animate={{ x: [0, f.dx, -f.dx * 0.6, f.dx * 0.3, 0], y: [0, f.dy, -f.dy * 0.6, f.dy * 0.3, 0] }}
                transition={{ duration: f.d, repeat: Infinity, ease: 'easeInOut', delay: 0.3 + i * 0.12 }}
              >
                {/* Glow */}
                <motion.circle
                  cx={t.x} cy={t.y} r={34}
                  fill={breaking ? 'rgba(239,68,68,0.025)' : `${t.color}05`}
                  initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.5 }}
                />
                {/* Circle */}
                <motion.circle
                  cx={t.x} cy={t.y} r={24}
                  fill={breaking ? 'rgba(239,68,68,0.035)' : `${t.color}0a`}
                  stroke={breaking ? 'rgba(239,68,68,0.28)' : `${t.color}40`}
                  strokeWidth={1.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.05 * i }}
                  style={{ transformOrigin: `${t.x}px ${t.y}px` }}
                />
                {/* Abbr */}
                <motion.text
                  x={t.x} y={t.y + 1} textAnchor="middle" dominantBaseline="central"
                  fontSize="10" fontWeight="800" fontFamily="system-ui,sans-serif"
                  fill={breaking ? 'rgba(239,68,68,0.5)' : `${t.color}cc`}
                  initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.08 + 0.05 * i, duration: 0.3 }}
                >{t.abbr}</motion.text>
                {/* Label */}
                <motion.text
                  x={t.x} y={t.y + 37} textAnchor="middle" dominantBaseline="central"
                  fontSize="8" fontWeight="500" fontFamily="system-ui,sans-serif"
                  fill={breaking ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)'}
                  initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.12 + 0.04 * i, duration: 0.4 }}
                >{t.name}</motion.text>
              </motion.g>
            );
          })}
        </motion.svg>

        {/* ── Punchline overlay ── */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            >
              <motion.p
                className="text-base md:text-lg font-semibold text-neutral-300 text-center mb-3"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >{questionText}</motion.p>
              <motion.span
                className="font-black leading-none select-none block"
                style={{ fontSize: 'clamp(5rem, 14vw, 9rem)', color: '#ef4444' }}
                initial={{ scale: 0.3, opacity: 0, filter: 'blur(20px)' }}
                animate={{ scale: 1, opacity: 0.92, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, type: 'spring', stiffness: 75, damping: 11 }}
              >{punchlineText}</motion.span>
              <motion.p
                className="text-neutral-500 text-sm max-w-md text-center mt-3 leading-relaxed px-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >{captionText}</motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
