import { child } from "./security/pathPolicy.js";
// =======================================================
// PenX USB File System
// File: electron/usbFileSystem.js
// =======================================================

import fs from "fs";
import path from "path";

/**
 * Normalize Windows drive path
 * Example:
 * D:  -> D:\
 * D:\ -> D:\
 */
function normalizeDrive(driveLetter) {
  if (!driveLetter) {
    throw new Error("Drive letter is required.");
  }

  return driveLetter.endsWith("\\")
    ? driveLetter
    : driveLetter + "\\";
}

/**
 * Prevent path traversal.
 */
function safePath(basePath, subPath = "") {
  return child(basePath, subPath);
}

/**
 * Read USB directory.
 *
 * @param {string} driveLetter
 * @param {string} subPath
 * @returns {Array}
 */
export function readUSBDirectory(driveLetter, subPath = "") {
  const driveRoot = normalizeDrive(driveLetter);

  if (!fs.existsSync(driveRoot)) {
    throw new Error(`Drive not found: ${driveRoot}`);
  }

  const currentPath = safePath(driveRoot, subPath);

  const entries = fs.readdirSync(currentPath, {
    withFileTypes: true,
  });

  return entries.filter(entry => !entry.isSymbolicLink()).map((entry) => {
    const fullPath = path.join(currentPath, entry.name);

    let stats = {
      size: 0,
      birthtime: null,
      mtime: null,
    };

    try {
      stats = fs.statSync(fullPath);
    } catch {}

    return {
      name: entry.name,

      fullPath,

      relativePath: path.relative(driveRoot, fullPath),

      isDirectory: entry.isDirectory(),

      extension: entry.isDirectory()
        ? ""
        : path.extname(entry.name).replace(".", ""),

      size: entry.isDirectory()
        ? null
        : stats.size,

      created: stats.birthtime,

      modified: stats.mtime,
    };
  });
}

/**
 * Check whether path exists.
 */
export function pathExists(driveLetter, subPath = "") {
  const driveRoot = normalizeDrive(driveLetter);

  const target = safePath(driveRoot, subPath);

  return fs.existsSync(target);
}

/**
 * Read one file information.
 */
export function getFileInfo(fullPath) {
  const stats = fs.statSync(fullPath);

  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isDirectory: stats.isDirectory(),
  };
}