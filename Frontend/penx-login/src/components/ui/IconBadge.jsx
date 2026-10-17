/**
 * Rounded glass icon badge used as the leading visual in dashboard cards.
 * `tone` swaps the icon/glow color while keeping the same shape language.
 */
const TONES = {
  cyan: 'text-cyan border-cyan/25 bg-cyan/[0.08]',
  emerald: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/[0.08]',
};

export default function IconBadge({ icon: Icon, tone = 'cyan', size = 20 }) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm ${TONES[tone]}`}>
      <Icon size={size} strokeWidth={1.75} />
    </div>
  );
}
