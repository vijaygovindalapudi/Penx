import React from "react";
import {
  Home,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

// ======================================================
// PenX Explorer - Breadcrumb Navigation
// ======================================================

const ExplorerBreadcrumb = ({
  driveLetter = "",
  currentPath = "",
  onHome,
  onBack,
  onNavigate,
}) => {
  // Convert current path into parts
  const pathParts = currentPath
    ? currentPath.split("\\").filter(Boolean)
    : [];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700 bg-[#111827] p-4">

      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!currentPath}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-700
          bg-[#0F172A]
          text-slate-300
          transition
          hover:border-cyan-500
          hover:text-white
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ArrowLeft size={18} />
      </button>

      {/* Home */}
      <button
        onClick={onHome}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-slate-700
          bg-[#0F172A]
          px-4
          py-2
          text-slate-300
          transition
          hover:border-cyan-500
          hover:text-white
        "
      >
        <Home size={18} />
        Home
      </button>

      {/* Drive */}
      <ChevronRight
        size={18}
        className="text-slate-500"
      />

      <button
        onClick={() => onNavigate?.("")}
        className="
          rounded-lg
          px-2
          py-1
          text-cyan-400
          transition
          hover:text-cyan-300
        "
      >
        {driveLetter || "USB"}
      </button>

      {/* Folder Path */}
      {pathParts.map((folder, index) => {
        const targetPath = pathParts
          .slice(0, index + 1)
          .join("\\");

        return (
          <React.Fragment key={targetPath}>

            <ChevronRight
              size={18}
              className="text-slate-500"
            />

            <button
              onClick={() =>
                onNavigate?.(targetPath)
              }
              className="
                rounded-lg
                px-2
                py-1
                text-slate-300
                transition
                hover:text-white
              "
            >
              {folder}
            </button>

          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ExplorerBreadcrumb;