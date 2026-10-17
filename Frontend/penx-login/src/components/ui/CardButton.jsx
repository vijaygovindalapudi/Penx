import { motion } from "framer-motion";

export default function CardButton({
  children,
  icon: Icon,
  onClick,
  full = true,
  disabled = false,
  type = "button",
  className = "",
}) {
  return (
    <motion.button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { y: -1 }}
      className={`
        flex items-center justify-center gap-2
        rounded-xl border border-line
        bg-white/[0.03] px-4 py-2.5
        text-[13.5px] font-medium text-ink
        backdrop-blur-sm
        transition-all duration-300
        enabled:hover:border-cyan/40
        enabled:hover:bg-white/[0.06]
        enabled:hover:shadow-glow
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${full ? "w-full" : ""}
        ${className}
      `}
    >
      {Icon && (
        <Icon
          size={15}
          strokeWidth={1.9}
          className="shrink-0 text-cyan"
          aria-hidden="true"
        />
      )}

      <span>{children}</span>
    </motion.button>
  );
}