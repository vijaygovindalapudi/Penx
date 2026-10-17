import { useState } from "react";
import {
  RotateCcw,
  FileLock2,
  FolderOpen,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import MobileDrawer from "../components/dashboard/MobileDrawer";

export default function RestorePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [destinationFolder, setDestinationFolder] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // Select encrypted .penx file
  // =====================================================

  const handleSelectFile = async () => {
    try {
      setError("");
      setSuccess("");

      if (!window.electron?.pickFile) {
        throw new Error("Electron file picker is not available.");
      }

      const file = await window.electron.pickFile();

      if (!file) {
        return;
      }

      setSelectedFile(file);
    } catch (err) {
      console.error("Restore File Selection Error:", err);

      setError(
        err?.message ||
          "Unable to select the encrypted file."
      );
    }
  };

  // =====================================================
  // Select destination folder
  // =====================================================

  const handleSelectDestination = async () => {
    try {
      setError("");
      setSuccess("");

      if (!window.electron?.pickFolder) {
        throw new Error("Electron folder picker is not available.");
      }

      const folder =
        await window.electron.pickFolder();

      if (!folder) {
        return;
      }

      setDestinationFolder(folder);
    } catch (err) {
      console.error(
        "Restore Destination Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to select destination folder."
      );
    }
  };

  // =====================================================
  // Restore file
  // =====================================================

  const handleRestore = async () => {
    try {
      setError("");
      setSuccess("");

      if (!selectedFile) {
        setError(
          "Please select an encrypted PenX file."
        );
        return;
      }

      if (!destinationFolder) {
        setError(
          "Please select a destination folder."
        );
        return;
      }

      if (!password.trim()) {
        setError(
          "Please enter your vault password."
        );
        return;
      }

      if (!window.electron?.decryptFile) {
        throw new Error(
          "Electron decryption service is not available."
        );
      }

      setLoading(true);

      const filePath =
        selectedFile.fullPath ||
        selectedFile.path;

      if (!filePath) {
        throw new Error(
          "Unable to determine the selected file path."
        );
      }

      console.log(
        "🔓 Restore source:",
        filePath
      );

      console.log(
        "📁 Restore destination:",
        destinationFolder
      );

      const result =
        await window.electron.decryptFile(
          filePath,
          password,
          destinationFolder
        );

      if (!result?.success) {
        throw new Error(
          result?.error ||
            "File restoration failed."
        );
      }

      const outputPath =
        result.outputPath ||
        result.data?.outputPath;

      const fileName =
        result.fileName ||
        result.data?.fileName ||
        "File";

      setSuccess(
        `${fileName} restored successfully.`
      );

      console.log(
        "✅ Restore successful:",
        outputPath
      );

      // Clear password after successful restore
      setPassword("");

    } catch (err) {
      console.error(
        "Restore Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to restore the file."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-void text-ink">

      {/* =================================================
          Sidebar
      ================================================= */}

      <Sidebar />

      {/* =================================================
          Mobile Drawer
      ================================================= */}

      <MobileDrawer
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      />

      {/* =================================================
          Main Content
      ================================================= */}

      <div className="relative flex-1">

        <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

        <main className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

          {/* =================================================
              Header
          ================================================= */}

          <div className="mb-8 flex items-start justify-between gap-4">

            <div>

              <p className="text-sm font-medium text-cyan">
                FILE RECOVERY
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                Restore
              </h1>

              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                Restore an encrypted PenX file to a folder
                of your choice.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setDrawerOpen(true)
              }
              className="rounded-xl border border-line bg-surface/70 px-3 py-2.5 text-sm text-ink-muted transition hover:border-cyan/30 hover:text-cyan lg:hidden"
            >
              Menu
            </button>

          </div>

          {/* =================================================
              Security Banner
          ================================================= */}

          <div className="mb-6 rounded-2xl border border-cyan/20 bg-cyan/5 p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/10 text-cyan">
                <ShieldCheck size={20} />
              </div>

              <div>

                <p className="text-sm font-medium text-ink">
                  Secure restoration
                </p>

                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  Your encrypted PenX file remains unchanged.
                  The restored file is written only to the
                  destination folder you select.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              Restore Card
          ================================================= */}

          <section className="rounded-2xl border border-line bg-surface/60 p-5 sm:p-7">

            {/* =================================================
                Step 1 — File
            ================================================= */}

            <div>

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan/10 text-sm font-semibold text-cyan">
                  1
                </div>

                <div>
                  <h2 className="text-base font-semibold text-ink">
                    Select encrypted file
                  </h2>

                  <p className="text-xs text-ink-muted">
                    Choose a PenX encrypted file.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleSelectFile}
                className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-line bg-void/40 p-5 text-left transition hover:border-cyan/40 hover:bg-cyan/5"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/5 text-cyan">
                  <FileLock2 size={21} />
                </div>

                <div className="min-w-0 flex-1">

                  {selectedFile ? (
                    <>
                      <p className="truncate text-sm font-medium text-ink">
                        {selectedFile.name ||
                          selectedFile.fileName ||
                          "Encrypted file"}
                      </p>

                      <p className="mt-1 truncate text-xs text-ink-muted">
                        {selectedFile.fullPath ||
                          selectedFile.path ||
                          ""}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-ink">
                        Choose encrypted file
                      </p>

                      <p className="mt-1 text-xs text-ink-muted">
                        Select a .penx file from your computer or PenX device.
                      </p>
                    </>
                  )}

                </div>

                <span className="shrink-0 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
                  Browse
                </span>

              </button>

            </div>

            {/* Divider */}

            <div className="my-7 h-px bg-line" />

            {/* =================================================
                Step 2 — Destination
            ================================================= */}

            <div>

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan/10 text-sm font-semibold text-cyan">
                  2
                </div>

                <div>
                  <h2 className="text-base font-semibold text-ink">
                    Choose destination
                  </h2>

                  <p className="text-xs text-ink-muted">
                    Select where the restored file should be saved.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleSelectDestination
                }
                className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-line bg-void/40 p-5 text-left transition hover:border-cyan/40 hover:bg-cyan/5"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/5 text-cyan">
                  <FolderOpen size={21} />
                </div>

                <div className="min-w-0 flex-1">

                  {destinationFolder ? (
                    <>
                      <p className="text-sm font-medium text-ink">
                        Destination selected
                      </p>

                      <p className="mt-1 truncate text-xs text-ink-muted">
                        {destinationFolder}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-ink">
                        Choose destination folder
                      </p>

                      <p className="mt-1 text-xs text-ink-muted">
                        The restored file will be created here.
                      </p>
                    </>
                  )}

                </div>

                <span className="shrink-0 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
                  Browse
                </span>

              </button>

            </div>

            {/* Divider */}

            <div className="my-7 h-px bg-line" />

            {/* =================================================
                Step 3 — Password
            ================================================= */}

            <div>

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan/10 text-sm font-semibold text-cyan">
                  3
                </div>

                <div>
                  <h2 className="text-base font-semibold text-ink">
                    Enter vault password
                  </h2>

                  <p className="text-xs text-ink-muted">
                    Your password is required to decrypt the file.
                  </p>
                </div>

              </div>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter vault password"
                className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
              />

            </div>

            {/* =================================================
                Error
            ================================================= */}

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-300"
                />

                <p className="text-sm text-red-200">
                  {error}
                </p>

              </div>
            )}

            {/* =================================================
                Success
            ================================================= */}

            {success && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-cyan/20 bg-cyan/5 p-4">

                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-cyan"
                />

                <div>

                  <p className="text-sm font-medium text-ink">
                    Restore complete
                  </p>

                  <p className="mt-1 text-sm text-ink-muted">
                    {success}
                  </p>

                </div>

              </div>
            )}

            {/* =================================================
                Restore Button
            ================================================= */}

            <button
              type="button"
              onClick={handleRestore}
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RotateCcw
                size={18}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              {loading
                ? "Restoring..."
                : "Restore File"}

            </button>

          </section>

          {/* =================================================
              Information
          ================================================= */}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-line bg-surface/40 p-5">

              <p className="text-sm font-medium text-ink">
                Encrypted copy
              </p>

              <p className="mt-2 text-sm leading-6 text-ink-muted">
                The original .penx encrypted file is not deleted
                or modified during restoration.
              </p>

            </div>

            <div className="rounded-2xl border border-line bg-surface/40 p-5">

              <p className="text-sm font-medium text-ink">
                Destination control
              </p>

              <p className="mt-2 text-sm leading-6 text-ink-muted">
                You choose exactly where the decrypted file should
                be restored.
              </p>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}