import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import {
  KEY_LENGTH,
  PBKDF2_ITERATIONS,
  HASH_ALGORITHM,
} from "./cryptoConstants.js";

const PENX_FOLDER = ".penx";
const KEYS_FOLDER = "keys";
const VERIFIER_FILE = "vault.verifier";

// =====================================================
// Get verifier path
// =====================================================

function getVerifierPath(driveLetter) {
  return path.join(
    driveLetter,
    PENX_FOLDER,
    KEYS_FOLDER,
    VERIFIER_FILE
  );
}

// =====================================================
// Check whether Vault Password is configured
// =====================================================

export async function hasVaultVerifier(
  driveLetter
) {
  if (!driveLetter) {
    return false;
  }

  const verifierPath =
    getVerifierPath(driveLetter);

  try {
    await fs.access(verifierPath);

    return true;
  } catch {
    return false;
  }
}

// =====================================================
// Derive password verifier
// =====================================================

function deriveVerifier(password, salt) {
  return crypto
    .pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      HASH_ALGORITHM
    )
    .toString("hex");
}

// =====================================================
// Create Vault Password
// =====================================================

export async function createVaultVerifier(
  driveLetter,
  password
) {
  if (!driveLetter) {
    throw new Error(
      "USB drive is not available."
    );
  }

  if (!password) {
    throw new Error(
      "Vault password is required."
    );
  }

  if (password.length < 8) {
    throw new Error(
      "Vault password must contain at least 8 characters."
    );
  }

  const keysFolder = path.join(
    driveLetter,
    PENX_FOLDER,
    KEYS_FOLDER
  );

  const verifierPath =
    getVerifierPath(driveLetter);

  // ---------------------------------------------------
  // Make sure PenX keys folder exists
  // ---------------------------------------------------

  await fs.mkdir(keysFolder, {
    recursive: true,
  });

  // ---------------------------------------------------
  // Prevent accidental password replacement
  // ---------------------------------------------------

  if (await hasVaultVerifier(driveLetter)) {
    throw new Error(
      "A Vault Password is already configured."
    );
  }

  // ---------------------------------------------------
  // Generate random salt
  // ---------------------------------------------------

  const salt = crypto.randomBytes(16);

  // ---------------------------------------------------
  // Derive verifier
  // ---------------------------------------------------

  const verifier = deriveVerifier(
    password,
    salt
  );

  // ---------------------------------------------------
  // Data stored on USB
  // ---------------------------------------------------

  const verifierData = {
    version: 1,
    algorithm: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    key_length: KEY_LENGTH,
    salt: salt.toString("hex"),
    verifier,
    created_at: new Date().toISOString(),
  };

  // ---------------------------------------------------
  // Write verifier
  // ---------------------------------------------------

  await fs.writeFile(
    verifierPath,
    JSON.stringify(
      verifierData,
      null,
      2
    ),
    {
      encoding: "utf8",
      flag: "wx",
    }
  );

  return {
    success: true,
    path: verifierPath,
    message:
      "Vault Password configured successfully.",
  };
}

// =====================================================
// Verify Vault Password
// =====================================================

export async function verifyVaultPassword(
  driveLetter,
  password
) {
  if (!driveLetter) {
    throw new Error(
      "USB drive is not available."
    );
  }

  if (!password) {
    throw new Error(
      "Vault password is required."
    );
  }

  const verifierPath =
    getVerifierPath(driveLetter);

  // ---------------------------------------------------
  // Read verifier
  // ---------------------------------------------------

  let rawData;

  try {
    rawData = await fs.readFile(
      verifierPath,
      "utf8"
    );
  } catch {
    throw new Error(
      "Vault Password is not configured on this USB."
    );
  }

  // ---------------------------------------------------
  // Parse verifier
  // ---------------------------------------------------

  let verifierData;

  try {
    verifierData =
      JSON.parse(rawData);
  } catch {
    throw new Error(
      "Vault password verifier is corrupted."
    );
  }

  // ---------------------------------------------------
  // Validate verifier format
  // ---------------------------------------------------

  if (
    verifierData.version !== 1 ||
    verifierData.algorithm !==
      "PBKDF2-SHA256" ||
    !verifierData.salt ||
    !verifierData.verifier
  ) {
    throw new Error(
      "Invalid vault password verifier."
    );
  }

  // ---------------------------------------------------
  // Convert salt
  // ---------------------------------------------------

  const salt = Buffer.from(
    verifierData.salt,
    "hex"
  );

  // ---------------------------------------------------
  // Derive candidate verifier
  // ---------------------------------------------------

  const candidateVerifier =
    deriveVerifier(
      password,
      salt
    );

  // ---------------------------------------------------
  // Timing-safe comparison
  // ---------------------------------------------------

  const storedBuffer =
    Buffer.from(
      verifierData.verifier,
      "hex"
    );

  const candidateBuffer =
    Buffer.from(
      candidateVerifier,
      "hex"
    );

  if (
    storedBuffer.length !==
    candidateBuffer.length
  ) {
    return {
      valid: false,
    };
  }

  const valid =
    crypto.timingSafeEqual(
      storedBuffer,
      candidateBuffer
    );

  return {
    valid,
  };
}