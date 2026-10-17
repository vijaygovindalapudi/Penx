import { registerRendererHost, loadRenderer, isTrustedRendererURL } from "./rendererHost.js";
import { secureHandle, trustWindow } from "./security/secureIpc.js";
import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
} from "electron";

console.log("🚀 MAIN.JS LOADED");

import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

import { registerFileHandlers } from "./ipc/fileHandlers.js";
import { registerUSBHandlers } from "./ipc/usbHandlers.js";
import { registerCryptoHandlers } from "./ipc/cryptoHandlers.js";
import { registerVaultHandlers } from "./ipc/vaultHandlers.js";

import { startGoogleLogin } from "./googleAuth.js";

import {
  executeRemoteWipe,
} from "./security/remoteWipe.js";


// =======================================================
// PATH CONFIGURATION
// =======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.setName("PenX");
if (process.platform === "win32") app.setAppUserModelId("com.penx.desktop");
const penxIconPath = path.join(__dirname, "assets", process.platform === "win32" ? "penx.ico" : "penx-icon.png");
let mainWindow = null;


// =======================================================
// HTML ESCAPE HELPER
// =======================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =======================================================
// CREATE WINDOW
// =======================================================

function createWindow() {

  mainWindow = new BrowserWindow({
    title: "PenX",
    icon: penxIconPath,

    width: 1500,
    height: 900,

    minWidth: 1200,
    minHeight: 700,

    webPreferences: {

      preload: path.join(
        __dirname,
        "preload.cjs"
      ),

      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,

    },

  });


  // -----------------------------------------------------
  // React / Vite
  // -----------------------------------------------------

  trustWindow(mainWindow.webContents);
  mainWindow.webContents.setWindowOpenHandler(() => ({action: "deny"}));
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isTrustedRendererURL(url)) event.preventDefault();
  });
  loadRenderer(mainWindow).catch((error) => {
    console.error("PenX UI load failed:", error.message);
    dialog.showErrorBox("PenX could not start", "Could not load the packaged UI. Check that dist/index.html is included and rebuild the app.");
  });


  // -----------------------------------------------------
  // Development DevTools
  // -----------------------------------------------------

  if (!app.isPackaged || process.argv.includes("--penx-debug")) mainWindow.webContents.openDevTools();


  // -----------------------------------------------------
  // React Loaded
  // -----------------------------------------------------

  mainWindow.webContents.on(
    "did-finish-load",
    () => {

      console.log(
        "✅ React Loaded"
      );

    }
  );


  // -----------------------------------------------------
  // Window Closed
  // -----------------------------------------------------

  mainWindow.on(
    "closed",
    () => {

      mainWindow = null;

    }
  );

}


// =======================================================
// GOOGLE LOGIN
// =======================================================

secureHandle(
  "google-login",
  async () => {

    try {

      console.log(
        "🔐 Starting Google OAuth..."
      );

      const result =
        await startGoogleLogin();

      console.log(
        "✅ Google OAuth completed"
      );

      return result;

    } catch (error) {

      console.error(
        "❌ Google OAuth error:",
        error
      );

      return {

        success: false,

        error:
          error?.message ||
          "Google authentication failed.",

      };

    }

  }
);


// =======================================================
// REMOTE WIPE IPC
// =======================================================

secureHandle(
  "execute-remote-wipe",
  async (
    _event,
    driveLetter
  ) => {

    try {

      console.log(
        "⚠️ Remote wipe requested for:",
        driveLetter
      );


      // ---------------------------------------------------
      // Validate drive letter
      // ---------------------------------------------------

      if (!driveLetter) {

        return {

          success: false,

          error:
            "USB drive letter is required.",

        };

      }


      // ---------------------------------------------------
      // Execute local wipe
      // ---------------------------------------------------

      const result =
        await executeRemoteWipe(
          driveLetter
        );


      console.log(
        "✅ Remote wipe completed:",
        driveLetter
      );


      return {

        success: true,

        ...result,

      };

    } catch (error) {

      console.error(
        "❌ Remote wipe failed:",
        error
      );


      return {

        success: false,

        error:
          error?.message ||
          "Remote wipe failed.",

      };

    }

  }
);


// =======================================================
// APP READY
// =======================================================

app.whenReady().then(() => {
  registerRendererHost();

  console.log(
    "🚀 Electron App Ready"
  );


  // -----------------------------------------------------
  // Create Main Window
  // -----------------------------------------------------

  createWindow();


  // =====================================================
  // USB HANDLERS
  // =====================================================

  try {

    console.log(
      "Calling registerUSBHandlers..."
    );

    registerUSBHandlers();

    console.log(
      "✓ registerUSBHandlers OK"
    );

  } catch (error) {

    console.error(
      "registerUSBHandlers FAILED:",
      error
    );

  }


  // =====================================================
  // FILE HANDLERS
  // =====================================================

  try {

    console.log(
      "Calling registerFileHandlers..."
    );

    registerFileHandlers();

    console.log(
      "✓ registerFileHandlers OK"
    );

  } catch (error) {

    console.error(
      "registerFileHandlers FAILED:",
      error
    );

  }


  // =====================================================
  // CRYPTO HANDLERS
  // =====================================================

  try {

    console.log(
      "Calling registerCryptoHandlers..."
    );

    registerCryptoHandlers();

    console.log(
      "✓ registerCryptoHandlers OK"
    );

  } catch (error) {

    console.error(
      "registerCryptoHandlers FAILED:",
      error
    );

  }


  // =====================================================
  // VAULT HANDLERS
  // =====================================================

  try {

    console.log(
      "Calling registerVaultHandlers..."
    );

    registerVaultHandlers();

    console.log(
      "✓ registerVaultHandlers OK"
    );

  } catch (error) {

    console.error(
      "registerVaultHandlers FAILED:",
      error
    );

  }


  // =====================================================
  // SECURITY HANDLERS
  // =====================================================

  try {

    console.log(
      "Remote Wipe IPC handler ready."
    );

  } catch (error) {

    console.error(
      "Remote Wipe handler initialization failed:",
      error
    );

  }


  // =====================================================
  // ALL IPC READY
  // =====================================================

  console.log(
    "✅ All IPC handlers initialized"
  );

});


// =======================================================
// QUIT
// =======================================================

app.on(
  "window-all-closed",
  () => {

    if (
      process.platform !== "darwin"
    ) {

      app.quit();

    }

  }
);


// =======================================================
// ACTIVATE
// =======================================================

app.on(
  "activate",
  () => {

    if (
      BrowserWindow
        .getAllWindows()
        .length === 0
    ) {

      createWindow();

    }

  }
);


// =======================================================
// FILE PICKER
// =======================================================

secureHandle(
  "pick-file",
  async () => {

    try {

      console.log(
        "📄 Opening file picker..."
      );


      const result =
        await dialog.showOpenDialog(
          mainWindow,
          {
            properties: [
              "openFile",
            ],
          }
        );


      // -------------------------------------------------
      // Cancelled
      // -------------------------------------------------

      if (
        result.canceled ||
        !result.filePaths.length
      ) {

        console.log(
          "📄 File selection cancelled."
        );

        return null;

      }


      // -------------------------------------------------
      // Selected File
      // -------------------------------------------------

      const selectedFile =
        result.filePaths[0];


      console.log(
        "📄 Selected file:",
        selectedFile
      );


      return selectedFile;

    } catch (error) {

      console.error(
        "FILE PICKER ERROR:",
        error
      );

      return null;

    }

  }
);


// =======================================================
// FOLDER PICKER
// =======================================================

secureHandle(
  "pick-folder",
  async () => {

    try {

      console.log(
        "📁 Opening destination folder picker..."
      );


      const result =
        await dialog.showOpenDialog(
          mainWindow,
          {
            properties: [
              "openDirectory",
              "createDirectory",
            ],
          }
        );


      // -------------------------------------------------
      // Cancelled
      // -------------------------------------------------

      if (
        result.canceled ||
        !result.filePaths.length
      ) {

        console.log(
          "📁 Folder selection cancelled."
        );

        return null;

      }


      // -------------------------------------------------
      // Selected Folder
      // -------------------------------------------------

      const selectedFolder =
        result.filePaths[0];


      console.log(
        "📁 Selected destination:",
        selectedFolder
      );


      return selectedFolder;

    } catch (error) {

      console.error(
        "FOLDER PICKER ERROR:",
        error
      );

      return null;

    }

  }
);


// =======================================================
// PDF REPORT EXPORT
// =======================================================

secureHandle(
  "export-pdf-report",
  async (
    _event,
    reportData = {}
  ) => {

    let pdfWindow = null;

    try {

      console.log(
        "📄 Preparing PenX PDF report..."
      );


      // =================================================
      // SAVE DIALOG
      // =================================================

      const saveResult =
        await dialog.showSaveDialog(
          mainWindow,
          {

            title:
              "Save PenX Report",

            defaultPath:
              "PenX-Digital-Identity-Report.pdf",

            filters: [

              {
                name: "PDF Files",

                extensions: [
                  "pdf",
                ],

              },

            ],

          }
        );


      // -------------------------------------------------
      // Cancelled
      // -------------------------------------------------

      if (
        saveResult.canceled ||
        !saveResult.filePath
      ) {

        console.log(
          "📄 PDF export cancelled."
        );

        return {

          success: false,

          cancelled: true,

        };

      }


      const outputPath =
        saveResult.filePath;


      // =================================================
      // SAFE DATA
      // =================================================

      const safeData =
        reportData || {};


      const user =
        safeData.user || {};


      const identity =
        safeData.penx_identity || {};


      const generatedAt =
        safeData.generated_at ||
        new Date().toISOString();


      // =================================================
      // IDENTITY JSON
      // =================================================

      const identityJson =
        JSON.stringify(
          identity,
          null,
          2
        );


      // =================================================
      // PDF HTML
      // =================================================

      const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
PenX Digital Identity Report
</title>


<style>

@page {

  size: A4;

  margin: 42px;

}


* {

  box-sizing: border-box;

}


body {

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  background:
    #f5f8fc;

  color:
    #101828;

  margin:
    0;

  padding:
    0;

}


.header {

  background:
    #07111f;

  color:
    white;

  padding:
    28px;

  border-radius:
    12px;

  margin-bottom:
    25px;

}


.logo {

  font-size:
    28px;

  font-weight:
    700;

  letter-spacing:
    1px;

  color:
    #20c7ff;

}


.tagline {

  margin-top:
    7px;

  font-size:
    12px;

  color:
    #d5e2ef;

}


.title {

  margin-top:
    25px;

  font-size:
    22px;

  font-weight:
    700;

}


.section {

  background:
    white;

  border:
    1px solid #dbe4ee;

  border-radius:
    10px;

  padding:
    18px;

  margin-bottom:
    18px;

}


.section-title {

  font-size:
    14px;

  font-weight:
    700;

  color:
    #07111f;

  margin-bottom:
    12px;

  text-transform:
    uppercase;

  letter-spacing:
    0.7px;

}


.row {

  display:
    flex;

  justify-content:
    space-between;

  border-bottom:
    1px solid #edf1f5;

  padding:
    8px 0;

  font-size:
    12px;

}


.label {

  color:
    #667085;

}


.value {

  color:
    #101828;

  font-weight:
    600;

  text-align:
    right;

  max-width:
    60%;

  word-break:
    break-word;

}


pre {

  background:
    #07111f;

  color:
    #d7f6ff;

  padding:
    15px;

  border-radius:
    8px;

  font-size:
    10px;

  white-space:
    pre-wrap;

  word-break:
    break-word;

}


.security {

  color:
    #007ea7;

  font-weight:
    700;

}


.footer {

  margin-top:
    30px;

  text-align:
    center;

  font-size:
    9px;

  color:
    #667085;

  line-height:
    1.6;

}


</style>

</head>


<body>


<!-- ===================================================
     HEADER
==================================================== -->

<div class="header">

  <div class="logo">
    PenX
  </div>

  <div class="tagline">
    YOUR FILES. YOUR CONTROL.
  </div>

  <div class="title">
    Digital Identity Report
  </div>

</div>


<!-- ===================================================
     USER INFORMATION
==================================================== -->

<div class="section">

  <div class="section-title">
    User Information
  </div>


  <div class="row">

    <span class="label">
      Full Name
    </span>

    <span class="value">

      ${escapeHtml(
        user.full_name ||
        "Not available"
      )}

    </span>

  </div>


  <div class="row">

    <span class="label">
      Email
    </span>

    <span class="value">

      ${escapeHtml(
        user.email ||
        "Not available"
      )}

    </span>

  </div>


  <div class="row">

    <span class="label">
      User ID
    </span>

    <span class="value">

      ${escapeHtml(
        user.id ||
        "Not available"
      )}

    </span>

  </div>

</div>


<!-- ===================================================
     PENX IDENTITY
==================================================== -->

<div class="section">

  <div class="section-title">
    PenX Identity
  </div>


  <div class="row">

    <span class="label">
      Identity Status
    </span>

    <span class="value security">
      Registered
    </span>

  </div>


  <pre>${escapeHtml(
    identityJson
  )}</pre>

</div>


<!-- ===================================================
     REPORT INFORMATION
==================================================== -->

<div class="section">

  <div class="section-title">
    Report Information
  </div>


  <div class="row">

    <span class="label">
      Generated
    </span>

    <span class="value">

      ${escapeHtml(
        generatedAt
      )}

    </span>

  </div>


  <div class="row">

    <span class="label">
      Application
    </span>

    <span class="value">
      PenX
    </span>

  </div>


  <div class="row">

    <span class="label">
      Report Type
    </span>

    <span class="value">
      Digital Identity
    </span>

  </div>

</div>


<!-- ===================================================
     FOOTER
==================================================== -->

<div class="footer">

  PenX — Your Files. Your Control.

  <br>

  This report contains identity metadata only.

  <br>

  It does not contain vault passwords,
  encryption keys, or recovery secrets.

</div>


</body>

</html>
`;


      // =================================================
      // CREATE HIDDEN PDF WINDOW
      // =================================================

      pdfWindow =
        new BrowserWindow({

          show: false,

          width: 900,

          height: 1200,

          webPreferences: {
            sandbox: true,
          },

        });


      // =================================================
      // LOAD REPORT
      // =================================================

      await pdfWindow.loadURL(
        "data:text/html;charset=utf-8," +
        encodeURIComponent(html)
      );


      // =================================================
      // GENERATE PDF
      // =================================================

      const pdfData =
        await pdfWindow.webContents.printToPDF({

          printBackground:
            true,

          pageSize:
            "A4",

          margins: {

            marginType:
              "default",

          },

        });


      // =================================================
      // WRITE PDF
      // =================================================

      await fs.writeFile(
        outputPath,
        pdfData
      );


      console.log(
        "✅ PDF saved:",
        outputPath
      );


      // =================================================
      // SUCCESS
      // =================================================

      return {

        success:
          true,

        outputPath,

      };


    } catch (error) {

      console.error(
        "❌ PDF EXPORT ERROR:",
        error
      );


      return {

        success:
          false,

        error:
          error?.message ||
          "Failed to generate PDF report.",

      };


    } finally {

      // =================================================
      // CLOSE PDF WINDOW
      // =================================================

      if (
        pdfWindow &&
        !pdfWindow.isDestroyed()
      ) {

        pdfWindow.close();

      }

    }

  }
);