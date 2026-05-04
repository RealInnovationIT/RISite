import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface Step {
  label: string;
  sublabel: string;
}

interface Props {
  steps: Step[];
  loopBackLabel?: string;
  bottomText?: string;
  bottomHighlight?: string;
  className?: string;
}

export function AnimatedDoomLoop({
  steps,
  loopBackLabel = 'Back to step 01. Every single time.',
  bottomText = "More tools don't solve the problem.",
  bottomHighlight = 'Too many tools IS the problem.',
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [activeStep, setActiveStep] = useState(-1);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let step = 0;
    let interval: ReturnType<typeof setInterval>;
    
    const startDelay = setTimeout(() => {
      setActiveStep(0);
      step = 1;
      interval = setInterval(() => {
        const current = step % steps.length;
        setActiveStep(current);
        if (current === 0) setCycleCount((c) => c + 1);
        step++;
      }, 2400);
    }, 600);

    return () => {
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, [isInView, steps.length]);

  return (
    <div ref={ref} className={`flex flex-col items-center ${className}`}>
      {/* Steps as flowing vertical timeline */}
      <div className="relative w-full max-w-lg mx-auto">
        {/* Vertical connector line */}
        <motion.div
          className="absolute left-[19px] top-6 bottom-6 w-px origin-top"
          style={{ background: 'linear-gradient(180deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.3) 20%, rgba(239,68,68,0.3) 80%, rgba(239,68,68,0.05) 100%)' }}
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, i) => {
            const isActive = activeStep === i;
            return (
              <motion.div
                key={i}
                className="relative flex items-start gap-5 py-5 pl-0 pr-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.25, type: 'spring', stiffness: 80, damping: 15 }}
              >
                {/* Node */}
                <div className="relative flex-shrink-0">
                  {/* Pulse ring */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute inset-[-4px] rounded-full"
                        style={{ border: '1.5px solid #ef4444' }}
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Circle */}
                  <motion.div
                    className="relative w-10 h-10 rounded-full flex items-center justify-center border-2 z-10"
                    style={{ backgroundColor: 'rgba(6,10,18,0.9)' }}
                    animate={{
                      borderColor: isActive ? '#ef4444' : 'rgba(255,255,255,0.08)',
                      boxShadow: isActive ? '0 0 20px rgba(239,68,68,0.3)' : '0 0 0 rgba(0,0,0,0)',
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <motion.span
                      className="text-xs font-black"
                      animate={{ color: isActive ? '#ef4444' : 'rgba(255,255,255,0.25)' }}
                      transition={{ duration: 0.3 }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </motion.span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="pt-1.5 min-w-0">
                  <motion.h4
                    className="text-base md:text-lg font-bold leading-tight"
                    animate={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
                    transition={{ duration: 0.4 }}
                  >
                    {step.label}
                  </motion.h4>
                  <motion.p
                    className="text-sm mt-1"
                    animate={{
                      color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                      y: isActive ? 0 : 2,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {step.sublabel}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Loop-back badge */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ delay: 1.8, type: 'spring', stiffness: 80 }}
      >
        <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold backdrop-blur-sm">
          <motion.svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </motion.svg>
          {loopBackLabel}
        </span>
      </motion.div>

      {/* Bottom text */}
      <motion.div
        className="text-center mt-10 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <p className="text-neutral-400 text-base leading-relaxed">{bottomText}</p>
        <p className="text-white text-lg font-bold mt-2">{bottomHighlight}</p>
      </motion.div>
    </div>
  );
}
