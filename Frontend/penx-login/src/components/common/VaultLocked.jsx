import { ShieldX, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function VaultLocked({
  ownerName,
  ownerEmail,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex h-full items-center justify-center"
    >
      <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-900/70 p-8 backdrop-blur-xl">

        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/15 p-5">
            <ShieldX
              size={42}
              className="text-red-400"
            />
          </div>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold text-white">
          PenX Vault Locked
        </h2>

        <p className="mt-3 text-center text-slate-400">
          This USB is already registered to another PenX account.
        </p>

        <div className="mt-8 rounded-2xl bg-slate-800/70 p-5">

          <div className="mb-2 flex items-center gap-2">

            <Lock
              size={18}
              className="text-cyan-400"
            />

            <span className="font-medium text-white">
              Registered Owner
            </span>

          </div>

          <p className="text-slate-300">
            {ownerName}
          </p>

          <p className="text-slate-400 text-sm">
            {ownerEmail}
          </p>

        </div>

        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

          <p className="text-center text-sm text-red-300">

            Access denied.

            <br />

            Only the registered PenX owner
            can access this vault.

          </p>

        </div>

      </div>
    </motion.div>
  );
}