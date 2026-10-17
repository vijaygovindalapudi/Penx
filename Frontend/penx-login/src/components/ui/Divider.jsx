/**
 * Hairline divider with a centered label, e.g. "OR" between the primary
 * action and an alternate sign-in method.
 */
export default function Divider({ label = 'OR' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[11.5px] font-medium tracking-widest text-ink-faint">
        {label}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
