import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ProfilePage from "./ProfilePage";

export default function ProfileDrawer({
  open,
  onClose,
  user,
  devices = [],
  vaultLocked,
  onLockVault,
}) {

  // Lock Body Scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC Key Close
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="
              fixed
              inset-0
              z-[9998]
              bg-[#020617]/70
              backdrop-blur-xl
            "
          />

          {/* Drawer */}

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              fixed
              right-0
              top-0
              z-[9999]
              flex
              h-screen
              w-full
              max-w-[760px]
              flex-col
              overflow-hidden
              rounded-l-[32px]
              border-l
              border-cyan-500/20
              bg-gradient-to-b
              from-[#07111E]
              via-[#091626]
              to-[#0B1324]
              shadow-[0_0_80px_rgba(34,211,238,0.12)]
            "
          >
            {/* Glow */}

            <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />

            {/* Header */}

            <div
              className="
                relative
                flex
                items-center
                justify-between
                border-b
                border-slate-800
                px-8
                py-7
              "
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">
                  PENX
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  Digital Identity
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Your trusted identity, devices and vault.
                </p>
              </div>

              <button
                onClick={onClose}
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900/50
                  text-slate-400
                  transition-all
                  duration-300
                  hover:rotate-90
                  hover:border-cyan-400
                  hover:text-cyan-400
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}

            <div
              className="
                relative
                flex-1
                overflow-y-auto
                px-8
                py-8
              "
            >
              <ProfilePage
                user={user}
                devices={devices}
                vaultLocked={vaultLocked}
                onLockVault={onLockVault}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}