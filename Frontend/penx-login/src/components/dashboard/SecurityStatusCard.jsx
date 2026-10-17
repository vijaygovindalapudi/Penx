import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import IconBadge from '../ui/IconBadge';

export default function SecurityStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
    >
      <GlassCard className="relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-60" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <IconBadge icon={ShieldCheck} tone="cyan" size={22} />
            <div>
              <p className="text-[13px] font-medium tracking-wide text-ink-muted">Security Status</p>
              <div className="mt-0.5 flex items-center gap-2">
                <h3 className="font-display text-[22px] font-semibold tracking-tight text-ink">Protected</h3>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              </div>
              <p className="mt-1 text-[13.5px] text-ink-muted">All systems operating normally.</p>
            </div>
          </div>

          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-line bg-white/[0.03] sm:flex">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShieldCheck size={26} strokeWidth={1.5} className="text-cyan" />
            </motion.div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
