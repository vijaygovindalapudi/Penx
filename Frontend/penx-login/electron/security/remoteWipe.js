import fs from "fs/promises";
import path from "path";

const PENX_FOLDER = ".penx";

const WIPE_DIRECTORIES = [
  "vault",
  "metadata",
  "keys",
  "logs",
];

const IDENTITY_FILE = "identity.json";

// ======================================================
// Helpers
// ======================================================

function getPenxPath(driveLetter) {
  return path.join(
    driveLetter,
    PENX_FOLDER
  );
}

function getIdentityPath(driveLetter) {
  return path.join(
    getPenxPath(driveLetter),
    IDENTITY_FILE
  );
}

async function validateDrive(driveLetter) {
  if (!driveLetter) {
    throw new Error(
      "USB drive letter is required."
    );
  }

  const stat = await fs.stat(
    driveLetter
  );

  if (!stat.isDirectory()) {
    throw new Error(
      "Invalid USB drive."
    );
  }
}

// ======================================================
// Secure Local Wipe
// ======================================================

export async function executeRemoteWipe(
  driveLetter
) {
  await validateDrive(
    driveLetter
  );

  const penxPath =
    getPenxPath(
      driveLetter
    );

  // ----------------------------------------------------
  // Check PenX installation
  // ----------------------------------------------------

  try {
    await fs.access(
      penxPath
    );
  } catch {
    throw new Error(
      "PenX vault was not found on this USB."
    );
  }

  // ----------------------------------------------------
  // Step 1
  // Destroy local key material
  // ----------------------------------------------------

  const keysPath =
    path.join(
      penxPath,
      "keys"
    );

  await removeDirectoryContents(
    keysPath
  );

  // ----------------------------------------------------
  // Step 2
  // Remove encrypted vault files
  // ----------------------------------------------------

  const vaultPath =
    path.join(
      penxPath,
      "vault"
    );

  await removeDirectoryContents(
    vaultPath
  );

  // ----------------------------------------------------
  // Step 3
  // Remove metadata
  // ----------------------------------------------------

  const metadataPath =
    path.join(
      penxPath,
      "metadata"
    );

  await removeDirectoryContents(
    metadataPath
  );

  // ----------------------------------------------------
  // Step 4
  // Remove local security logs
  // ----------------------------------------------------

  const logsPath =
    path.join(
      penxPath,
      "logs"
    );

  await removeDirectoryContents(
    logsPath
  );

  // ----------------------------------------------------
  // Step 5
  // Remove PenX identity
  // ----------------------------------------------------

  const identityPath =
    getIdentityPath(
      driveLetter
    );

  try {
    await fs.unlink(
      identityPath
    );
  } catch (error) {

    if (
      error.code !== "ENOENT"
    ) {
      throw error;
    }

  }

  // ----------------------------------------------------
  // Recreate empty structure
  // ----------------------------------------------------

  await fs.mkdir(
    vaultPath,
    {
      recursive: true,
    }
  );

  await fs.mkdir(
    metadataPath,
    {
      recursive: true,
    }
  );

  await fs.mkdir(
    keysPath,
    {
      recursive: true,
    }
  );

  await fs.mkdir(
    logsPath,
    {
      recursive: true,
    }
  );

  return {
    success: true,
    message:
      "PenX remote wipe completed successfully.",
  };
}

// ======================================================
// Remove Directory Contents
// ======================================================

async function removeDirectoryContents(
  directoryPath
) {
  try {

    const entries =
      await fs.readdir(
        directoryPath,
        {
          withFileTypes: true,
        }
      );

    for (
      const entry of entries
    ) {

      const entryPath =
        path.join(
          directoryPath,
          entry.name
        );

      if (
        entry.isDirectory()
      ) {

        await fs.rm(
          entryPath,
          {
            recursive: true,
            force: true,
          }
        );

      } else {

        await fs.unlink(
          entryPath
        );

      }

    }

  } catch (error) {

    if (
      error.code === "ENOENT"
    ) {

      await fs.mkdir(
        directoryPath,
        {
          recursive: true,
        }
      );

      return;
    }

    throw error;
  }
}