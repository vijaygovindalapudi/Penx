import crypto from "crypto";

import {
  KEY_LENGTH,
  PBKDF2_ITERATIONS,
  HASH_ALGORITHM,
} from "./cryptoConstants.js";

// ======================================================
// Random Bytes
// ======================================================

export function randomBytes(length) {
  return crypto.randomBytes(length);
}

// ======================================================
// Derive AES Key From Password
// ======================================================

export function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    HASH_ALGORITHM
  );
}

// ======================================================
// SHA-256 Hash (Optional Utility)
// ======================================================

export function createHash(data) {
  return crypto
    .createHash(HASH_ALGORITHM)
    .update(data)
    .digest("hex");
}