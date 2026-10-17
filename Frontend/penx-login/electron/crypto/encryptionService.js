import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

import {
  ALGORITHM,
  IV_LENGTH,
  SALT_LENGTH,
  FILE_EXTENSION,
  FILE_MAGIC,
  FILE_VERSION,
} from "./cryptoConstants.js";

import {
  randomBytes,
  deriveKey,
} from "./cryptoUtils.js";

// ======================================================
// Validate Input
// ======================================================

async function validateInputs(
  sourcePath,
  password
) {

  if (!sourcePath) {
    throw new Error(
      "Source path is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  try {

    const stat =
      await fsPromises.stat(
        sourcePath
      );

    if (!stat.isFile()) {
      throw new Error(
        "Source path is not a file."
      );
    }

  } catch (error) {

    if (
      error.code === "ENOENT"
    ) {

      throw new Error(
        "File not found."
      );

    }

    throw error;

  }

}

// ======================================================
// Build Output Path
// ======================================================

function buildOutputPath(
  sourcePath,
  outputDirectory = null
) {

  // ----------------------------------------------------
  // Vault Mode
  // ----------------------------------------------------

  if (outputDirectory) {

    const encryptedFileName =
      crypto.randomUUID() +
      FILE_EXTENSION;

    return path.join(
      outputDirectory,
      encryptedFileName
    );

  }

  // ----------------------------------------------------
  // Normal Encryption Mode
  // ----------------------------------------------------

  const directory =
    path.dirname(
      sourcePath
    );

  const extension =
    path.extname(
      sourcePath
    );

  const fileName =
    path.basename(
      sourcePath,
      extension
    );

  return path.join(
    directory,
    fileName +
    FILE_EXTENSION
  );

}

// ======================================================
// Create PenX Header
// ======================================================

function createHeader(
  sourcePath,
  salt,
  iv
) {

  const fileName =
    path.basename(
      sourcePath
    );

  const nameBuffer =
    Buffer.from(
      fileName,
      "utf8"
    );

  // ----------------------------------------------------
  // Filename Length
  // ----------------------------------------------------

  if (
    nameBuffer.length >
    65535
  ) {

    throw new Error(
      "File name is too long."
    );

  }

  const lengthBuffer =
    Buffer.alloc(2);

  lengthBuffer.writeUInt16BE(
    nameBuffer.length
  );

  // ----------------------------------------------------
  // PenX Header
  // ----------------------------------------------------

  return Buffer.concat([

    // Magic
    Buffer.from(
      FILE_MAGIC
    ),

    // Version
    Buffer.from([
      FILE_VERSION,
    ]),

    // Salt
    salt,

    // IV
    iv,

    // Filename length
    lengthBuffer,

    // Original filename
    nameBuffer,

  ]);

}

// ======================================================
// Encryption
// ======================================================

export async function encryptFile(
  sourcePath,
  password,
  outputDirectory = null
) {

  // ----------------------------------------------------
  // Validate
  // ----------------------------------------------------

  await validateInputs(
    sourcePath,
    password
  );

  // ----------------------------------------------------
  // Ensure Vault Directory Exists
  // ----------------------------------------------------

  if (outputDirectory) {

    await fsPromises.mkdir(
      outputDirectory,
      {
        recursive: true,
      }
    );

  }

  // ----------------------------------------------------
  // Build Output Path
  // ----------------------------------------------------

  const outputPath =
    buildOutputPath(
      sourcePath,
      outputDirectory
    );

  // ----------------------------------------------------
  // Prevent Same Source / Destination
  // ----------------------------------------------------

  if (
    path.resolve(
      sourcePath
    ) ===
    path.resolve(
      outputPath
    )
  ) {

    throw new Error(
      "Source and destination files cannot be the same."
    );

  }

  // ----------------------------------------------------
  // Generate Salt
  // ----------------------------------------------------

  const salt =
    randomBytes(
      SALT_LENGTH
    );

  // ----------------------------------------------------
  // Generate IV
  // ----------------------------------------------------

  const iv =
    randomBytes(
      IV_LENGTH
    );

  // ----------------------------------------------------
  // Derive AES Key
  // ----------------------------------------------------

  const key =
    deriveKey(
      password,
      salt
    );

  // ----------------------------------------------------
  // Create AES-256-GCM Cipher
  // ----------------------------------------------------

  const cipher =
    crypto.createCipheriv(
      ALGORITHM,
      key,
      iv
    );

  // ----------------------------------------------------
  // Create Header
  // ----------------------------------------------------

  const header =
    createHeader(
      sourcePath,
      salt,
      iv
    );

  // ----------------------------------------------------
  // Streams
  // ----------------------------------------------------

  const readStream =
    fs.createReadStream(
      sourcePath
    );

  const writeStream =
    fs.createWriteStream(
      outputPath
    );

  try {

    // ==================================================
    // Write Header
    // ==================================================

    writeStream.write(
      header
    );

    // ==================================================
    // Encrypt File
    // ==================================================

    await pipeline(
      readStream,
      cipher,
      writeStream
    );

    // ==================================================
    // Get Authentication Tag
    // ==================================================

    const authTag =
      cipher.getAuthTag();

    if (
      !authTag ||
      authTag.length === 0
    ) {

      throw new Error(
        "Failed to generate authentication tag."
      );

    }

    // ==================================================
    // Append Authentication Tag
    // ==================================================

    await fsPromises.appendFile(
      outputPath,
      authTag
    );

    // ==================================================
    // Get File Information
    // ==================================================

    const sourceStat =
      await fsPromises.stat(
        sourcePath
      );

    const encryptedStat =
      await fsPromises.stat(
        outputPath
      );

    // ==================================================
    // Metadata
    // ==================================================

    const originalName =
      path.basename(
        sourcePath
      );

    const encryptedName =
      path.basename(
        outputPath
      );

    const createdAt =
      new Date().toISOString();

    // ==================================================
    // Return
    // ==================================================

    return {

      success: true,

      sourcePath,

      outputPath,

      originalName,

      encryptedName,

      fileName:
        encryptedName,

      size:
        sourceStat.size,

      encryptedSize:
        encryptedStat.size,

      createdAt,

      message:
        "File encrypted successfully.",

    };

  } catch (error) {

    // ==================================================
    // Cleanup Failed Encryption
    // ==================================================

    try {

      await fsPromises.unlink(
        outputPath
      );

    } catch {
      // Ignore cleanup error
    }

    throw error;

  }

}