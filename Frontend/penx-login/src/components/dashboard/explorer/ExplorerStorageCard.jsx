import React from "react";
import {
  HardDrive,
  FolderOpen,
  FileText,
  Database,
} from "lucide-react";

import {
  formatSize,
  calculateStorage,
  getFolderCount,
  getFileCount,
} from "./explorerUtils";

// ======================================================
// PenX Explorer - Storage Card
// ======================================================

const ExplorerStorageCard = ({
  files = [],
  totalCapacity = 0,
}) => {

  const usedSpace = calculateStorage(files);
  const freeSpace = Math.max(
    totalCapacity - usedSpace,
    0
  );

  const usage =
    totalCapacity > 0
      ? (usedSpace / totalCapacity) * 100
      : 0;

  return (
    <div className="mb-6 rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-lg">

      {/* Header */}

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">

          <Database
            size={24}
            className="text-cyan-400"
          />

        </div>

        <div>

          <h3 className="text-xl font-bold text-white">
            Storage Overview
          </h3>

          <p className="text-sm text-slate-400">
            USB storage statistics
          </p>

        </div>

      </div>

      {/* Progress */}

      <div>

        <div className="mb-2 flex justify-between text-sm">

          <span className="text-slate-400">
            Used Space
          </span>

          <span className="font-medium text-white">
            {formatSize(usedSpace)}
            {" / "}
            {totalCapacity
              ? formatSize(totalCapacity)
              : "--"}
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-700">

          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-700"
            style={{
              width: `${Math.min(usage,100)}%`,
            }}
          />

        </div>

      </div>

      {/* Stats */}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Total */}

        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">

          <HardDrive
            className="mb-3 text-cyan-400"
            size={22}
          />

          <p className="text-xs uppercase text-slate-500">
            Capacity
          </p>

          <p className="mt-2 font-semibold text-white">
            {totalCapacity
              ? formatSize(totalCapacity)
              : "--"}
          </p>

        </div>

        {/* Used */}

        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">

          <Database
            className="mb-3 text-orange-400"
            size={22}
          />

          <p className="text-xs uppercase text-slate-500">
            Used
          </p>

          <p className="mt-2 font-semibold text-white">
            {formatSize(usedSpace)}
          </p>

        </div>

        {/* Folders */}

        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">

          <FolderOpen
            className="mb-3 text-yellow-400"
            size={22}
          />

          <p className="text-xs uppercase text-slate-500">
            Folders
          </p>

          <p className="mt-2 font-semibold text-white">
            {getFolderCount(files)}
          </p>

        </div>

        {/* Files */}

        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">

          <FileText
            className="mb-3 text-emerald-400"
            size={22}
          />

          <p className="text-xs uppercase text-slate-500">
            Files
          </p>

          <p className="mt-2 font-semibold text-white">
            {getFileCount(files)}
          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-6 flex justify-between text-sm">

        <span className="text-slate-400">
          Free Space
        </span>

        <span className="font-medium text-emerald-400">
          {formatSize(freeSpace)}
        </span>

      </div>

    </div>
  );
};

export default ExplorerStorageCard;