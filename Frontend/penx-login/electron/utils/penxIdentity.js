import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const PENX_FOLDER = ".penx";
const IDENTITY_FILE = "identity.json";

// ======================================================
// Get Paths
// ======================================================

export function getPenXPath(driveLetter) {
  return path.join(driveLetter, PENX_FOLDER);
}

export function getIdentityPath(driveLetter) {
  return path.join(
    getPenXPath(driveLetter),
    IDENTITY_FILE
  );
}

// ======================================================
// Identity Exists
// ======================================================

export async function identityExists(
  driveLetter
) {
  try {

    await fs.access(
      getIdentityPath(driveLetter)
    );

    return true;

  } catch {

    return false;

  }
}

// ======================================================
// Read Identity
// ======================================================

export async function readIdentity(
  driveLetter
) {

  const data = await fs.readFile(
    getIdentityPath(driveLetter),
    "utf8"
  );

  return JSON.parse(data);

}

// ======================================================
// Create PenX Folder Structure
// ======================================================

async function createFolderStructure(
  driveLetter
) {

  const penx = getPenXPath(
    driveLetter
  );

  await fs.mkdir(
    penx,
    {
      recursive: true,
    }
  );

  await fs.mkdir(
    path.join(penx, "vault"),
    {
      recursive: true,
    }
  );

  await fs.mkdir(
    path.join(penx, "metadata"),
    {
      recursive: true,
    }
  );

  await fs.mkdir(
    path.join(penx, "keys"),
    {
      recursive: true,
    }
  );

  await fs.mkdir(
    path.join(penx, "logs"),
    {
      recursive: true,
    }
  );

}

// ======================================================
// Create Identity
// ======================================================

export async function createIdentity(
  driveLetter,
  owner
) {

  await createFolderStructure(
    driveLetter
  );

  const identity = {

    usb_id:
      crypto.randomUUID(),

    owner_id:
      owner.owner_id,

    owner_name:
      owner.owner_name,

    owner_email:
      owner.owner_email,

    created_at:
      new Date().toISOString(),

    vault_version:
      "1.0",

    encryption:
      "AES-256-GCM",

    status:
      "ACTIVE",

  };

  await fs.writeFile(

    getIdentityPath(
      driveLetter
    ),

    JSON.stringify(
      identity,
      null,
      2
    )

  );

  return identity;

}