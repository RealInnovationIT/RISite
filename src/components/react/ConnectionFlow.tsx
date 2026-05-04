import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface Props {
  centerLabel?: string;
  className?: string;
  systemNames?: string[];
}

export function ConnectionFlow({ centerLabel = 'Leaf', className = '', systemNames }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'connected'>('idle');

  const systems = systemNames || ['ERP', 'HR', 'CRM', 'Accounting', 'Invoicing', 'Analytics'];

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setPhase('connecting'), 400);
    const t2 = setTimeout(() => setPhase('connected'), 400 + systems.length * 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView, systems.length]);

  const S = 400;
  const C = S / 2; // center
  const HR = 44;   // hub radius
  const OR = 148;  // orbit radius
  const NR = 28;   // node radius

  const nodes = systems.map((name, i) => {
    const a = (i * 2 * Math.PI) / systems.length - Math.PI / 2;
    return { x: C + OR * Math.cos(a), y: C + OR * Math.sin(a), name };
  });

  const active = phase === 'connecting' || phase === 'connected';

  return (
    <div ref={ref} className={`flex justify-center ${className}`}>
      <div className="relative w-full max-w-[380px] aspect-square">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full h-full">
          <defs>
            {/* Glow for center hub */}
            <filter id="cf-hub-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Glow for data pulses */}
            <filter id="cf-pulse" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Leaf fill — radial, high opacity */}
            <radialGradient id="cf-leaf-grad" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.75" />
            </radialGradient>
            {/* Radial background glow */}
            <radialGradient id="cf-bg-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background glow */}
          <motion.circle
            cx={C} cy={C} r={OR * 0.6} fill="url(#cf-bg-glow)"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Subtle orbit track */}
          <circle cx={C} cy={C} r={OR} fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth={1} strokeDasharray="4 8" />

          {/* ── Connection lines ── */}
          {nodes.map((n, i) => {
            const delay = i * 0.25;
            return (
              <g key={`conn-${i}`}>
                {/* Dim track */}
                <line x1={C} y1={C} x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.025)" strokeWidth={1} />

                {/* Animated connection */}
                <motion.line
                  x1={C} y1={C} x2={n.x} y2={n.y}
                  stroke="#10b981" strokeWidth={2} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={active ? { pathLength: 1, opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.7, delay, ease: 'easeOut' }}
                />

                {/* Data flow dashes (continuous) */}
                {phase === 'connected' && (
                  <motion.line
                    x1={C} y1={C} x2={n.x} y2={n.y}
                    stroke="#10b981" strokeWidth={1} strokeDasharray="3 10" strokeLinecap="round"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: [-26, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', delay: i * 0.25 }}
                    opacity={0.25}
                  />
                )}

                {/* Outgoing pulse: center → node */}
                {phase === 'connected' && (
                  <motion.circle
                    r={4} fill="#10b981" filter="url(#cf-pulse)"
                    initial={{ opacity: 0 }}
                    animate={{ cx: [C, n.x], cy: [C, n.y], opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 1.8, delay: i * 0.45,
                      repeat: Infinity, repeatDelay: systems.length * 0.45 - 1.8 + 1.2,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                {/* Return pulse: node → center */}
                {phase === 'connected' && (
                  <motion.circle
                    r={3} fill="#34d399" filter="url(#cf-pulse)"
                    initial={{ opacity: 0 }}
                    animate={{ cx: [n.x, C], cy: [n.y, C], opacity: [0, 0.85, 0.85, 0] }}
                    transition={{
                      duration: 1.8, delay: i * 0.45 + 1.0,
                      repeat: Infinity, repeatDelay: systems.length * 0.45 - 1.8 + 1.2,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* ── Pulse rings from center ── */}
          {phase === 'connected' && [0, 1, 2].map(r => (
            <motion.circle
              key={`ring-${r}`} cx={C} cy={C} r={HR}
              fill="none" stroke="#10b981" strokeWidth={1}
              initial={{ scale: 1, opacity: 0.35 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 3.2, delay: r * 1.05, repeat: Infinity, ease: 'easeOut' }}
              style={{ transformOrigin: `${C}px ${C}px` }}
            />
          ))}

          {/* ── Center hub ── */}
          {/* Outer subtle ring */}
          <motion.circle
            cx={C} cy={C} r={HR + 7} fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth={1}
            initial={{ scale: 0 }} animate={inView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: 'spring', bounce: 0.35, delay: 0.1 }}
            style={{ transformOrigin: `${C}px ${C}px` }}
          />
          {/* Hub circle */}
          <motion.circle
            cx={C} cy={C} r={HR}
            fill="rgba(10,40,30,0.85)" stroke="#10b981" strokeWidth={2.5}
            filter="url(#cf-hub-glow)"
            initial={{ scale: 0 }} animate={inView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: 'spring', bounce: 0.45, delay: 0.15 }}
            style={{ transformOrigin: `${C}px ${C}px` }}
          />

          {/* ── Leaf logo icon ── */}
          {/* Static <g> handles positioning; motion.g inside handles only scale animation */}
          <g transform={`translate(${C}, ${C - 1})`}>
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              {/* Use user-supplied SVG from public folder */}
              <image
                href="/leaf-logo.svg"
                x={-28}
                y={-28}
                width={56}
                height={56}
                preserveAspectRatio="xMidYMid meet"
                style={{ pointerEvents: 'none' }}
              />
            </motion.g>
          </g>

          {/* "LEAF" label below hub */}
          <motion.text
            x={C} y={C + HR + 17}
            textAnchor="middle" dominantBaseline="central"
            fontSize="10" fontWeight="800" fontFamily="system-ui,sans-serif"
            fill="#10b981" letterSpacing="0.14em"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 0.6 } : { opacity: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >{centerLabel.toUpperCase()}</motion.text>

          {/* ── Outer nodes ── */}
          {nodes.map((n, i) => {
            const delay = 0.12 + i * 0.1;
            return (
              <g key={`node-${i}`}>
                {/* Soft glow behind */}
                {active && (
                  <motion.circle
                    cx={n.x} cy={n.y} r={NR + 6}
                    fill="rgba(16,185,129,0.04)"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.3, duration: 0.5 }}
                  />
                )}
                {/* Circle */}
                <motion.circle
                  cx={n.x} cy={n.y} r={NR}
                  fill={active ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)'}
                  stroke={active ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth={1.5}
                  initial={{ scale: 0 }} animate={inView ? { scale: 1 } : { scale: 0 }}
                  transition={{ type: 'spring', delay, stiffness: 140, damping: 13 }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                />
                {/* Label */}
                <motion.text
                  x={n.x} y={n.y + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill={active ? '#10b981' : 'rgba(255,255,255,0.22)'}
                  fontSize="9.5" fontWeight="700" fontFamily="system-ui,sans-serif"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: delay + 0.2, duration: 0.4 }}
                >{n.name}</motion.text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
