import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Cloud,
  Database,
  BadgeCheck,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export default function VaultSection() {
  const [passwordModalOpen, setPasswordModalOpen] =
    useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [vaultPasswordConfigured, setVaultPasswordConfigured] =
    useState(false);

  const vault = {
    id: "PX-VLT-8A91-72KC",
    encryption: "AES-256 Enabled",
    recovery: "Generated",
    cloud: "Connected",
    version: "PenX Vault v1.0",
    status: "Protected",
  };

  // =====================================================
  // Open Vault Password Modal
  // =====================================================

  const handleOpenPasswordSetup = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setPasswordModalOpen(true);
  };

  // =====================================================
  // Close Vault Password Modal
  // =====================================================

  const handleClosePasswordSetup = () => {
    setPasswordModalOpen(false);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // =====================================================
  // Create Vault Password
  // =====================================================

  const handleCreateVaultPassword = async () => {
  setError("");

  if (!password.trim()) {
    setError("Please enter a vault password.");
    return;
  }

  if (password.length < 8) {
    setError(
      "Vault password must contain at least 8 characters."
    );
    return;
  }

  if (!confirmPassword.trim()) {
    setError("Please confirm your vault password.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    // Get connected PenX USB
    const devices =
      await window.electron.getUSBDevices();

    if (!devices || devices.length === 0) {
      setError("No USB device is connected.");
      return;
    }

    // Use the first detected USB for now
    const selectedUSB = devices[0];

    if (!selectedUSB?.DriveLetter) {
      setError(
        "Unable to determine the USB drive."
      );
      return;
    }

    // Create secure vault password verifier
    const result =
      await window.electron.createVaultPassword(
        selectedUSB.DriveLetter,
        password
      );

    if (!result?.success) {
      setError(
        result?.error ||
          "Failed to create vault password."
      );
      return;
    }

    console.log(
      "🔐 Vault password configured successfully."
    );

    setVaultPasswordConfigured(true);

    handleClosePasswordSetup();

  } catch (error) {
    console.error(
      "Create Vault Password Error:",
      error
    );

    setError(
      error?.message ||
        "Unable to configure vault password."
    );
  }
};

  return (
    <>
      {/* =====================================================
          VAULT INFORMATION
      ====================================================== */}

      <section
        className="
          rounded-3xl
          border
          border-cyan-500/10
          bg-[#0B1324]
          p-6
          shadow-[0_0_30px_rgba(34,211,238,.05)]
        "
      >
        {/* Header */}

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3">
            <ShieldCheck
              size={22}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Vault Information
            </h2>

            <p className="text-sm text-slate-400">
              Your encrypted PenX vault details
            </p>
          </div>
        </div>

        {/* Vault ID */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Vault ID
          </p>

          <p className="mt-2 text-lg font-semibold text-cyan-300">
            {vault.id}
          </p>
        </div>

        {/* Information */}

        <div className="mt-6 space-y-4">

          {/* Encryption */}

          <div className="flex items-center justify-between rounded-xl bg-slate-900/30 p-4">
            <div className="flex items-center gap-3">
              <Lock
                size={18}
                className="text-cyan-400"
              />

              <span className="text-slate-300">
                Encryption
              </span>
            </div>

            <span className="font-medium text-white">
              {vault.encryption}
            </span>
          </div>

          {/* Recovery */}

          <div className="flex items-center justify-between rounded-xl bg-slate-900/30 p-4">
            <div className="flex items-center gap-3">
              <KeyRound
                size={18}
                className="text-cyan-400"
              />

              <span className="text-slate-300">
                Recovery Key
              </span>
            </div>

            <span className="font-medium text-cyan-400">
              {vault.recovery}
            </span>
          </div>

          {/* Cloud */}

          <div className="flex items-center justify-between rounded-xl bg-slate-900/30 p-4">
            <div className="flex items-center gap-3">
              <Cloud
                size={18}
                className="text-cyan-400"
              />

              <span className="text-slate-300">
                Cloud Sync
              </span>
            </div>

            <span className="font-medium text-cyan-400">
              {vault.cloud}
            </span>
          </div>

          {/* Version */}

          <div className="flex items-center justify-between rounded-xl bg-slate-900/30 p-4">
            <div className="flex items-center gap-3">
              <Database
                size={18}
                className="text-cyan-400"
              />

              <span className="text-slate-300">
                Vault Version
              </span>
            </div>

            <span className="text-white">
              {vault.version}
            </span>
          </div>

        </div>

        {/* =====================================================
            VAULT PASSWORD
        ====================================================== */}

        <div className="mt-6 rounded-2xl border border-cyan-500/10 bg-slate-900/30 p-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-cyan-500/10 p-3">
                <KeyRound
                  size={20}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Vault Password
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Used only to lock and unlock your PenX vault.
                </p>
              </div>

            </div>

            <span
              className={
                vaultPasswordConfigured
                  ? "rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                  : "rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-400"
              }
            >
              {vaultPasswordConfigured
                ? "Configured"
                : "Not Configured"}
            </span>

          </div>

          <button
            type="button"
            onClick={handleOpenPasswordSetup}
            className="
              mt-5
              w-full
              rounded-xl
              border
              border-cyan-500/20
              bg-cyan-500/10
              px-4
              py-3
              text-sm
              font-semibold
              text-cyan-300
              transition
              hover:border-cyan-400/40
              hover:bg-cyan-500/15
            "
          >
            {vaultPasswordConfigured
              ? "Change Vault Password"
              : "Set Vault Password"}
          </button>

        </div>

        {/* =====================================================
            STATUS
        ====================================================== */}

        <div className="mt-8 rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-5">

          <div className="flex items-center gap-3">

            <BadgeCheck
              size={22}
              className="text-cyan-400"
            />

            <div>

              <h3 className="font-semibold text-white">
                Vault Status
              </h3>

              <p className="text-sm text-cyan-400">
                {vault.status}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          VAULT PASSWORD MODAL
      ====================================================== */}

      {passwordModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/70
            p-6
            backdrop-blur-sm
          "
        >

          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-cyan-500/20
              bg-[#0B1324]
              p-6
              shadow-[0_0_40px_rgba(34,211,238,.08)]
            "
          >

            {/* Modal Header */}

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <KeyRound
                    size={22}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Create Vault Password
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Protect your PenX vault.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleClosePasswordSetup}
                className="
                  rounded-lg
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* Password */}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Vault Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter vault password"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-950
                    px-4
                    py-3
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-slate-600
                    focus:border-cyan-400
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                    hover:text-cyan-400
                  "
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Confirm Password */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Confirm Vault Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                  placeholder="Confirm vault password"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-950
                    px-4
                    py-3
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-slate-600
                    focus:border-cyan-400
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                    hover:text-cyan-400
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Password Requirement */}

            <p className="mt-3 text-xs text-slate-500">
              Use at least 8 characters. This password is
              separate from individual file encryption passwords.
            </p>

            {/* Error */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Buttons */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={handleClosePasswordSetup}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-slate-700
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-slate-300
                  transition
                  hover:bg-slate-800
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateVaultPassword}
                className="
                  flex-1
                  rounded-xl
                  bg-cyan-400
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-950
                  transition
                  hover:bg-cyan-300
                  active:scale-[0.98]
                "
              >
                Create Password
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}