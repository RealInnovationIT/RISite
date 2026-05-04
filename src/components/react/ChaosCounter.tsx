import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface Props {
  className?: string;
}

const CHAOS_FACTS = [
  { number: '6.4', label: 'average tools per company', color: '#ef4444' },
  { number: '0', label: 'that talk to each other', color: '#ef4444' },
  { number: '€28K', label: 'wasted per year', color: '#ef4444' },
  { number: '8h', label: 'lost every week', color: '#ef4444' },
];

export function ChaosCounter({ className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CHAOS_FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView]);

  const fact = CHAOS_FACTS[activeIndex];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex flex-col items-center text-center">
        {/* Big animated number */}
        <div className="relative h-24 md:h-32 flex items-center justify-center overflow-hidden">
          <motion.span
            key={activeIndex}
            className="font-black leading-none"
            style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', color: fact.color }}
            initial={{ y: 40, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -40, opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
          >
            {fact.number}
          </motion.span>
        </div>
        {/* Label */}
        <motion.p
          key={`label-${activeIndex}`}
          className="text-neutral-400 text-sm md:text-base mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {fact.label}
        </motion.p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {CHAOS_FACTS.map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              animate={{
                backgroundColor: i === activeIndex ? '#ef4444' : 'rgba(255,255,255,0.15)',
                scale: i === activeIndex ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
