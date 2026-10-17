import React from "react";

// ======================================================
// PenX Explorer - Loading Skeleton
// ======================================================

const ExplorerLoading = ({ rows = 6 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse flex items-center justify-between rounded-xl border border-slate-700 bg-[#0F172A] px-5 py-4"
        >
          {/* Left */}
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="h-11 w-11 rounded-lg bg-slate-700" />

            {/* Text */}
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-slate-700" />
              <div className="h-3 w-32 rounded bg-slate-800" />
            </div>
          </div>

          {/* Right */}
          <div className="space-y-2 text-right">
            <div className="h-4 w-16 rounded bg-slate-700" />
            <div className="h-3 w-12 rounded bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExplorerLoading;