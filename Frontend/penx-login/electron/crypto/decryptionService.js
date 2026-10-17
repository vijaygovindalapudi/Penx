import { leaf, noLinks } from "../security/pathPolicy.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import {
  ALGORITHM,
  IV_LENGTH,
  SALT_LENGTH,
  TAG_LENGTH,
  FILE_MAGIC,
  FILE_VERSION,
} from "./cryptoConstants.js";

import {
  deriveKey,
} from "./cryptoUtils.js";

// ======================================================
// Validate Input
// ======================================================

function validateInputs(
  sourcePath,
  password,
  destinationFolder
) {
  if (!sourcePath) {
    throw new Error(
      "Encrypted file path is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  if (!destinationFolder) {
    throw new Error(
      "Destination folder is required."
    );
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      "Encrypted file not found."
    );
  }

  const stat =
    fs.statSync(sourcePath);

  if (!stat.isFile()) {
    throw new Error(
      "Encrypted source is not a file."
    );
  }

  // Destination must be a directory path,
  // not the encrypted source itself.
  if (
    path.resolve(destinationFolder) ===
    path.resolve(sourcePath)
  ) {
    throw new Error(
      "Invalid decryption destination."
    );
  }
}

// ======================================================
// Read PenX Header
// ======================================================

function readHeader(fileBuffer) {
  let offset = 0;

  const minimumHeaderSize =
    4 +
    1 +
    SALT_LENGTH +
    IV_LENGTH +
    2;

  if (
    fileBuffer.length <
    minimumHeaderSize + TAG_LENGTH
  ) {
    throw new Error(
      "Invalid or corrupted PenX file."
    );
  }

  // ----------------------------------------------------
  // Magic
  // ----------------------------------------------------

  const magic =
    fileBuffer
      .subarray(
        offset,
        offset + 4
      )
      .toString();

  offset += 4;

  if (magic !== FILE_MAGIC) {
    throw new Error(
      "Invalid PenX file."
    );
  }

  // ----------------------------------------------------
  // Version
  // ----------------------------------------------------

  const version =
    fileBuffer.readUInt8(
      offset
    );

  offset += 1;

  if (version !== FILE_VERSION) {
    throw new Error(
      `Unsupported PenX file version: ${version}`
    );
  }

  // ----------------------------------------------------
  // Salt
  // ----------------------------------------------------

  if (
    offset + SALT_LENGTH >
    fileBuffer.length
  ) {
    throw new Error(
      "Invalid PenX salt."
    );
  }

  const salt =
    fileBuffer.subarray(
      offset,
      offset + SALT_LENGTH
    );

  offset += SALT_LENGTH;

  // ----------------------------------------------------
  // IV
  // ----------------------------------------------------

  if (
    offset + IV_LENGTH >
    fileBuffer.length
  ) {
    throw new Error(
      "Invalid PenX IV."
    );
  }

  const iv =
    fileBuffer.subarray(
      offset,
      offset + IV_LENGTH
    );

  offset += IV_LENGTH;

  // ----------------------------------------------------
  // Filename Length
  // ----------------------------------------------------

  if (
    offset + 2 >
    fileBuffer.length
  ) {
    throw new Error(
      "Invalid PenX filename header."
    );
  }

  const nameLength =
    fileBuffer.readUInt16BE(
      offset
    );

  offset += 2;

  // ----------------------------------------------------
  // Filename Validation
  // ----------------------------------------------------

  if (nameLength <= 0) {
    throw new Error(
      "Invalid original filename."
    );
  }

  if (
    offset + nameLength >
    fileBuffer.length - TAG_LENGTH
  ) {
    throw new Error(
      "Corrupted PenX filename data."
    );
  }

  // ----------------------------------------------------
  // Original Filename
  // ----------------------------------------------------

  const fileName =
    fileBuffer
      .subarray(
        offset,
        offset + nameLength
      )
      .toString("utf8");

  offset += nameLength;

  if (!fileName) {
    throw new Error(
      "Original filename is empty."
    );
  }

  // ----------------------------------------------------
  // Prevent Path Traversal
  // ----------------------------------------------------

  const safeFileName =
    path.basename(fileName);

  if (
    safeFileName !== fileName
  ) {
    throw new Error(
      "Invalid filename stored in PenX file."
    );
  }

  return {
    version,
    salt,
    iv,
    fileName,
    dataOffset: offset,
  };
}

// ======================================================
// Build Output Path
// ======================================================

function buildOutputPath(
  destinationFolder,
  originalFileName
) {
  const safeFileName = leaf(originalFileName);

  return path.join(
    destinationFolder,
    safeFileName
  );
}

// ======================================================
// Decryption
// ======================================================

export async function decryptFile(
  sourcePath,
  password,
  destinationFolder
) {
  // ----------------------------------------------------
  // Validate
  // ----------------------------------------------------

  validateInputs(
    sourcePath,
    password,
    destinationFolder
  );

  // ----------------------------------------------------
  // Read Encrypted File
  // ----------------------------------------------------

  const fileBuffer =
    await fs.promises.readFile(
      sourcePath
    );

  // ----------------------------------------------------
  // Read Header
  // ----------------------------------------------------

  const header =
    readHeader(
      fileBuffer
    );

  // ----------------------------------------------------
  // Authentication Tag
  // ----------------------------------------------------

  const authTag =
    fileBuffer.subarray(
      fileBuffer.length -
        TAG_LENGTH
    );

  if (
    authTag.length !== TAG_LENGTH
  ) {
    throw new Error(
      "Invalid authentication tag."
    );
  }

  // ----------------------------------------------------
  // Encrypted Data
  // ----------------------------------------------------

  const encryptedData =
    fileBuffer.subarray(
      header.dataOffset,
      fileBuffer.length -
        TAG_LENGTH
    );

  if (
    encryptedData.length <= 0
  ) {
    throw new Error(
      "PenX file contains no encrypted data."
    );
  }

  // ----------------------------------------------------
  // Derive AES Key
  // ----------------------------------------------------

  const key =
    deriveKey(
      password,
      header.salt
    );

  // ----------------------------------------------------
  // AES-256-GCM Decipher
  // ----------------------------------------------------

  const decipher =
    crypto.createDecipheriv(
      ALGORITHM,
      key,
      header.iv
    );

  decipher.setAuthTag(
    authTag
  );

  try {
    // --------------------------------------------------
    // Decrypt
    // --------------------------------------------------

    const decryptedBuffer =
      Buffer.concat([
        decipher.update(
          encryptedData
        ),
        decipher.final(),
      ]);

    // --------------------------------------------------
    // Destination Folder
    // --------------------------------------------------

    await fs.promises.mkdir(
      destinationFolder,
      {
        recursive: true,
      }
    );

    // --------------------------------------------------
    // Output Path
    // --------------------------------------------------

    const outputPath =
      buildOutputPath(
        destinationFolder,
        header.fileName
      );

    // --------------------------------------------------
    // Safety Check
    // --------------------------------------------------

    if (
      path.resolve(outputPath) ===
      path.resolve(sourcePath)
    ) {
      throw new Error(
        "Cannot decrypt over the encrypted source file."
      );
    }

    // --------------------------------------------------
    // Avoid Accidental Overwrite
    // --------------------------------------------------

    let finalOutputPath =
      outputPath;

    try {
      await fs.promises.access(
        finalOutputPath
      );

      const parsed =
        path.parse(
          outputPath
        );

      finalOutputPath =
        path.join(
          destinationFolder,
          `${parsed.name} (${Date.now()})${parsed.ext}`
        );

    } catch {
      // File does not exist.
    }

    // --------------------------------------------------
    // Write Original File
    // --------------------------------------------------

    await noLinks(finalOutputPath, true);
    await fs.promises.writeFile(
      finalOutputPath,
      decryptedBuffer,
      {flag: "wx"}
    );

    // --------------------------------------------------
    // Return
    // --------------------------------------------------

    return {
      success: true,

      outputPath:
        finalOutputPath,

      fileName:
        path.basename(
          finalOutputPath
        ),

      message:
        "File decrypted successfully.",
    };

  } catch (error) {
    console.error(
      "Decryption Error:",
      error
    );

    // Do not expose crypto internals.
    throw new Error(
      "Invalid password or corrupted PenX file."
    );
  }
}