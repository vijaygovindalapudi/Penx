const { contextBridge, ipcRenderer } = require("electron");


// Auth accompanies EVERY request; no renderer-supplied owner ID is trusted.
function currentToken() {
  try { return window.localStorage.getItem("token"); } catch { return null; }
}
let lastToken;
function syncSession() {
  const token = currentToken();
  if (token !== lastToken) {
    lastToken = token;
    ipcRenderer.send("penx-session-changed", token);
  }
  return token;
}
function invoke(channel, ...args) {
  return ipcRenderer.invoke(channel, {penx: 2, token: syncSession()}, ...args);
}
// Covers same-document localStorage changes made by existing AuthContext.
setInterval(syncSession, 200);
window.addEventListener("storage", syncSession);
window.addEventListener("pagehide", () => ipcRenderer.send("penx-session-changed", null));

contextBridge.exposeInMainWorld("electron", {

  // =======================================================
  // USB
  // =======================================================

  getUSBDevices: () =>
    invoke("get-usb-devices"),

  getUSBFiles: (driveLetter, subPath = "") =>
    invoke(
      "get-usb-files",
      driveLetter,
      subPath
    ),
  
  googleLogin: () => invoke("google-login"),
  // =======================================================
  // File Picker
  // =======================================================

  pickFile: () =>
    invoke("pick-file"),

  pickFolder: () =>
    invoke("pick-folder"),

  // =======================================================
  // File Operations
  // =======================================================

  copyUSBFile: (
    sourcePath,
    destinationFolder
  ) =>
    invoke(
      "copy-usb-file",
      sourcePath,
      destinationFolder
    ),

  deleteUSBFile: (filePath) =>
    invoke(
      "delete-usb-file",
      filePath
    ),

  renameUSBFile: (
    oldPath,
    newName
  ) =>
    invoke(
      "rename-usb-file",
      oldPath,
      newName
    ),

  createUSBFolder: (
    driveLetter,
    currentFolder,
    folderName
  ) =>
    invoke(
      "create-usb-folder",
      driveLetter,
      currentFolder,
      folderName
    ),

  moveUSBFile: (
    sourcePath,
    destinationFolder
  ) =>
    invoke(
      "move-usb-file",
      sourcePath,
      destinationFolder
    ),

  // =======================================================
  // Encryption
  // =======================================================

  encryptFile: (
    filePath,
    password
  ) =>
    invoke(
      "encrypt-file",
      filePath,
      password
    ),

  // =======================================================
  // Decryption
  // =======================================================

  decryptFile: (
    filePath,
    password,
    destinationFolder = null
  ) =>
    invoke(
      "decrypt-file",
      filePath,
      password,
      destinationFolder
    ),

  // =======================================================
  // VAULT PASSWORD
  // =======================================================

  createVaultPassword: (
    driveLetter,
    password
  ) =>
    invoke(
      "create-vault-password",
      driveLetter,
      password
    ),

  checkVaultPassword: (
    driveLetter
  ) =>
    invoke(
      "check-vault-password",
      driveLetter
    ),

  verifyVaultPassword: (
    driveLetter,
    password
  ) =>
    invoke(
      "verify-vault-password",
      driveLetter,
      password
    ),

  // =======================================================
  // USB IDENTITY
  // =======================================================

  createUSBIdentity: (
    driveLetter,
    owner
  ) =>
    invoke(
      "create-usb-identity",
      driveLetter,
      owner
    ),

  // Read existing PenX USB identity
  readUSBIdentity: (
    driveLetter
  ) =>
    invoke(
      "read-usb-identity",
      driveLetter
    ),

  // =======================================================
  // VAULT
  // =======================================================

  initializeVault: (
    driveLetter,
    owner
  ) =>
    invoke(
      "initialize-vault",
      driveLetter,
      owner
    ),

  importVaultFile: (
    sourcePath,
    driveLetter,
    password,
    owner
  ) =>
    invoke(
      "import-vault-file",
      sourcePath,
      driveLetter,
      password,
      owner
    ),

  exportVaultFile: (encryptedFile, destinationFolder, password) =>
    invoke("export-vault-file", encryptedFile, destinationFolder, password),

  listVaultFiles: (
    driveLetter
  ) =>
    invoke(
      "list-vault-files",
      driveLetter
    ),

  deleteVaultFile: (
    driveLetter,
    fileId
  ) =>
    invoke(
      "delete-vault-file",
      driveLetter,
      fileId
    ),

  renameVaultFile: (
    driveLetter,
    fileId,
    newName
  ) =>
    invoke(
      "rename-vault-file",
      driveLetter,
      fileId,
      newName
    ),

  // =======================================================
  // PDF REPORT
  // =======================================================

  exportPDFReport: (
    reportData
  ) =>
    invoke(
      "export-pdf-report",
      reportData
    ),

});