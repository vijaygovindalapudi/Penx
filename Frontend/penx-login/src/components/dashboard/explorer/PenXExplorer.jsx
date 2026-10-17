import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Components
import ExplorerToolbar from "./ExplorerToolbar";
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import ExplorerStorageCard from "./ExplorerStorageCard";
import ExplorerFileList from "./ExplorerFileList";
import RenameModal from "./RenameModal";
import ExplorerContextMenu from "./ExplorerContextMenu";
import ExplorerToast from "./ExplorerToast";
import { getRandomToast } from "../../../constants/toastMessages";
import PasswordDialog from "../../common/PasswordDialog";
import SuccessDialog from "../../common/SuccessDialog";
import { useNotification } from "../../../context/NotificationContext";
import VaultLocked from "../../common/VaultLocked";
import api from "../../../services/api";
import { ShieldCheck } from "lucide-react";

// Styles
import "./explorer.css";
import USBAccessGate from "./USBAccessGate";

const OwnedExplorer = ({
  authorizedUSB,
  bridge,
  user,
  vaultLocked = false,
  onUnlockVault,
  vaultMode = false,
}) => {

  // ======================================================
  // USB
  // ======================================================

  const [usbDevices, setUsbDevices] = useState([]);
  const [selectedUSB, setSelectedUSB] = useState(authorizedUSB);
  const [usbOwnership, setUsbOwnership] = useState({
  registered: true,
  owner: true,
  owner_name: null,
  owner_email: null,
});

  // ======================================================
  // Explorer
  // ======================================================

  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");

  // ======================================================
  // UI
  // ======================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("list");

  // ======================================================
  // Rename / Create Folder
  // ======================================================

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameFile, setRenameFile] = useState(null);

  const [createFolderMode, setCreateFolderMode] =
    useState(false);

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [masterVaultKey, setMasterVaultKey] = useState("");
  const [useMasterVaultKey, setUseMasterVaultKey] = useState(false);

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successType, setSuccessType] = useState("encrypt");
  const [successFileName, setSuccessFileName] = useState("");
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");

  const [passwordDialogMode, setPasswordDialogMode] = useState("encrypt");
  const [vaultImportMode, setVaultImportMode] = useState(false);
  const [uploadingToVault, setUploadingToVault] = useState(false);

  const { addNotification } = useNotification();

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    file: null,
  });

  const [clipboard, setClipboard] = useState({
  file: null,
  action: null,
  });

  const [toast, setToast] = useState({
  show: false,
  icon: "",
  telugu: "",
  english: "",
});

  const showToast = (action, icon) => {
  const message = getRandomToast(action);

  setToast({
    show: true,
    icon,
    telugu: message.telugu,
    english: message.english,
  });

  setTimeout(() => {
    setToast((prev) => ({
      ...prev,
      show: false,
    }));
  }, 3000);
};
    // ======================================================
  // Load USB Devices
  // ======================================================

  const loadUSBDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const devices = await bridge.getUSBDevices();

      if (!devices || devices.length === 0) {
        setUsbDevices([]);
        setSelectedUSB(null);
        setFiles([]);
        return;
      }

      setUsbDevices(devices);

      setSelectedUSB((previous) => {
        if (previous) {
          const existing = devices.find(
            (device) =>
              device.DriveLetter === previous.DriveLetter
          );

          if (existing) {
            return existing;
          }
        }

        return devices[0];
      });
        const ownership =
    await checkOwnership(
        devices[0].SerialNumber
    );

setUsbOwnership(ownership);
    } catch (err) {
      console.error("USB Detection Error:", err);
      setError("Unable to detect USB devices.");
    } finally {
      setLoading(false);
    }
  }, []);

const checkOwnership = async () => {
  await bridge.getUSBDevices();
  return { registered: true, owner: true };
};

  const VAULT_ROOT = ".penx/vault";
  //======================================================
  //Load Files
  //======================================================

  const loadFiles = useCallback(
    async (folder = "") => {

      if (!selectedUSB) return;

      try {

        setLoading(true);
        setError("");

        const result =
          await bridge.getUSBFiles(
            selectedUSB.DriveLetter,
            folder
          );

        setFiles(
          Array.isArray(result)
            ? result
            : []
        );

        setCurrentPath(folder);

      } catch (err) {

        console.error("Load Files Error:", err);

        setFiles([]);
        setError("Unable to load files.");

      } finally {

        setLoading(false);

      }
    },
    [selectedUSB]
  );

  // ======================================================
  // Initial Load
  // ======================================================

  useEffect(() => {
  if (!selectedUSB) return;

  if (
    !usbOwnership.registered ||
    !usbOwnership.owner
  ) {
    return;
  }

  async function prepareAndLoad() {
    try {
      // Normal USB mode
      if (!vaultMode) {
        await loadFiles("");
        return;
      }

      // My Vault mode
      if (!user) {
        return;
      }

      console.log("🔐 Initializing PenX Vault...");

      await bridge.initializeVault(
        selectedUSB.DriveLetter,
        {
          owner_id: user.id,
          owner_name: user.full_name,
          owner_email: user.email,
        }
      );

      console.log("✅ PenX Vault initialized.");

      await loadFiles(VAULT_ROOT);

    } catch (error) {
      console.error("❌ Vault Initialization Error:", error);
    }
  }

  prepareAndLoad();

}, [
  selectedUSB,
  usbOwnership,
  loadFiles,
  vaultMode,
  user,
]);
  useEffect(() => {

  window.addEventListener("click", closeContextMenu);

  return () => {
    window.removeEventListener("click", closeContextMenu);
  };

}, []);
  // ======================================================
// Open Context Menu
// ======================================================
  const handleContextMenu = (event, file) => {

  event.preventDefault();

  console.log("Opening Menu", {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    file,
  });

  setContextMenu({
    visible: true,
    x: event.clientX,
    y: event.clientY,
    file,
  });

};

 // ======================================================
// Close Context Menu
// ======================================================

const closeContextMenu = () => {

  setContextMenu({
    visible: false,
    x: 0,
    y: 0,
    file: null,
  });

};

useEffect(() => {
  const handleClick = (event) => {
    // Context menu lopala click ayithe close cheyyaku
    if (event.target.closest(".penx-context-menu")) {
      return;
    }

    closeContextMenu();
  };

  document.addEventListener("mousedown", handleClick);

  return () => {
    document.removeEventListener("mousedown", handleClick);
  };
}, []);

useEffect(() => {
  const handleKeyDown = (event) => {
    // Ignore shortcuts while typing
    const tag = document.activeElement?.tagName;

    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      document.activeElement?.isContentEditable
    ) {
      return;
    }

    // Ctrl + C
    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();

      if (selectedFile) {
        handleCopy(selectedFile);
      }

      return;
    }

    // Ctrl + V
    if (event.ctrlKey && event.key.toLowerCase() === "v") {
      event.preventDefault();
      handlePaste();
      return;
    }

    // Delete
    if (event.key === "Delete") {
      event.preventDefault();

      if (selectedFile) {
        handleDelete(selectedFile);
      }

      return;
    }

    // F2 Rename
    if (event.key === "F2") {
      event.preventDefault();

      if (selectedFile) {
        handleRenameClick(selectedFile);
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedFile, clipboard]);
  //======================================================
  //Refresh Explorer
  //======================================================

  const handleRefresh = async () => {

    await loadUSBDevices();

if (
    selectedUSB &&
    (
        usbOwnership.registered &&
        usbOwnership.owner
    )
) {
    await loadFiles(currentPath);
}

  };

  //======================================================
  //Open Folder
  //======================================================

  const handleOpen = async (item) => {

    if (!item || !item.isDirectory) return;

    const nextPath = currentPath
      ? `${currentPath}\\${item.name}`
      : item.name;

    if (
    !usbOwnership.registered ||
    !usbOwnership.owner
) {
    return;
}

await loadFiles(nextPath);

  };

  //======================================================
  //Go Home (USB Root)
  //======================================================

  const handleHome = async () => {
    setCurrentPath(vaultMode ? VAULT_ROOT : "");
    await loadFiles(vaultMode ? VAULT_ROOT : "");
  };
  // ======================================================
  // Breadcrumb Navigation
  // ======================================================

  const handleNavigate = async (path) => {
    setCurrentPath(path);
    await loadFiles(path);
  };

  // ======================================================
  // Select File
  //======================================================

  const handleSelect = (file) => {

    setSelectedFile(file);

  };

  // ======================================================
// Go Back
// ======================================================
// ======================================================
// Go Back
// ======================================================

const handleBack = async () => {
  if (!currentPath) return;

  if (vaultMode && currentPath === VAULT_ROOT) {
    return;
  }

  const parent = currentPath
    .split("\\")
    .slice(0, -1)
    .join("\\");


  if (
    vaultMode &&
    !parent.startsWith(VAULT_ROOT)
  ) {
    return;
  }

  await loadFiles(parent);
};
// ======================================================
// Upload File To PenX Vault
// ======================================================

const handleUpload = async () => {

  if (!selectedUSB) {
    alert("No USB device connected.");
    return;
  }

  // ----------------------------------------------------
  // Ownership protection
  // ----------------------------------------------------

  if (
    !usbOwnership.registered ||
    !usbOwnership.owner
  ) {
    alert(
      "This USB belongs to another account."
    );
    return;
  }

  // ----------------------------------------------------
  // Logged-in user check
  // ----------------------------------------------------

  if (!user) {
    alert(
      "User information is not available."
    );
    return;
  }

  // ----------------------------------------------------
  // Pick file
  // ----------------------------------------------------

  const file =
    await bridge.pickFile();

  if (!file) {
    return;
  }

  // ----------------------------------------------------
  // Store selected upload file
  // ----------------------------------------------------

  setSelectedFile({
    name: file.split(/[\\/]/).pop(),
    fullPath: file,
    isDirectory: false,
  });

  // ----------------------------------------------------
  // Tell PasswordDialog this is Vault import
  // ----------------------------------------------------

  setVaultImportMode(true);

  setPasswordDialogMode(
    "encrypt"
  );

  setPasswordDialogOpen(true);

};
  const handleCopy = (file) => {

  if (!file) return;

  setClipboard({
    file,
    action: "copy",
  });
  showToast("copy", "📋");

  console.log(file);

};

  const handleCut = (file) => {
  console.log("CUT FILE:", file);
  console.log("FULL PATH:", file?.fullPath);

  if (!file) return;

  setClipboard({
    file,
    action: "cut",
  });

  showToast("cut", "✂️");
};

   const handlePaste = async () => {
  if (!clipboard.file) {
    alert("Nothing copied.");
    return;
  }

  try {
    const targetPath =
      contextMenu.file?.isDirectory
        ? (currentPath
            ? `${currentPath}\\${contextMenu.file.name}`
            : contextMenu.file.name)
        : currentPath;

    const destinationFolder = targetPath
      ? `${selectedUSB.DriveLetter}\\${targetPath}`
      : `${selectedUSB.DriveLetter}\\`;

    console.log("Destination:", destinationFolder);

    let result;

      if (clipboard.action === "cut") {
        result = await bridge.moveUSBFile(
          clipboard.file.fullPath,
          destinationFolder
        );
      } else {
        result = await bridge.copyUSBFile(
          clipboard.file.fullPath,
          destinationFolder
        );
      }

    if (result.success) {

  if (clipboard.action === "cut") {
    showToast("move", "✂️");
  } else {
    showToast("paste", "📂");
  }

  setClipboard({
    file: null,
    action: null,
  });

  await loadFiles(currentPath);

} else {
  alert(result.message);
}
  } catch (err) {
    console.error(err);
    alert("Failed to copy file.");
  }
};

useEffect(() => {
  const handleKeyDown = async (e) => {

    // Ctrl + C
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();

      if (selectedFile) {
        handleCopy(selectedFile);
      }
    }

    // Ctrl + X
    if (e.ctrlKey && e.key.toLowerCase() === "x") {
      e.preventDefault();

      if (selectedFile) {
        handleCut(selectedFile);
      }
    }

    // Ctrl + V
    if (e.ctrlKey && e.key.toLowerCase() === "v") {
      e.preventDefault();

      if (clipboard.file) {
        await handlePaste();
      }
    }

  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };

}, [selectedFile, clipboard, currentPath, contextMenu]);
  // ======================================================
  // Delete File / Folder
  // ======================================================

  const handleDelete = async (file) => {

    if (!file) return;

    const confirmDelete = window.confirm(
      `Delete "${file.name}"?`
    );

    if (!confirmDelete) return;

    const result =
      await bridge.deleteUSBFile(
        file.fullPath
      );

    if (result.success) {

  addNotification({
    type: "delete",
    title: "File Deleted",
    message: file.name,
  });

  showToast("delete", "🗑️");

  await loadFiles(currentPath);

} else {

  alert("❌ " + result.message);

}

  };

const handleEncrypt = async (file) => {

  if (!file) return;

  // User selected "Use this Vault Key for all files"
  if (useMasterVaultKey && masterVaultKey) {

    setSelectedFile(file);

    await performEncryption(masterVaultKey, true);

    return;

  }

  setSelectedFile(file);
  setPasswordDialogMode("encrypt");
  setPasswordDialogOpen(true);

};

// ======================================================
// Import File Into PenX Vault
// ======================================================

const performVaultImport = async (
  vaultKey,
  rememberVaultKey = false
) => {

  if (!selectedFile) {
    return;
  }

  if (!selectedUSB) {
    alert(
      "No USB device connected."
    );
    return;
  }

  if (!user) {
    alert(
      "User information is not available."
    );
    return;
  }

  if (!vaultKey) {
    alert(
      "Vault password is required."
    );
    return;
  }

  try {

    setUploadingToVault(true);

    // --------------------------------------------------
    // Import into .penx/vault
    // --------------------------------------------------

    const result =
      await bridge.importVaultFile(
        selectedFile.fullPath,
        selectedUSB.DriveLetter,
        vaultKey,
        {
          owner_id: user.id,
          owner_name: user.full_name,
          owner_email: user.email,
        }
      );

    // --------------------------------------------------
    // Failed
    // --------------------------------------------------

    if (!result?.success) {

      throw new Error(
        result?.error ||
        result?.message ||
        "Vault import failed."
      );

    }

    // --------------------------------------------------
    // Notification
    // --------------------------------------------------

    addNotification({

      type: "upload",

      title:
        "File Added To PenX Vault",

      message:
        selectedFile.name,

    });

    // --------------------------------------------------
    // Toast
    // --------------------------------------------------

    showToast(
      "upload",
      "🔐"
    );

    // --------------------------------------------------
    // Success dialog
    // --------------------------------------------------

    setSuccessType(
      "encrypt"
    );

    setSuccessFileName(
      selectedFile.name
    );

    setSuccessDialogOpen(
      true
    );

    // --------------------------------------------------
    // Refresh Explorer
    // --------------------------------------------------

    await loadFiles(
      currentPath
    );

  } catch (error) {

    console.error(
      "VAULT IMPORT ERROR:",
      error
    );

    alert(
      "❌ " +
      (
        error?.message ||
        "Failed to import file into Vault."
      )
    );

  } finally {

    setUploadingToVault(false);

    setVaultImportMode(false);

    setPasswordDialogOpen(false);

    setSelectedFile(null);

  }

};

// ======================================================
// Encrypt File
// ======================================================

const performEncryption = async (
  vaultKey,
  rememberVaultKey = false
) => {

  if (!selectedFile) return;

  if (!vaultKey) {
    alert("Vault password is required.");
    return;
  }

  if (rememberVaultKey) {
    setMasterVaultKey(vaultKey);
    setUseMasterVaultKey(true);
  }

  try {

    console.log(
      "🔐 Encrypting:",
      selectedFile.fullPath
    );

    const result =
      await bridge.encryptFile(
        selectedFile.fullPath,
        vaultKey
      );

    if (result?.success) {

      addNotification({
        type: "encrypt",
        title: "File Encrypted",
        message:
          `${selectedFile.name} → ` +
          `${selectedFile.name.replace(
            /\.[^/.]+$/,
            ""
          )}.penx`,
      });

      showToast(
        "encrypt",
        "🔐"
      );

      await loadFiles(
        currentPath
      );

      setSuccessType(
        "encrypt"
      );

      setSuccessFileName(
        selectedFile.name
      );

      setSuccessDialogOpen(
        true
      );

    } else {

      alert(
        "❌ " +
        (
          result?.error ||
          "Encryption failed."
        )
      );

    }

  } catch (error) {

    console.error(
      "Encryption Error:",
      error
    );

    alert(
      error?.message ||
      "Failed to encrypt file."
    );

  } finally {

    setPasswordDialogOpen(
      false
    );

    setSelectedFile(
      null
    );

  }
};

  // ======================================================
// Handle Decrypt
// ======================================================

const handleDecrypt = (file) => {
  if (!file) return;

  setSelectedFile(file);
  setPasswordDialogMode("decrypt");
  setVaultImportMode(false);
  setPasswordDialogOpen(true);
};


// ======================================================
// Perform Decryption
// ======================================================

const performDecryption = async (vaultKey) => {
  if (!selectedFile) return;

  if (!vaultKey) {
    alert("Vault password is required.");
    return;
  }

  try {
    // Choose where the decrypted file will be saved
    const destinationFolder =
      await bridge.pickFolder();

    // User cancelled folder selection
    if (!destinationFolder) {
      return;
    }

    console.log(
      "🔓 Decrypting:",
      selectedFile.fullPath
    );

    console.log(
      "📁 Destination:",
      destinationFolder
    );

    const result =
      await bridge.decryptFile(
        selectedFile.fullPath,
        vaultKey,
        destinationFolder
      );

    if (result?.success) {

      addNotification({
        type: "decrypt",
        title: "File Decrypted",
        message:
          `${selectedFile.name} restored successfully.`,
      });

      showToast(
        "decrypt",
        "🔓"
      );

      await loadFiles(currentPath);

      setSuccessType("decrypt");

      setSuccessFileName(
        selectedFile.name.replace(
          /\.penx$/i,
          ""
        )
      );

      setSuccessDialogOpen(true);

    } else {

      alert(
        "❌ " +
        (
          result?.error ||
          "Failed to decrypt file."
        )
      );
    }

  } catch (error) {

    console.error(
      "Decryption Error:",
      error
    );

    alert(
      error?.message ||
      "Failed to decrypt file."
    );

  } finally {

    setPasswordDialogOpen(false);
    setSelectedFile(null);

  }
};


// ======================================================
// Unlock Vault
// ======================================================

const handleUnlockVault = async (password) => {
  if (!password) {
    setUnlockError("Please enter your vault password.");
    return;
  }

  if (!selectedUSB?.DriveLetter) {
    setUnlockError("No PenX USB device is available.");
    return;
  }

  try {
    setUnlockError("");

    const result =
      await bridge.verifyVaultPassword(
        selectedUSB.DriveLetter,
        password
      );

    if (!result?.success) {
      setUnlockError(
        result?.error || "Incorrect vault password."
      );
      return;
    }

    console.log("🔓 Vault password verified.");

    setUnlockDialogOpen(false);
    setUnlockPassword("");

    if (typeof onUnlockVault === "function") {
      onUnlockVault(password);
    }

  } catch (error) {
    console.error(
      "Vault Unlock Error:",
      error
    );

    setUnlockError(
      error?.message ||
        "Unable to verify vault password."
    );
  }
};
  // ======================================================
  // Open Rename Modal
  // ======================================================

  const handleRenameClick = (file) => {

    setCreateFolderMode(false);

    setRenameFile(file);

    setRenameOpen(true);

  };

  // ======================================================
  // Open Create Folder Modal
  // ======================================================

  const handleNewFolderClick = () => {

    setCreateFolderMode(true);

    setRenameFile({
      name: "",
    });

    setRenameOpen(true);

  };

  // ======================================================
  // Rename / Create Folder
  // ======================================================

  const handleRenameConfirm = async (newName) => {

    // ----------------------------
    // Create Folder
    // ----------------------------

    if (createFolderMode) {

      if (!selectedUSB) {
        alert("No USB selected.");
        return;
      }

      const result =
        await bridge.createUSBFolder(
          selectedUSB.DriveLetter,
          currentPath,
          newName
        );

      if (result.success) {
                addNotification({
          type: "folder",
          title: "Folder Created",
          message: newName,
        });

  showToast("createFolder", "📁");

  setRenameOpen(false);
  setRenameFile(null);
  setCreateFolderMode(false);

  await loadFiles(currentPath);

} else {

        alert("❌ " + result.message);

      }

      return;

    }

    // ----------------------------
    // Rename File / Folder
    // ----------------------------

    if (!renameFile) return;

    const result =
      await bridge.renameUSBFile(
        renameFile.fullPath,
        newName
      );

    if (result.success) {

  addNotification({
    type: "rename",
    title: "File Renamed",
    message: `${renameFile.name} → ${newName}`,
  });

  showToast("rename", "✏️");

  setRenameOpen(false);
  setRenameFile(null);
  setCreateFolderMode(false);

  await loadFiles(currentPath);

} else {

  alert("❌ " + result.message);

}

  };
    // ======================================================
  // Storage Information
  // ======================================================

  const totalCapacity = useMemo(() => {

    if (!selectedUSB) return 0;

    return selectedUSB.Size || 0;

  }, [selectedUSB]);

  // ======================================================
  // Filter & Sort Files
  // ======================================================

  const filteredFiles = useMemo(() => {

    let data = [...files];

    // --------------------------
    // Search
    // --------------------------

    if (search.trim()) {

      const keyword = search.toLowerCase();

      data = data.filter((file) =>
        file.name.toLowerCase().includes(keyword)
      );

    }

    // --------------------------
    // Sort
    // --------------------------

    switch (sortBy) {

      case "size":

        data.sort((a, b) => b.size - a.size);
        break;

      case "date":

        data.sort(
          (a, b) =>
            new Date(b.modified) -
            new Date(a.modified)
        );

        break;

      case "name":

      default:

        data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

    }

    return data;

  }, [files, search, sortBy]);

  // ======================================================
  // Error Screen
  // ======================================================
if (vaultLocked) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] p-6">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-8 text-center backdrop-blur-xl">

        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10">
          <ShieldCheck
            size={40}
            className="text-cyan-400"
          />
        </div>

        {/* Title */}
        <h2 className="mt-6 text-2xl font-bold text-white">
          PenX Vault Locked
        </h2>

        {/* Description */}
        <p className="mt-3 text-slate-400">
          Your secure vault is currently locked.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Unlock the vault to access your protected files.
        </p>

        {/* Unlock Button */}
        <button
          type="button"
          onClick={() => {
            setUnlockPassword("");
            setUnlockError("");
            setUnlockDialogOpen(true);
          }}
          className="mt-7 inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98]"
        >
          🔓 Unlock Vault
        </button>

      </div>

      {/* Unlock Dialog */}
      {unlockDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10">
                <ShieldCheck
                  size={28}
                  className="text-cyan-400"
                />
              </div>

              <h3 className="mt-4 text-xl font-bold text-white">
                Unlock PenX Vault
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Enter your vault password to continue.
              </p>

            </div>

            {/* Password */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Vault Password
              </label>

              <input
                  type="password"
                  value={unlockPassword}

                  onChange={(event) => {
                    setUnlockPassword(event.target.value);
                    setUnlockError("");
                  }}

                  onKeyDown={async (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();

                      if (!unlockPassword.trim()) {
                        setUnlockError(
                          "Please enter your vault password."
                        );
                        return;
                      }

                      await handleUnlockVault(
                        unlockPassword
                      );
                    }
                  }}

                  placeholder="Enter vault password"
                  autoFocus

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                />

              {unlockError && (
                <p className="mt-2 text-sm text-red-400">
                  {unlockError}
                </p>
              )}

            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  setUnlockDialogOpen(false);
                  setUnlockPassword("");
                  setUnlockError("");
                }}
                className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!unlockPassword.trim()) {
                    setUnlockError(
                      "Please enter your vault password."
                    );
                    return;
                  }

                  await handleUnlockVault(
                    unlockPassword
                  );
                }}
                className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Unlock
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
    // ======================================================
  // Render
  // ======================================================

  return (

    <div className="penx-explorer min-h-screen bg-[#020617] p-6">

      {/* Storage Card */}
      <ExplorerStorageCard
        files={filteredFiles}
        totalCapacity={totalCapacity}
      />

      {/* Toolbar */}
      <ExplorerToolbar
        search={search}
        onSearch={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onRefresh={handleRefresh}
        onUpload={handleUpload}
        onNewFolder={handleNewFolderClick}
      />

      {/* Breadcrumb */}
      <ExplorerBreadcrumb
        driveLetter={selectedUSB?.DriveLetter || ""}
        currentPath={currentPath}
        onBack={handleBack}
        onHome={handleHome}
        onNavigate={handleNavigate}
      />

      <div
        className="flex-1"
        onContextMenu={(event) => {
          if (event.target !== event.currentTarget) return;

          event.preventDefault();

          console.log("Background Right Click");

          setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            file: null,
          });
        }}
      >

        <ExplorerFileList
          files={filteredFiles}
          loading={loading}
          search={search}
          selectedFile={selectedFile}
          viewMode={viewMode}
          onOpen={handleOpen}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onRename={handleRenameClick}
          onRefresh={handleRefresh}
          onContextMenu={handleContextMenu}
        />

      </div>

      {/* Rename / Create Folder Modal */}
      <RenameModal
        open={renameOpen}
        currentName={renameFile?.name || ""}
        createFolderMode={createFolderMode}
        onClose={() => {
          setRenameOpen(false);
          setRenameFile(null);
          setCreateFolderMode(false);
        }}
        onRename={handleRenameConfirm}
      />
      <ExplorerContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        file={contextMenu.file}
        onOpen={() => handleOpen(contextMenu.file)}
        onCopy={() => handleCopy(contextMenu.file)}
        onCut={() => handleCut(contextMenu.file)}
        onPaste={handlePaste}
        onRename={() => handleRenameClick(contextMenu.file)}
        onDelete={() => handleDelete(contextMenu.file)}
        onNewFolder={handleNewFolderClick}
        onEncrypt={() => handleEncrypt(contextMenu.file)}
        onDecrypt={() => handleDecrypt(contextMenu.file)}
        onRefresh={handleRefresh}
        onClose={closeContextMenu}
      />
      <ExplorerToast
        show={toast.show}
        icon={toast.icon}
        telugu={toast.telugu}
        english={toast.english}
      />
              <PasswordDialog
          open={passwordDialogOpen}
          mode={passwordDialogMode}
          file={selectedFile}
          vaultImportMode={vaultImportMode}
          onCancel={() => {
            setPasswordDialogOpen(false);
            setSelectedFile(null);
            setVaultImportMode(false);
          }}
          onConfirm={
            vaultImportMode
              ? performVaultImport
              : passwordDialogMode === "encrypt"
                ? performEncryption
                : performDecryption
          }
        />

        <SuccessDialog
          open={successDialogOpen}
          type={successType}
          fileName={successFileName}
          onClose={() => setSuccessDialogOpen(false)}
        />
    </div>

  );

};

export default function PenXExplorer(props) {
  return (
    <USBAccessGate>
      {({ device, user, bridge }) => (
        <OwnedExplorer
          {...props}
          key={`${user.id}:${device.SerialNumber}:${device.DriveLetter}`}
          user={user}
          authorizedUSB={device}
          bridge={bridge}
        />
      )}
    </USBAccessGate>
  );
}