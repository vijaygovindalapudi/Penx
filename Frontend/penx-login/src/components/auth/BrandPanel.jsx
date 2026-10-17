import { motion } from 'framer-motion';
import { Cpu, Lock, RotateCw } from 'lucide-react';
import Logo from './Logo';
import CipherStream from './CipherStream';
import GlassCard from '../ui/GlassCard';

const STATS = [
  { icon: Lock, label: 'AES-256 client-side' },
  { icon: Cpu, label: 'Hardware-bound keys' },
  { icon: RotateCw, label: 'Cross-device recovery' },
];

export default function BrandPanel() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-surface p-12 lg:flex lg:w-[52%]">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Logo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 flex flex-1 items-center justify-center"
      >
        <CipherStream />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 max-w-md"
      >
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-ink">
          Your data, encrypted before it ever leaves your hand.
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">
          PenX turns any USB drive into a hardware-bound vault — encrypted on-device,
          mirrored to the cloud, and recoverable only with your key.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {STATS.map(({ icon: Icon, label }) => (
            <GlassCard key={label} className="!rounded-full px-3.5 py-2">
              <div className="flex items-center gap-2">
                <Icon size={13} strokeWidth={2} className="text-cyan" />
                <span className="font-mono text-[11.5px] text-ink-muted">{label}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
