import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import {
  identityExists,
  createIdentity,
  readIdentity,
} from "../utils/penxIdentity.js";

import {
  readMetadata,
  writeMetadata,
  addFile,
  deleteFile,
  renameFile,
} from "../utils/vaultMetadata.js";

import {
  encryptFile,
} from "../crypto/encryptionService.js";

import {
  decryptFile,
} from "../crypto/decryptionService.js";

// ======================================================
// Constants
// ======================================================

const PENX_FOLDER = ".penx";
const VAULT_FOLDER = "vault";
const METADATA_FOLDER = "metadata";
const KEYS_FOLDER = "keys";
const LOGS_FOLDER = "logs";

// ======================================================
// Helpers
// ======================================================

function getPenxPath(driveLetter) {

  return path.join(
    driveLetter,
    PENX_FOLDER
  );

}

function getVaultPath(driveLetter) {

  return path.join(
    getPenxPath(driveLetter),
    VAULT_FOLDER
  );

}

function getMetadataPath(driveLetter) {

  return path.join(
    getPenxPath(driveLetter),
    METADATA_FOLDER
  );

}

function getKeysPath(driveLetter) {

  return path.join(
    getPenxPath(driveLetter),
    KEYS_FOLDER
  );

}

function getLogsPath(driveLetter) {

  return path.join(
    getPenxPath(driveLetter),
    LOGS_FOLDER
  );

}

// ======================================================
// Validate Drive
// ======================================================

async function validateDrive(
  driveLetter
) {

  if (!driveLetter) {

    throw new Error(
      "USB drive letter is required."
    );

  }

  try {

    const stat =
      await fs.stat(
        driveLetter
      );

    if (!stat.isDirectory()) {

      throw new Error(
        "Invalid USB drive."
      );

    }

  } catch (error) {

    if (
      error.code === "ENOENT"
    ) {

      throw new Error(
        "USB drive is not available."
      );

    }

    throw error;

  }

}

// ======================================================
// Validate Owner
// ======================================================

function validateOwner(owner) {

  if (!owner) {

    throw new Error(
      "Vault owner information is required."
    );

  }

  if (!owner.owner_id) {

    throw new Error(
      "Owner ID is required."
    );

  }

}

// ======================================================
// Verify USB Ownership
// ======================================================

async function verifyOwnership(
  driveLetter,
  owner
) {

  validateOwner(owner);

  const exists =
    await identityExists(
      driveLetter
    );

  // No identity yet.
  // It will be created during initialization.
  if (!exists) {
    return true;
  }

  const identity =
    await readIdentity(
      driveLetter
    );

  if (!identity) {

    throw new Error(
      "Invalid PenX USB identity."
    );

  }

  if (
    String(identity.owner_id) !==
    String(owner.owner_id)
  ) {

    throw new Error(
      "This PenX USB belongs to another account."
    );

  }

  return true;

}

// ======================================================
// Initialize Vault
// ======================================================

export async function initializeVault(
  driveLetter,
  owner
) {

  await validateDrive(
    driveLetter
  );

  validateOwner(
    owner
  );

  const penxPath =
    getPenxPath(
      driveLetter
    );

  // ----------------------------------------------------
  // Verify existing ownership
  // ----------------------------------------------------

  await verifyOwnership(
    driveLetter,
    owner
  );

  // ----------------------------------------------------
  // Create .penx
  // ----------------------------------------------------

  await fs.mkdir(
    penxPath,
    {
      recursive: true,
    }
  );

  // ----------------------------------------------------
  // Create vault
  // ----------------------------------------------------

  await fs.mkdir(
    getVaultPath(
      driveLetter
    ),
    {
      recursive: true,
    }
  );

  // ----------------------------------------------------
  // Create metadata
  // ----------------------------------------------------

  await fs.mkdir(
    getMetadataPath(
      driveLetter
    ),
    {
      recursive: true,
    }
  );

  // ----------------------------------------------------
  // Create keys
  // ----------------------------------------------------

  await fs.mkdir(
    getKeysPath(
      driveLetter
    ),
    {
      recursive: true,
    }
  );

  // ----------------------------------------------------
  // Create logs
  // ----------------------------------------------------

  await fs.mkdir(
    getLogsPath(
      driveLetter
    ),
    {
      recursive: true,
    }
  );

  // ----------------------------------------------------
  // Create identity if missing
  // ----------------------------------------------------

  if (
    !(await identityExists(
      driveLetter
    ))
  ) {

    await createIdentity(
      driveLetter,
      owner
    );

  }

  // ----------------------------------------------------
  // Ensure metadata exists
  // ----------------------------------------------------

  const metadata =
    await readMetadata(
      driveLetter
    );

  if (
    !Array.isArray(metadata)
  ) {

    await writeMetadata(
      driveLetter,
      []
    );

  }

  return {

    success: true,

    message:
      "Vault initialized successfully.",

  };

}

// ======================================================
// Import File
// ======================================================

export async function importFile(
  sourcePath,
  driveLetter,
  password,
  owner
) {

  if (!sourcePath) {

    throw new Error(
      "Source file is required."
    );

  }

  if (!password) {

    throw new Error(
      "Vault password is required."
    );

  }

  // ----------------------------------------------------
  // Initialize / verify vault
  // ----------------------------------------------------

  await initializeVault(
    driveLetter,
    owner
  );

  // ----------------------------------------------------
  // Verify source file
  // ----------------------------------------------------

  const sourceStat =
    await fs.stat(
      sourcePath
    );

  if (!sourceStat.isFile()) {

    throw new Error(
      "Selected source is not a file."
    );

  }

  // ----------------------------------------------------
  // Vault folder
  // ----------------------------------------------------

  const vaultFolder =
    getVaultPath(
      driveLetter
    );

  // ----------------------------------------------------
  // Encrypt directly into vault
  // ----------------------------------------------------

  const encrypted =
    await encryptFile(
      sourcePath,
      password,
      vaultFolder
    );

  if (
    !encrypted ||
    !encrypted.success
  ) {

    throw new Error(
      "File encryption failed."
    );

  }

  // ----------------------------------------------------
  // Create metadata
  // ----------------------------------------------------

  const metadata = {

    id:
      crypto.randomUUID(),

    original_name:
      encrypted.originalName,

    encrypted_name:
      encrypted.encryptedName,

    size:
      encrypted.size,

    encrypted_size:
      encrypted.encryptedSize,

    created_at:
      encrypted.createdAt,

  };

  // ----------------------------------------------------
  // Save metadata
  // ----------------------------------------------------

  await addFile(
    driveLetter,
    metadata
  );

  return {

    success: true,

    file: metadata,

    message:
      "File imported into PenX Vault successfully.",

  };

}

// ======================================================
// Export File
// ======================================================

export async function exportFile(
  encryptedFile,
  destinationFolder,
  password
) {
  // ----------------------------------------------------
  // Validate inputs
  // ----------------------------------------------------

  if (!encryptedFile) {
    throw new Error(
      "Encrypted file is required."
    );
  }

  if (!destinationFolder) {
    throw new Error(
      "Destination folder is required."
    );
  }

  if (!password) {
    throw new Error(
      "Vault password is required."
    );
  }

  // ----------------------------------------------------
  // Resolve encrypted file path
  // ----------------------------------------------------

  let encryptedPath;
  let originalName = null;

  /*
    encryptedFile can be:

    1. Full physical path
    2. Metadata object
    3. Encrypted filename
  */

  if (
    typeof encryptedFile === "object"
  ) {
    originalName =
      encryptedFile.original_name ||
      null;

    if (
      encryptedFile.encrypted_name
    ) {
      encryptedPath =
        path.join(
          encryptedFile.driveLetter || "",
          PENX_FOLDER,
          VAULT_FOLDER,
          encryptedFile.encrypted_name
        );
    }
  } else {
    encryptedPath =
      String(encryptedFile);
  }

  // ----------------------------------------------------
  // Validate encrypted path
  // ----------------------------------------------------

  if (!encryptedPath) {
    throw new Error(
      "Encrypted file path is required."
    );
  }

  // ----------------------------------------------------
  // Verify encrypted file exists
  // ----------------------------------------------------

  try {
    const stat =
      await fs.stat(
        encryptedPath
      );

    if (!stat.isFile()) {
      throw new Error(
        "Encrypted vault item is not a file."
      );
    }

  } catch (error) {
    if (
      error.code === "ENOENT"
    ) {
      throw new Error(
        "Encrypted vault file not found."
      );
    }

    throw error;
  }

  // ----------------------------------------------------
  // Resolve destination folder
  // ----------------------------------------------------

  const safeDestination =
    path.resolve(
      destinationFolder
    );

  await fs.mkdir(
    safeDestination,
    {
      recursive: true,
    }
  );

  // ----------------------------------------------------
  // Decrypt directly into destination
  // ----------------------------------------------------

  const decrypted =
    await decryptFile(
      encryptedPath,
      password,
      safeDestination
    );

  if (
    !decrypted ||
    !decrypted.success
  ) {
    throw new Error(
      "File decryption failed."
    );
  }

  // ----------------------------------------------------
  // Get output information
  // ----------------------------------------------------

  const outputPath =
    decrypted.outputPath ||
    decrypted.data?.outputPath;

  const decryptedName =
    decrypted.fileName ||
    decrypted.data?.fileName ||
    originalName;

  if (!outputPath) {
    throw new Error(
      "Decryption output was not created."
    );
  }

  if (!decryptedName) {
    throw new Error(
      "Original file name could not be determined."
    );
  }

  // ----------------------------------------------------
  // Return result
  // ----------------------------------------------------

  return {
    success: true,

    outputPath,

    fileName:
      path.basename(
        decryptedName
      ),

    message:
      "File exported successfully.",
  };
}

// ======================================================
// List Vault Files
// ======================================================

export async function listVaultFiles(
  driveLetter
) {

  await validateDrive(
    driveLetter
  );

  const files =
    await readMetadata(
      driveLetter
    );

  return {

    success: true,

    files:
      Array.isArray(files)
        ? files
        : [],

  };

}

// ======================================================
// Delete Vault File
// ======================================================

export async function deleteVaultFile(
  driveLetter,
  fileId
) {

  await validateDrive(
    driveLetter
  );

  if (!fileId) {

    throw new Error(
      "File ID is required."
    );

  }

  const metadata =
    await readMetadata(
      driveLetter
    );

  const file =
    metadata.find(
      item =>
        item.id === fileId
    );

  if (!file) {

    throw new Error(
      "Vault file not found."
    );

  }

  // ----------------------------------------------------
  // Physical encrypted file
  // ----------------------------------------------------

  if (
    file.encrypted_name
  ) {

    const encryptedPath =
      path.join(
        getVaultPath(
          driveLetter
        ),
        path.basename(
          file.encrypted_name
        )
      );

    try {

      await fs.unlink(
        encryptedPath
      );

    } catch (error) {

      if (
        error.code !== "ENOENT"
      ) {

        throw error;

      }

    }

  }

  // ----------------------------------------------------
  // Metadata
  // ----------------------------------------------------

  await deleteFile(
    driveLetter,
    fileId
  );

  return {

    success: true,

    message:
      "Vault file deleted successfully.",

  };

}

// ======================================================
// Rename Vault File
// ======================================================

export async function renameVaultFile(
  driveLetter,
  fileId,
  newName
) {

  await validateDrive(
    driveLetter
  );

  if (!fileId) {

    throw new Error(
      "File ID is required."
    );

  }

  if (!newName) {

    throw new Error(
      "New file name is required."
    );

  }

  // ----------------------------------------------------
  // Prevent path traversal
  // ----------------------------------------------------

  const safeName =
    path.basename(
      newName
    );

  if (
    safeName !== newName
  ) {

    throw new Error(
      "Invalid file name."
    );

  }

  // ----------------------------------------------------
  // Rename metadata only
  // ----------------------------------------------------
  //
  // The physical encrypted file keeps its random UUID.
  //
  // This is intentional.
  //

  await renameFile(
    driveLetter,
    fileId,
    safeName
  );

  return {

    success: true,

    message:
      "Vault file renamed successfully.",

  };

}