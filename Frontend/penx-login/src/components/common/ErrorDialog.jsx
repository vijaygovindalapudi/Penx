import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorDialog = ({
  open,
  title = "Error",
  message = "",
  onClose,
}) => {
  if (!open) return null;

  return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[420px] rounded-2xl border border-red-700 bg-slate-900 p-6 text-white shadow-2xl">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <AlertCircle
              size={28}
              className="text-red-500"
            />

            <h2 className="text-xl font-bold text-red-400">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-white"
          >
            <X size={22} />
          </button>

        </div>
                {/* Message */}
        <div className="rounded-xl border border-red-800 bg-red-950/30 p-4">

          <p className="leading-7 text-slate-300">
            {message}
          </p>

        </div>
                {/* Footer */}
        <div className="mt-6 flex justify-end">

          <button
            onClick={onClose}
            className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-500"
          >
            OK
          </button>

        </div>
              </div>
    </div>
  );
};

export default ErrorDialog;