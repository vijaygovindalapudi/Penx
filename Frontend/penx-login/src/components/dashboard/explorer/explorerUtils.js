// ======================================================
// PenX Explorer Utilities
// Common helper functions
// ======================================================

/**
 * Convert bytes into readable size
 * Example:
 * 1024 -> 1 KB
 * 1048576 -> 1 MB
 */
export const formatSize = (bytes) => {
  if (bytes == null || isNaN(bytes)) return "--";

  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
};

/**
 * Format date/time
 */
export const formatDate = (date) => {
  if (!date) return "--";

  return new Date(date).toLocaleString();
};

/**
 * Search by filename
 */
export const filterFiles = (files, search) => {
  if (!search) return files;

  return files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );
};

/**
 * Folder first
 * Then alphabetical
 */
export const sortFoldersFirst = (files) => {
  return [...files].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;

    return a.name.localeCompare(b.name);
  });
};

/**
 * Sort by Name
 */
export const sortByName = (files, asc = true) => {
  return [...files].sort((a, b) =>
    asc
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );
};

/**
 * Sort by Size
 */
export const sortBySize = (files, asc = true) => {
  return [...files].sort((a, b) =>
    asc
      ? (a.size || 0) - (b.size || 0)
      : (b.size || 0) - (a.size || 0)
  );
};

/**
 * Sort by Date
 */
export const sortByDate = (files, asc = true) => {
  return [...files].sort((a, b) => {
    const first = new Date(a.modified || 0).getTime();
    const second = new Date(b.modified || 0).getTime();

    return asc ? first - second : second - first;
  });
};

/**
 * Count folders
 */
export const getFolderCount = (files) =>
  files.filter((file) => file.isDirectory).length;

/**
 * Count files
 */
export const getFileCount = (files) =>
  files.filter((file) => !file.isDirectory).length;

/**
 * Total storage used
 */
export const calculateStorage = (files) => {
  return files.reduce(
    (total, file) => total + (file.size || 0),
    0
  );
};

/**
 * Group file types
 */
export const groupByType = (files) => {
  return files.reduce((groups, file) => {
    const ext = (file.extension || "unknown").toLowerCase();

    if (!groups[ext]) {
      groups[ext] = [];
    }

    groups[ext].push(file);

    return groups;
  }, {});
};