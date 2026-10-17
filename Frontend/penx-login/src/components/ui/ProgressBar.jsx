import { motion } from 'framer-motion';

/**
 * Gradient progress bar. `value` is 0–100.
 */
export default function ProgressBar({ value = 0 }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
        className="h-full rounded-full bg-gradient-to-r from-blue to-cyan shadow-glow"
      />
    </div>
  );
}
