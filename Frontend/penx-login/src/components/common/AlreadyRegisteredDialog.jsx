import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, X, Lock } from "lucide-react";

export default function AlreadyRegisteredDialog({
  open,
  onClose,
  ownerName,
  ownerEmail,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
          }}
          transition={{
            duration: 0.25,
          }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-red-500/20 bg-[#08111C] shadow-[0_0_80px_rgba(255,0,0,.08)]"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-500/10 blur-[120px]" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:border-red-400 hover:text-red-400"
          >
            <X size={18} />
          </button>

          <div className="relative p-8">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
              <ShieldAlert
                size={40}
                className="text-red-400"
              />
            </div>

            <h2 className="mt-6 text-center text-3xl font-bold text-white">
              USB Already Registered
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-400">
              This USB is already linked to another
              PenX account.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">

              <div className="flex items-center gap-3">
                <Lock
                  size={18}
                  className="text-cyan-400"
                />

                <span className="text-sm font-semibold text-cyan-400">
                  Registered Owner
                </span>
              </div>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Name
                  </p>

                  <p className="mt-1 text-base font-medium text-white">
                    {ownerName || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 text-base font-medium break-all text-white">
                    {ownerEmail || "Unknown"}
                  </p>
                </div>

              </div>

            </div>

            <button
              onClick={onClose}
              className="
                mt-8
                w-full
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500
                to-blue-500
                py-3
                font-semibold
                text-white
                transition
                hover:scale-[1.02]
              "
            >
              Close
            </button>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}