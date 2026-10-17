import React from "react";

import ExplorerFileCard from "./ExplorerFileCard";
import ExplorerLoading from "./ExplorerLoading";
import ExplorerEmptyState from "./ExplorerEmptyState";

import {
  filterFiles,
  sortFoldersFirst,
} from "./explorerUtils";

// ==========================================
// PenX Explorer - File List
// ==========================================

const ExplorerFileList = ({
  files,
  loading,
  search,
  selectedFile,
  onOpen,
  onSelect,
  onDelete,
  onRename,
  onRefresh,
  onContextMenu,
}) => {

  // -----------------------
  // Loading
  // -----------------------

  if (loading) {
    return <ExplorerLoading rows={8} />;
  }

  // -----------------------
  // Ensure files is array
  // -----------------------

  const safeFiles = Array.isArray(files)
    ? files
    : [];

  // -----------------------
  // Filter
  // -----------------------

  const filteredFiles = filterFiles(
    safeFiles,
    search
  );

  // -----------------------
  // Folder First Sort
  // -----------------------

  const sortedFiles =
    sortFoldersFirst(filteredFiles);

  // -----------------------
  // Empty State
  // -----------------------

  if (sortedFiles.length === 0) {
    return (
      <ExplorerEmptyState
        title="No files found"
        description="This folder is empty."
        onRefresh={onRefresh}
      />
    );
  }

  // -----------------------
  // Render
  // -----------------------

  return (
    <div className="space-y-3">

      {sortedFiles.map((file, index) => {

        if (!file) return null;

        return (
          <ExplorerFileCard
            key={
              file.fullPath ||
              file.name ||
              index
            }

            file={file}

            selected={
              selectedFile?.fullPath
                ? selectedFile.fullPath === file.fullPath
                : selectedFile?.name === file.name
            }

            onOpen={onOpen}
            onSelect={onSelect}
            onDelete={onDelete}
            onRename={onRename}
            onContextMenu={onContextMenu}
          />
        );

      })}

    </div>
  );
};

export default ExplorerFileList;