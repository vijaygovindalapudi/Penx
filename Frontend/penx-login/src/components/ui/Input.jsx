import { useId, useState } from 'react';

/**
 * Glass-styled text input with floating label and optional icon / trailing action.
 *
 * Props:
 * - label: string
 * - type: string (defaults to 'text')
 * - icon: Lucide icon component
 * - trailing: optional node rendered at the right (e.g. show/hide password button)
 * - value, onChange, placeholder, autoComplete, required
 */
export default function Input({
  label,
  type = 'text',
  icon: Icon,
  trailing,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  name,
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-ink-muted tracking-wide"
      >
        {label}
      </label>

      <div
        className={`group relative flex items-center rounded-xl border bg-white/[0.03] backdrop-blur-sm transition-colors duration-200 ${
          focused
            ? 'border-cyan/60 shadow-[0_0_0_3px_rgba(34,211,238,0.12)]'
            : 'border-line hover:border-white/20'
        }`}
      >
        {Icon && (
          <Icon
            size={17}
            strokeWidth={1.75}
            className={`ml-3.5 shrink-0 transition-colors ${
              focused ? 'text-cyan' : 'text-ink-faint'
            }`}
          />
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="peer w-full bg-transparent px-3.5 py-3 text-[14.5px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
        {trailing && <div className="mr-2.5 shrink-0">{trailing}</div>}
      </div>
    </div>
  );
}
