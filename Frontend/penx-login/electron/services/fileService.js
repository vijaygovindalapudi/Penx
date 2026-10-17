import fs from "fs/promises";
import path from "path";

/**
 * Copy a file to destination
 */
export async function copyFile(sourcePath, destinationFolder) {
  try {
    const parsed = path.parse(destinationFolder);

    // Create folder only if destination is not drive root
    if (
      destinationFolder.replace(/[\\/]+$/, "") !==
      parsed.root.replace(/[\\/]+$/, "")
    ) {
      await fs.mkdir(destinationFolder, {
        recursive: true,
      });
    }

    const fileName = path.basename(sourcePath);

    const destinationPath = path.join(
      destinationFolder,
      fileName
    );

    // Prevent copying to same location
    if (
      path.resolve(sourcePath) ===
      path.resolve(destinationPath)
    ) {
      return {
        success: false,
        message: "Source and destination are the same.",
      };
    }

    await fs.copyFile(sourcePath, destinationPath);

    return {
      success: true,
      message: "File copied successfully.",
      destinationPath,
    };

  } catch (err) {

    console.error("COPY ERROR:", err);

    if (err.code === "EBUSY") {
      return {
        success: false,
        message:
          "The file is currently open or being used by another application.",
      };
    }

    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Delete file or folder
 */
export async function deleteItem(filePath) {
  try {

    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await fs.rm(filePath, {
        recursive: true,
        force: true,
      });
    } else {
      await fs.unlink(filePath);
    }

    return {
      success: true,
      message: "Deleted successfully.",
    };

  } catch (err) {

    console.error("DELETE ERROR:", err);

    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Rename file or folder
 */
export async function renameItem(oldPath, newName) {
  try {

    const directory = path.dirname(oldPath);

    const newPath = path.join(
      directory,
      newName
    );

    await fs.rename(oldPath, newPath);

    return {
      success: true,
      message: "Renamed successfully.",
      newPath,
    };

  } catch (err) {

    console.error("RENAME ERROR:", err);

    if (err.code === "EBUSY") {
      return {
        success: false,
        message:
          "The file is currently open or being used by another application.",
      };
    }

    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Create folder
 */
export async function createFolder(
  driveLetter,
  currentFolder,
  folderName
) {
  try {

    const folderPath = path.join(
      driveLetter,
      currentFolder || "",
      folderName
    );

    await fs.mkdir(folderPath);

    return {
      success: true,
      message: "Folder created successfully.",
    };

  } catch (err) {

    console.error("CREATE FOLDER ERROR:", err);

    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Move file/folder
 * (Cut + Paste)
 */
export async function moveItem(
  sourcePath,
  destinationFolder
) {
  try {

    const parsed = path.parse(destinationFolder);

    // Create destination folder only if it is not drive root
    if (
      destinationFolder.replace(/[\\/]+$/, "") !==
      parsed.root.replace(/[\\/]+$/, "")
    ) {
      await fs.mkdir(destinationFolder, {
        recursive: true,
      });
    }

    const fileName = path.basename(sourcePath);

    const destinationPath = path.join(
      destinationFolder,
      fileName
    );

    // Prevent moving to same location
    if (
      path.resolve(sourcePath) ===
      path.resolve(destinationPath)
    ) {
      return {
        success: false,
        message: "Source and destination are the same.",
      };
    }

    await fs.rename(
      sourcePath,
      destinationPath
    );

    return {
      success: true,
      message: "Moved successfully.",
      destinationPath,
    };

  } catch (err) {

    console.error("MOVE ERROR:", err);

    if (err.code === "EBUSY") {
      return {
        success: false,
        message:
          "The file is currently open or being used by another application.",
      };
    }

    return {
      success: false,
      message: err.message,
    };
  }
}