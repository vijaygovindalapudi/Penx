import { secureHandle } from "../security/secureIpc.js";
import { ipcMain } from "electron";

import {
  copyFile,
  deleteItem,
  renameItem,
  createFolder,
  moveItem,
} from "../services/fileService.js";

export function registerFileHandlers() {

  // ==========================================
  // Copy File
  // ==========================================

  secureHandle(
    "copy-usb-file",
    async (event, sourcePath, destinationFolder) => {
      return copyFile(
        sourcePath,
        destinationFolder
      );
    }
  );

  // ==========================================
  // Delete
  // ==========================================

  secureHandle(
    "delete-usb-file",
    async (event, filePath) => {
      return deleteItem(filePath);
    }
  );

  // ==========================================
  // Rename
  // ==========================================

  secureHandle(
    "rename-usb-file",
    async (event, oldPath, newName) => {
      return renameItem(
        oldPath,
        newName
      );
    }
  );

  // ==========================================
  // Create Folder
  // ==========================================

  secureHandle(
    "create-usb-folder",
    async (
      event,
      driveLetter,
      currentFolder,
      folderName
    ) => {
      return createFolder(
        driveLetter,
        currentFolder,
        folderName
      );
    }
  );

  // ==========================================
  // Move (Future Cut/Paste)
  // ==========================================

  secureHandle(
    "move-usb-file",
    async (
      event,
      sourcePath,
      destinationFolder
    ) => {
      return moveItem(
        sourcePath,
        destinationFolder
      );
    }
  );

}