import { NavLink } from 'react-router-dom';

/**
 * One sidebar navigation entry. Active state picks up the same
 * cyan/glass language used across the auth pages.
 */
export default function NavItem({ to, icon: Icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
          isActive
            ? 'border border-cyan/30 bg-cyan/[0.08] text-ink shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
            : 'border border-transparent text-ink-muted hover:bg-white/[0.04] hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            strokeWidth={1.85}
            className={`shrink-0 transition-colors ${isActive ? 'text-cyan' : 'text-ink-faint group-hover:text-cyan/80'}`}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
