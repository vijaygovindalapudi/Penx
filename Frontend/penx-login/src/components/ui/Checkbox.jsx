import { Check } from 'lucide-react';

/**
 * Minimal glass checkbox. Controlled via checked / onChange.
 */
export default function Checkbox({ checked, onChange, label, id = 'checkbox' }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-line bg-white/[0.03] transition-all duration-150 peer-checked:border-cyan peer-checked:bg-cyan/90 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan/50"
      >
        <Check
          size={12.5}
          strokeWidth={3}
          className={`text-void transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
        />
      </span>
      <span className="text-[13.5px] text-ink-muted">{label}</span>
    </label>
  );
}
