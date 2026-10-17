import React from "react";
import { FolderOpen, RefreshCw } from "lucide-react";

// ======================================================
// PenX Explorer - Empty Folder State
// ======================================================

const ExplorerEmptyState = ({
  title = "This folder is empty",
  description = "No files or folders were found in this location.",
  onRefresh,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#0F172A] py-20">

      {/* Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10">
        <FolderOpen
          size={52}
          className="text-cyan-400"
        />
      </div>

      {/* Title */}
      <h3 className="mt-6 text-2xl font-semibold text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-3 max-w-md text-center text-sm leading-6 text-slate-400">
        {description}
      </p>

      {/* Refresh Button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="mt-8 flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-cyan-700 hover:shadow-lg"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      )}
    </div>
  );
};

export default ExplorerEmptyState;