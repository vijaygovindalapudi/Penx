import React, { useEffect, useRef, useState } from "react";

const RenameModal = ({
  open,
  currentName = "",
  createFolderMode = false,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    if (createFolderMode) {
      setNewName("");
    } else {
      setNewName(currentName);
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();

        if (!createFolderMode) {
          inputRef.current.select();
        }
      }
    }, 0);

  }, [open, createFolderMode, currentName]);

  if (!open) return null;

  const handleSubmit = () => {
    const value = newName.trim();

    console.log("Submitted Value:", value);

    if (!value) {
      alert(
        createFolderMode
          ? "Please enter a folder name."
          : "Please enter a file name."
      );
      return;
    }

    onRename(value);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[420px] rounded-2xl border border-cyan-500/20 bg-[#0F172A] p-6 shadow-2xl">

        <h2 className="mb-5 text-xl font-bold text-white">
          {createFolderMode ? "Create New Folder" : "Rename"}
        </h2>

        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          placeholder={
            createFolderMode
              ? "Enter folder name..."
              : "Enter new name..."
          }
          className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-4 py-2 text-gray-300 hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-black hover:bg-cyan-400"
          >
            {createFolderMode ? "Create" : "Rename"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RenameModal;