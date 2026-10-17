import fs from "fs/promises";
import path from "path";

// ======================================================
// Constants
// ======================================================

const PENX_FOLDER = ".penx";
const METADATA_FOLDER = "metadata";
const METADATA_FILE = "files.json";

// ======================================================
// Metadata Directory
// ======================================================

function getMetadataDirectory(
  driveLetter
) {

  return path.join(
    driveLetter,
    PENX_FOLDER,
    METADATA_FOLDER
  );

}

// ======================================================
// Metadata Path
// ======================================================

function getMetadataPath(
  driveLetter
) {

  return path.join(
    getMetadataDirectory(
      driveLetter
    ),
    METADATA_FILE
  );

}

// ======================================================
// Read Metadata
// ======================================================

export async function readMetadata(
  driveLetter
) {

  if (!driveLetter) {
    throw new Error(
      "USB drive letter is required."
    );
  }

  const metadataPath =
    getMetadataPath(
      driveLetter
    );

  try {

    const data =
      await fs.readFile(
        metadataPath,
        "utf8"
      );

    if (!data.trim()) {
      return [];
    }

    const metadata =
      JSON.parse(data);

    if (
      !Array.isArray(metadata)
    ) {

      throw new Error(
        "Invalid vault metadata format."
      );

    }

    return metadata;

  } catch (error) {

    // Metadata file does not exist yet
    if (
      error.code === "ENOENT"
    ) {

      return [];

    }

    // Invalid JSON or other metadata error
    if (
      error instanceof SyntaxError
    ) {

      throw new Error(
        "Vault metadata is corrupted."
      );

    }

    throw error;

  }

}

// ======================================================
// Write Metadata
// ======================================================

export async function writeMetadata(
  driveLetter,
  metadata
) {

  if (!driveLetter) {
    throw new Error(
      "USB drive letter is required."
    );
  }

  if (
    !Array.isArray(metadata)
  ) {

    throw new Error(
      "Metadata must be an array."
    );

  }

  const metadataDirectory =
    getMetadataDirectory(
      driveLetter
    );

  const metadataPath =
    getMetadataPath(
      driveLetter
    );

  // Ensure metadata directory exists
  await fs.mkdir(
    metadataDirectory,
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      metadata,
      null,
      2
    ),
    "utf8"
  );

}

// ======================================================
// Add File
// ======================================================

export async function addFile(
  driveLetter,
  file
) {

  if (!file) {
    throw new Error(
      "File metadata is required."
    );
  }

  if (!file.id) {
    throw new Error(
      "File metadata ID is required."
    );
  }

  const metadata =
    await readMetadata(
      driveLetter
    );

  // Prevent duplicate metadata IDs
  const existing =
    metadata.find(
      item => item.id === file.id
    );

  if (existing) {

    throw new Error(
      "A file with this ID already exists."
    );

  }

  metadata.push(file);

  await writeMetadata(
    driveLetter,
    metadata
  );

  return file;

}

// ======================================================
// Delete File
// ======================================================

export async function deleteFile(
  driveLetter,
  id
) {

  if (!id) {
    throw new Error(
      "File ID is required."
    );
  }

  const metadata =
    await readMetadata(
      driveLetter
    );

  const fileExists =
    metadata.some(
      file => file.id === id
    );

  if (!fileExists) {

    throw new Error(
      "File not found."
    );

  }

  const updated =
    metadata.filter(
      file => file.id !== id
    );

  await writeMetadata(
    driveLetter,
    updated
  );

  return true;

}

// ======================================================
// Rename File
// ======================================================

export async function renameFile(
  driveLetter,
  id,
  newName
) {

  if (!id) {
    throw new Error(
      "File ID is required."
    );
  }

  if (!newName) {
    throw new Error(
      "New file name is required."
    );
  }

  const cleanName =
    path.basename(
      newName
    );

  if (
    cleanName !== newName
  ) {

    throw new Error(
      "Invalid file name."
    );

  }

  const metadata =
    await readMetadata(
      driveLetter
    );

  const file =
    metadata.find(
      item => item.id === id
    );

  if (!file) {

    throw new Error(
      "File not found."
    );

  }

  file.original_name =
    cleanName;

  await writeMetadata(
    driveLetter,
    metadata
  );

  return file;

}

// ======================================================
// Find File
// ======================================================

export async function findFile(
  driveLetter,
  id
) {

  if (!id) {
    throw new Error(
      "File ID is required."
    );
  }

  const metadata =
    await readMetadata(
      driveLetter
    );

  return metadata.find(
    file => file.id === id
  ) || null;

}