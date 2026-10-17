import {
  Search,
  RefreshCw,
  Upload,
  FolderPlus,
  List,
  LayoutGrid,
} from "lucide-react";

export default function ExplorerToolbar({
  search = "",
  onSearch,
  sortBy = "name",
  onSortChange,
  viewMode = "list",
  onViewChange,
  onRefresh,
  onUpload,
  onNewFolder,
}) {
  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl " +
    "border border-slate-700 bg-slate-900 px-3 py-2.5 " +
    "text-sm text-slate-300 transition " +
    "enabled:hover:border-cyan-500/50 enabled:hover:text-cyan-400 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700 bg-[#111827] p-4">
      <div className="relative min-w-0 basis-full sm:basis-auto sm:flex-1">
        <Search
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="search"
          aria-label="Search files"
          placeholder="Search files..."
          value={search}
          onChange={(event) => onSearch?.(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
        />
      </div>

      <select
        aria-label="Sort files"
        value={sortBy}
        onChange={(event) => onSortChange?.(event.target.value)}
        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
      >
        <option value="name">Name</option>
        <option value="size">Size</option>
        <option value="date">Date modified</option>
      </select>

      <div
        role="group"
        aria-label="File view"
        className="flex gap-1"
      >
        <button
          type="button"
          aria-label="List view"
          aria-pressed={viewMode === "list"}
          onClick={() => onViewChange?.("list")}
          className={`${buttonClass} ${
            viewMode === "list"
              ? "border-cyan-500 text-cyan-400"
              : ""
          }`}
        >
          <List size={17} />
        </button>

        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={viewMode === "grid"}
          onClick={() => onViewChange?.("grid")}
          className={`${buttonClass} ${
            viewMode === "grid"
              ? "border-cyan-500 text-cyan-400"
              : ""
          }`}
        >
          <LayoutGrid size={17} />
        </button>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={typeof onRefresh !== "function"}
        className={buttonClass}
      >
        <RefreshCw size={16} />
        <span>Refresh</span>
      </button>

      <button
        type="button"
        onClick={onNewFolder}
        disabled={typeof onNewFolder !== "function"}
        className={buttonClass}
      >
        <FolderPlus size={16} />
        <span>New Folder</span>
      </button>

      <button
        type="button"
        onClick={onUpload}
        disabled={typeof onUpload !== "function"}
        className={buttonClass}
      >
        <Upload size={16} />
        <span>Upload</span>
      </button>
    </div>
  );
}