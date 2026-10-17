// ======================================================
// PenX Explorer
// File Icons & Colors
// ======================================================

import {
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  FileCode,
  FileSpreadsheet,
  FileType,
  Presentation,
} from "lucide-react";

// ======================================================
// Returns icon component based on file type
// ======================================================

export const getFileIcon = (item) => {
  if (!item) {
    return File;
  }

  if (item.isDirectory) {
    return Folder;
  }

  const ext = (item.extension || "").toLowerCase();

  // Images
  if (["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg", "ico"].includes(ext))
    return Image;

  // Videos
  if (["mp4", "avi", "mov", "mkv", "wmv", "flv", "webm"].includes(ext))
    return Video;

  // Audio
  if (["mp3", "wav", "aac", "ogg", "flac", "m4a"].includes(ext))
    return Music;

  // PDF / Documents
  if (["pdf"].includes(ext))
    return FileText;

  // Word
  if (["doc", "docx"].includes(ext))
    return FileText;

  // Excel
  if (["xls", "xlsx", "csv"].includes(ext))
    return FileSpreadsheet;

  // PowerPoint
  if (["ppt", "pptx"].includes(ext))
    return Presentation;

  // ZIP / RAR
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return Archive;

  // Programming Files
  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "c",
      "cpp",
      "cs",
      "php",
      "go",
      "rs",
      "swift",
      "kt",
      "html",
      "css",
      "json",
      "xml",
      "sql",
      "sh",
      "bat",
    ].includes(ext)
  )
    return FileCode;

  // Text
  if (["txt", "md"].includes(ext))
    return FileType;

  return File;
};

// ======================================================
// Returns Tailwind color class
// ======================================================

export const getFileIconColor = (item) => {
  if (item.isDirectory)
    return "text-yellow-400";

  const ext = (item.extension || "").toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext))
    return "text-emerald-400";

  if (["mp4", "avi", "mov", "mkv"].includes(ext))
    return "text-sky-400";

  if (["mp3", "wav", "aac", "ogg"].includes(ext))
    return "text-pink-400";

  if (["pdf"].includes(ext))
    return "text-red-400";

  if (["doc", "docx"].includes(ext))
    return "text-blue-400";

  if (["xls", "xlsx", "csv"].includes(ext))
    return "text-green-400";

  if (["ppt", "pptx"].includes(ext))
    return "text-orange-400";

  if (["zip", "rar", "7z"].includes(ext))
    return "text-amber-400";

  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "cpp",
      "html",
      "css",
      "json",
    ].includes(ext)
  )
    return "text-cyan-400";

  return "text-slate-300";
};

// ======================================================
// Returns icon background class
// ======================================================

export const getIconBackground = (item) => {
  if (item.isDirectory)
    return "bg-yellow-500/10";

  const ext = (item.extension || "").toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext))
    return "bg-emerald-500/10";

  if (["mp4", "avi", "mov", "mkv"].includes(ext))
    return "bg-sky-500/10";

  if (["pdf"].includes(ext))
    return "bg-red-500/10";

  if (["doc", "docx"].includes(ext))
    return "bg-blue-500/10";

  if (["xls", "xlsx"].includes(ext))
    return "bg-green-500/10";

  if (["ppt", "pptx"].includes(ext))
    return "bg-orange-500/10";

  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "html",
      "css",
      "json",
    ].includes(ext)
  )
    return "bg-cyan-500/10";

  return "bg-slate-700";
};