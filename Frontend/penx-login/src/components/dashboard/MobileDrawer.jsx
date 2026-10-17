import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import SidebarContent from './SidebarContent';

/**
 * Slide-in drawer used below the lg breakpoint. Mirrors Sidebar's visual
 * treatment exactly (same surface, border, blur) so switching between
 * rail and drawer never feels like a different product.
 */
export default function MobileDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-surface px-4 py-6 shadow-glow-lg lg:hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-faint transition-colors hover:border-cyan/40 hover:text-cyan"
            >
              <X size={16} strokeWidth={1.85} />
            </button>
            <SidebarContent onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
