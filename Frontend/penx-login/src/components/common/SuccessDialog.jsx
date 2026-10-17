import React from "react";
import { CheckCircle2, Lock, Unlock, X } from "lucide-react";

const SuccessDialog = ({
  open,
  type = "encrypt",
  fileName = "",
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[460px] rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl">

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">

            {type === "encrypt" ? (
              <Lock className="text-cyan-400" size={26} />
            ) : (
              <Unlock className="text-green-400" size={26} />
            )}

            <h2 className="text-xl font-bold">
              PenX Vault
            </h2>

          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex justify-center mb-5">
          <CheckCircle2
            size={60}
            className="text-green-400"
          />
        </div>

        <h3 className="text-center text-2xl font-bold">

          {type === "encrypt"
            ? "Vault Sealed Successfully"
            : "Vault Opened Successfully"}

        </h3>

        <p className="mt-3 text-center text-slate-300">

          {type === "encrypt"
            ? "Your file has been securely encrypted inside PenX Vault."
            : "Your file has been successfully restored and is ready to use."}

        </p>

        <div className="mt-6 rounded-xl bg-slate-800 p-4">
          <p className="text-sm text-slate-400">
            File
          </p>

          <p className="font-semibold break-all">
            {fileName}
          </p>
        </div>

        {type === "encrypt" && (
          <div className="mt-5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">
            <p className="text-sm">
              🔐 AES-256-GCM Encryption
            </p>

            <p className="mt-2 text-sm text-slate-300">
              Keep your Vault Key safe.
              Without the correct Vault Key,
              this file cannot be decrypted.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-black"
          >
            OK
          </button>
        </div>

      </div>
    </div>
  );
};

export default SuccessDialog;