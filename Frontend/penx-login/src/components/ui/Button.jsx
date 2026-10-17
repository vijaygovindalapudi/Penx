import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Primary Button
 */
export default function Button({
  children,
  loading = false,
  disabled = false,
  type = "button",
  onClick,
}) {
  const isDisabled = loading || disabled;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      whileHover={!isDisabled ? { y: -1 } : {}}
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue to-cyan px-4 py-3 text-[14.5px] font-semibold text-void shadow-glow transition-shadow duration-300 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <Loader2
          size={16}
          className="animate-spin"
        />
      )}

      <span>
        {loading ? "Loading..." : children}
      </span>
    </motion.button>
  );
}