import { motion } from 'framer-motion';

/** Official Google "G" mark, rendered at native colors. */
function GoogleIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/**
 * Secondary action button — same rounded/shadow/motion language as the
 * primary CTA, but glass-outlined rather than gradient-filled so it reads
 * as an alternate path, not a competing primary action. UI only, no auth.
 */
export default function GoogleButton({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-[14.5px] font-medium text-ink backdrop-blur-sm transition-all duration-300 hover:border-cyan/40 hover:bg-white/[0.05] hover:shadow-glow"
    >
      <GoogleIcon />
      <span>Continue with Google</span>
    </motion.button>
  );
}
