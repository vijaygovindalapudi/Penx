import React from "react";
import { Trash2, Pencil } from "lucide-react";
import { formatDate, formatSize } from "./explorerUtils";
import {
  getFileIcon,
  getFileIconColor,
  getIconBackground,
} from "./fileIcons";

// ======================================================
// PenX Explorer - File Card
// ======================================================

const ExplorerFileCard = ({
  file,
  selected,
  onOpen,
  onSelect,
  onDelete,
  onRename,
  viewMode,
  onContextMenu,
}) => {

  const Icon = getFileIcon(file);

  // ======================================================
  // Handlers
  // ======================================================

  const handleDoubleClick = () => {
  console.log("Double Click:", file);

  if (onOpen) {
    onOpen(file);
  }
};

  const handleClick = () => {
  console.log("Click:", file);

  if (onSelect) {
    onSelect(file);
  }
};

  const handleDelete = (e) => {
    e.stopPropagation();

    if (onDelete) {
      onDelete(file);
    }
  };

  const handleRename = (e) => {
    e.stopPropagation();

    if (onRename) {
      onRename(file);
    }
  };

  // ======================================================
  // Render
  // ======================================================

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu?.(e, file)}
      className={`
        flex items-center justify-between
        rounded-xl
        border
        px-5
        py-4
        cursor-pointer
        transition-all
        duration-200

        ${
          selected
            ? "border-cyan-500 bg-cyan-500/10"
            : "border-slate-700 bg-[#0F172A] hover:border-cyan-500 hover:bg-slate-800"
        }
      `}
    >
      {/* Left */}
      <div className="flex items-center gap-4">

        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            ${getIconBackground(file)}
          `}
        >
          <Icon
            size={24}
            className={getFileIconColor(file)}
          />
        </div>

        <div>
          <h3 className="break-all font-semibold text-white">
            {file.name}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {formatDate(file.modified)}
          </p>
        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        <div className="text-right">

          <div className="text-sm font-medium text-slate-200">
            {file.isDirectory
              ? "Folder"
              : formatSize(file.size)}
          </div>

          {!file.isDirectory && (
            <div className="mt-1 text-xs uppercase text-slate-500">
              {file.extension || "--"}
            </div>
          )}

        </div>

        {/* Rename */}

        <button
          onClick={handleRename}
          className="
            rounded-lg
            p-2
            text-cyan-400
            transition
            hover:bg-cyan-500/10
            hover:text-cyan-300
          "
          title="Rename"
        >
          <Pencil size={18} />
        </button>

        {/* Delete */}

        <button
          onClick={handleDelete}
          className="
            rounded-lg
            p-2
            text-red-400
            transition
            hover:bg-red-500/10
            hover:text-red-300
          "
          title="Delete"
        >
          <Trash2 size={18} />
        </button>

      </div>

    </div>
  );
};

export default ExplorerFileCard;