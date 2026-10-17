import React, { useState } from "react";
import { Lock, Unlock, Eye, EyeOff, X } from "lucide-react";
import { calculatePasswordStrength } from "../../utils/passwordStrength";

const PasswordDialog = ({
  open,
  mode = "encrypt",
  file = null,
  vaultImportMode = false,
  onCancel,
  onConfirm,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberVaultKey, setRememberVaultKey] = useState(false);

  const strength = calculatePasswordStrength(password);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!open) return null;

  const getFileSize = (bytes) => {
    if (!bytes) return "Unknown";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return (
      (bytes / Math.pow(1024, i)).toFixed(2) +
      " " +
      sizes[i]
    );
  };

  const getFileType = () => {
    if (!file?.name) return "Unknown";

    const extension = file.name.split(".").pop()?.toUpperCase();

    return extension || "Unknown";
  };

  const handleSubmit = () => {
  if (mode === "encrypt") {
    if (!password.trim()) {
      alert("Please enter a Vault Key.");
      return;
    }

    if (password.length < 8) {
      alert("Vault Key must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Vault Keys do not match.");
      return;
    }

    onConfirm(password, rememberVaultKey);
  } else {
    if (!password.trim()) {
      alert("Please enter your Vault Key.");
      return;
    }

    onConfirm(password);
  }

  setPassword("");
  setConfirmPassword("");
  setRememberVaultKey(false);
};

return (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-[420px] rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {mode === "encrypt" ? (
            <Lock className="text-cyan-400" size={24} />
          ) : (
            <Unlock className="text-green-400" size={24} />
          )}

          <h2 className="text-xl font-bold">
            {vaultImportMode
              ? "Secure File to PenX Vault"
              : mode === "encrypt"
                ? "Create Vault Key"
                : "Unlock PenX File"}
          </h2>
        </div>

        <button onClick={onCancel}>
          <X />
        </button>
      </div>

      {/* File Information */}
      <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">

        <h3 className="mb-3 text-sm font-semibold text-cyan-400">
          File Information
        </h3>

        <div className="space-y-2 text-sm">

          <div className="flex justify-between">
            <span className="text-slate-400">Name</span>
            <span className="font-medium">
              {file?.name || "Unknown"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Size</span>
            <span className="font-medium">
              {getFileSize(file?.size)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Type</span>
            <span className="font-medium">
              {getFileType()}
            </span>
          </div>

        </div>

      </div>

        {/* Vault Key */}
<label className="mb-2 block text-sm text-slate-300">
  Vault Key
</label>

<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 pr-12 outline-none focus:border-cyan-500"
    placeholder="Enter your Vault Key"
  />

  <button
    type="button"
    className="absolute right-3 top-3 text-slate-400 hover:text-white"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

{/* Password Strength */}
{mode === "encrypt" && (
  <>
    <div className="mt-4">

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-300">
          Password Strength
        </span>

        <span
          className="text-sm font-semibold"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${strength.score}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>

      <div className="mt-1 text-right text-xs text-slate-400">
        {strength.score}%
      </div>
    </div>

    {/* Password Checklist */}
    <div className="mt-4 space-y-2 text-sm">

      <div className="flex items-center gap-2">
        <span>{hasMinLength ? "✅" : "❌"}</span>
        <span>Minimum 8 Characters</span>
      </div>

      <div className="flex items-center gap-2">
        <span>{hasUppercase ? "✅" : "❌"}</span>
        <span>Uppercase Letter</span>
      </div>

      <div className="flex items-center gap-2">
        <span>{hasLowercase ? "✅" : "❌"}</span>
        <span>Lowercase Letter</span>
      </div>

      <div className="flex items-center gap-2">
        <span>{hasNumber ? "✅" : "❌"}</span>
        <span>Number</span>
      </div>

      <div className="flex items-center gap-2">
        <span>{hasSpecial ? "✅" : "❌"}</span>
        <span>Special Character</span>
      </div>

    </div>

        {/* Confirm Vault Key */}
    <label className="mb-2 mt-5 block text-sm text-slate-300">
      Confirm Vault Key
    </label>

    <input
      type={showPassword ? "text" : "password"}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-500"
      placeholder="Re-enter your Vault Key"
    />

    {/* Live Match Status */}
    {confirmPassword && (
      <p
        className={`mt-2 text-sm ${
          password === confirmPassword
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        {password === confirmPassword
          ? "✅ Vault Keys Match"
          : "❌ Vault Keys Do Not Match"}
      </p>
    )}

    {/* Remember Vault Key */}
    <div className="mt-4 flex items-center gap-2">
      <input
        type="checkbox"
        id="rememberVault"
        checked={rememberVaultKey}
        onChange={(e) =>
          setRememberVaultKey(e.target.checked)
        }
      />

      <label
        htmlFor="rememberVault"
        className="text-sm text-slate-300"
      >
        Use this Vault Key for all files
      </label>
    </div>

  </>
)}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-3">

        <button
          onClick={onCancel}
          className="rounded-lg bg-slate-700 px-5 py-2 transition hover:bg-slate-600"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-black transition hover:bg-cyan-400"
        >
          {vaultImportMode
            ? "Secure to Vault"
            : mode === "encrypt"
              ? "Encrypt"
              : "Unlock"}
        </button>

      </div>

    </div>
  </div>
);

};

export default PasswordDialog;
  