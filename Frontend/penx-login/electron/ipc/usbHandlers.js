import { secureHandle } from "../security/secureIpc.js";
import { ipcMain } from "electron";

import {
  getUSBDevices,
  getUSBFiles,
} from "../services/usbService.js";

import {
  createIdentity,
  readIdentity,
} from "../utils/penxIdentity.js";

export function registerUSBHandlers() {
  secureHandle("read-usb-identity", async (_event, drive) => readIdentity(drive));

  // ==========================================
  // USB Detection
  // ==========================================

  secureHandle(
    "get-usb-devices",
    async () => {
      return await getUSBDevices();
    }
  );

  // ==========================================
  // USB Explorer
  // ==========================================

  secureHandle(
    "get-usb-files",
    async (event, driveLetter, subPath = "") => {
      return getUSBFiles(
        driveLetter,
        subPath
      );
    }
  );

  // ==========================================
  // Create PenX Identity
  // ==========================================

  secureHandle(
    "create-usb-identity",
    async (event, driveLetter, owner) => {

      return await createIdentity(
        driveLetter,
        owner
      );

    }
  );

}