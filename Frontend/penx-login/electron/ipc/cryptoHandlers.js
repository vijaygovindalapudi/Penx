import { secureHandle } from "../security/secureIpc.js";
console.log("cryptoHandlers.js loaded");

import { ipcMain } from "electron";

import { encryptFile } from "../crypto/encryptionService.js";
import { decryptFile } from "../crypto/decryptionService.js";

import {
  createVaultVerifier,
  verifyVaultPassword,
  hasVaultVerifier,
} from "../crypto/vaultVerifier.js";

export function registerCryptoHandlers() {
  ipcMain.removeHandler("check-vault-password");
  secureHandle("check-vault-password", async (_event, drive) => ({success: true, exists: await hasVaultVerifier(drive)}));
  console.log("🔥 registerCryptoHandlers() called");

  // =====================================================
  // Remove existing handlers
  // =====================================================

  ipcMain.removeHandler("encrypt-file");
  ipcMain.removeHandler("decrypt-file");
  ipcMain.removeHandler("create-vault-password");
  ipcMain.removeHandler("verify-vault-password");

  // =====================================================
  // Encrypt File
  // =====================================================

  secureHandle(
    "encrypt-file",
    async (_, filePath, password) => {
      try {
        const result = await encryptFile(
          filePath,
          password
        );

        return {
          success: true,
          data: result,
        };

      } catch (error) {
        console.error(
          "Encryption Error:",
          error
        );

        return {
          success: false,
          error: error.message,
        };
      }
    }
  );

  // =====================================================
  // Decrypt File
  // =====================================================

  secureHandle(
    "decrypt-file",
    async (
      _,
      filePath,
      password,
      destinationFolder
    ) => {
      try {
        if (!filePath) {
          return {
            success: false,
            error:
              "Encrypted file path is required.",
          };
        }

        if (!password) {
          return {
            success: false,
            error:
              "Password is required.",
          };
        }

        if (!destinationFolder) {
          return {
            success: false,
            error:
              "Destination folder is required.",
          };
        }

        console.log(
          "🔓 Decrypting PenX file..."
        );

        console.log(
          "📄 Source:",
          filePath
        );

        console.log(
          "📁 Destination:",
          destinationFolder
        );

        const result =
          await decryptFile(
            filePath,
            password,
            destinationFolder
          );

        console.log(
          "✅ File decrypted successfully."
        );

        return {
          success: true,
          data: result,
        };

      } catch (error) {
        console.error(
          "Decryption Error:",
          error
        );

        return {
          success: false,
          error:
            error.message ||
            "Unable to decrypt file.",
        };
      }
    }
  );

  // =====================================================
  // CREATE VAULT PASSWORD
  // =====================================================

  secureHandle(
    "create-vault-password",
    async (_, driveLetter, password) => {
      try {
        console.log(
          "🔐 Creating PenX Vault Password..."
        );

        if (!driveLetter) {
          return {
            success: false,
            error:
              "USB drive is not available.",
          };
        }

        if (!password) {
          return {
            success: false,
            error:
              "Vault password is required.",
          };
        }

        if (password.length < 8) {
          return {
            success: false,
            error:
              "Vault password must contain at least 8 characters.",
          };
        }

        const result =
          await createVaultVerifier(
            driveLetter,
            password
          );

        console.log(
          "✅ Vault password verifier created."
        );

        return {
          success: true,
          data: result,
        };

      } catch (error) {
        console.error(
          "Create Vault Password Error:",
          error
        );

        return {
          success: false,
          error: error.message,
        };
      }
    }
  );

  // =====================================================
  // VERIFY VAULT PASSWORD
  // =====================================================

  secureHandle(
    "verify-vault-password",
    async (
      _,
      driveLetter,
      password
    ) => {
      try {
        console.log(
          "🔑 Verifying PenX Vault Password..."
        );

        if (!driveLetter) {
          return {
            success: false,
            error:
              "USB drive is not available.",
          };
        }

        if (!password) {
          return {
            success: false,
            error:
              "Vault password is required.",
          };
        }

        const result =
          await verifyVaultPassword(
            driveLetter,
            password
          );

        if (!result?.valid) {
          return {
            success: false,
            error:
              "Incorrect vault password.",
          };
        }

        console.log(
          "✅ Vault password verified."
        );

        return {
          success: true,
          message:
            "Vault password verified.",
        };

      } catch (error) {
        console.error(
          "Vault Password Verification Error:",
          error
        );

        return {
          success: false,
          error:
            error.message ||
            "Unable to verify vault password.",
        };
      }
    }
  );

  console.log(
    "✅ Crypto IPC handlers registered"
  );
}