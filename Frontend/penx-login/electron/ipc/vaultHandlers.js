import { secureHandle } from "../security/secureIpc.js";
import { ipcMain } from "electron";

import {
  initializeVault,
  importFile,
  exportFile,
  listVaultFiles,
  deleteVaultFile,
  renameVaultFile,
} from "../services/vaultService.js";

// ======================================================
// Register Vault IPC Handlers
// ======================================================

export function registerVaultHandlers() {

  console.log(
    "🔥 registerVaultHandlers() called"
  );

  // ----------------------------------------------------
  // Prevent duplicate handlers during development
  // ----------------------------------------------------

  const handlers = [
    "initialize-vault",
    "import-vault-file",
    "export-vault-file",
    "list-vault-files",
    "delete-vault-file",
    "rename-vault-file",
  ];

  for (const channel of handlers) {
    ipcMain.removeHandler(channel);
  }

  // ====================================================
  // Initialize Vault
  // ====================================================

  secureHandle(
    "initialize-vault",
    async (
      event,
      driveLetter,
      owner
    ) => {

      try {

        return await initializeVault(
          driveLetter,
          owner
        );

      } catch (error) {

        console.error(
          "Vault Initialization Error:",
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            "Vault initialization failed.",
        };

      }

    }
  );

  // ====================================================
  // Import File
  // ====================================================

  secureHandle(
    "import-vault-file",
    async (
      event,
      sourcePath,
      driveLetter,
      password,
      owner
    ) => {

      try {

        return await importFile(
          sourcePath,
          driveLetter,
          password,
          owner
        );

      } catch (error) {

        console.error(
          "Vault Import Error:",
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            "Vault import failed.",
        };

      }

    }
  );

  // ====================================================
  // Export File
  // ====================================================

  secureHandle(
    "export-vault-file",
    async (
      event,
      encryptedFile,
      destinationFolder,
      password
    ) => {

      try {

        return await exportFile(
          encryptedFile,
          destinationFolder,
          password
        );

      } catch (error) {

        console.error(
          "Vault Export Error:",
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            "Vault export failed.",
        };

      }

    }
  );

  // ====================================================
  // List Vault Files
  // ====================================================

  secureHandle(
    "list-vault-files",
    async (
      event,
      driveLetter
    ) => {

      try {

        return await listVaultFiles(
          driveLetter
        );

      } catch (error) {

        console.error(
          "Vault List Error:",
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            "Failed to list vault files.",
          files: [],
        };

      }

    }
  );

  // ====================================================
  // Delete Vault File
  // ====================================================

  secureHandle(
    "delete-vault-file",
    async (
      event,
      driveLetter,
      fileId
    ) => {

      try {

        return await deleteVaultFile(
          driveLetter,
          fileId
        );

      } catch (error) {

        console.error(
          "Vault Delete Error:",
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            "Vault file deletion failed.",
        };

      }

    }
  );

  // ====================================================
  // Rename Vault File
  // ====================================================

  secureHandle(
    "rename-vault-file",
    async (
      event,
      driveLetter,
      fileId,
      newName
    ) => {

      try {

        return await renameVaultFile(
          driveLetter,
          fileId,
          newName
        );

      } catch (error) {

        console.error(
          "Vault Rename Error:",
          error
        );

        return {
          success: false,
          error:
            error?.message ||
            "Vault file rename failed.",
        };

      }

    }
  );

  console.log(
    "✅ Vault IPC handlers registered"
  );

}