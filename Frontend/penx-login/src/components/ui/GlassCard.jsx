/**
 * Base glassmorphism panel used for the auth card and stat chips.
 */
export default function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white/[0.03] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
