import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const MESSAGES = [
  'AES-256 · DEVICE KEY VERIFIED',
  'CLOUD VAULT · SYNC INTEGRITY OK',
  'ZERO-KNOWLEDGE · SESSION SEALED',
];

const HEX = '0123456789ABCDEF';

function scrambledLike(target) {
  return target
    .split('')
    .map((ch) => (ch === ' ' || ch === '·' ? ch : HEX[Math.floor(Math.random() * HEX.length)]))
    .join('');
}

/**
 * The page's signature moment: concentric rotating key-rings around a
 * shield, with a cipher string that scrambles then decrypts into a real
 * status line. Stands in for PenX's core promise — data that resolves
 * from noise into something verified and readable, only for the right key.
 */
export default function CipherStream() {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(scrambledLike(MESSAGES[0]));

  useEffect(() => {
    const target = MESSAGES[index];
    let frame = 0;
    const totalFrames = 14;

    const interval = setInterval(() => {
      frame += 1;
      if (frame >= totalFrames) {
        setDisplay(target);
        clearInterval(interval);
        setTimeout(() => setIndex((i) => (i + 1) % MESSAGES.length), 2600);
        return;
      }
      const revealCount = Math.floor((frame / totalFrames) * target.length);
      const resolved = target.slice(0, revealCount);
      const rest = scrambledLike(target.slice(revealCount));
      setDisplay(resolved + rest);
    }, 55);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-cyan/10 blur-2xl" />
        <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-cyan/25" />
        <div className="absolute inset-6 animate-spin-slow-reverse rounded-full border border-dashed border-blue/30" />
        <div className="absolute inset-12 rounded-full border border-line" />

        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-line bg-white/[0.04] backdrop-blur-xl">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShieldCheck size={30} strokeWidth={1.5} className="text-cyan" />
          </motion.div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white/[0.02] px-4 py-2">
        <span className="font-mono text-[11.5px] tracking-wider text-cyan/90">{display}</span>
      </div>
    </div>
  );
}
