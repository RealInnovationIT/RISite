import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface Benefit {
  icon: string; // SVG path
  title: string;
  metric: string;
  metricLabel: string;
  color: string;
}

interface Props {
  benefits: Benefit[];
  className?: string;
}

function AnimatedMetric({ value, color, inView }: { value: string; color: string; inView: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <motion.span
      className="font-black text-3xl md:text-4xl block"
      style={{ color }}
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={show ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      {value}
    </motion.span>
  );
}

export function ImpactMetrics({ benefits, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-60px' });

  return (
    <div ref={containerRef} className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {benefits.map((benefit, i) => (
        <motion.div
          key={i}
          className="relative rounded-2xl overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: i * 0.15, type: 'spring', stiffness: 70 }}
        >
          {/* Background */}
          <div className="relative p-8 bg-neutral-900/60 border border-white/5 rounded-2xl h-full backdrop-blur-sm">
            {/* Top gradient line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${benefit.color}60, transparent)` }}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
            />

            {/* Icon with animated glow */}
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative"
              style={{ background: `${benefit.color}12`, border: `1px solid ${benefit.color}25` }}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ type: 'spring', delay: 0.2 + i * 0.1, stiffness: 150, damping: 12 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={benefit.color} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
              </svg>
              {/* Pulse behind icon */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ border: `1px solid ${benefit.color}` }}
                animate={isInView ? { scale: [1, 1.4, 1.4], opacity: [0.4, 0, 0] } : {}}
                transition={{ duration: 2, delay: 1 + i * 0.3, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>

            {/* Metric - the visual WOW */}
            <div className="mb-3">
              <AnimatedMetric value={benefit.metric} color={benefit.color} inView={isInView} />
              <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider mt-1 block">
                {benefit.metricLabel}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>

            {/* Animated bar visualization */}
            <div className="mt-4 relative h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, ${benefit.color}, ${benefit.color}80)` }}
                initial={{ width: '0%' }}
                animate={isInView ? { width: '100%' } : { width: '0%' }}
                transition={{ duration: 1.5, delay: 0.8 + i * 0.2, ease: 'easeOut' }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-y-0 w-20 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                initial={{ left: '-20%' }}
                animate={isInView ? { left: '120%' } : { left: '-20%' }}
                transition={{ duration: 1, delay: 2 + i * 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
