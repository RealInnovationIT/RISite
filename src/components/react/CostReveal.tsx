import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface StatItem {
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color?: string;
}

interface Props {
  stats: StatItem[];
  className?: string;
}

function AnimatedNumber({ end, duration = 2000, prefix = '', suffix = '' }: {
  end: number; duration?: number; prefix?: string; suffix?: string;
}) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * end);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  const display = Number.isInteger(end)
    ? `${prefix}${Math.round(current)}${suffix}`
    : `${prefix}${current.toFixed(1)}${suffix}`;

  return <span ref={ref}>{display}</span>;
}

export function CostReveal({ stats, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-60px' });

  return (
    <div ref={containerRef} className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 ${className}`}>
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          className="relative text-center py-8 px-4 rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden group"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: i * 0.15, type: 'spring', stiffness: 70, damping: 14 }}
        >
          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${stat.color || '#10b981'}50, transparent)` }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
          />

          {/* Background glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${stat.color || '#10b981'}08 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.4 + i * 0.2 }}
          />

          {/* Number */}
          <div className="relative">
            <motion.div
              className="text-5xl md:text-6xl lg:text-7xl font-black tabular-nums leading-none"
              style={{ color: stat.color || '#ffffff' }}
              initial={{ scale: 0.7, opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { scale: 1, opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, type: 'spring', stiffness: 80 }}
            >
              {stat.numericValue !== undefined ? (
                <AnimatedNumber
                  end={stat.numericValue}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={1800 + i * 200}
                />
              ) : (
                stat.value
              )}
            </motion.div>
          </div>

          {/* Label */}
          <motion.p
            className="text-neutral-400 text-sm mt-4 leading-relaxed max-w-[200px] mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
          >
            {stat.label}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}
