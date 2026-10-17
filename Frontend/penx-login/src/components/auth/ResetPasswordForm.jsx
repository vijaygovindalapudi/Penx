import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import api from "../../services/api";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordForm({
  email,
  resetToken,
  onSuccess,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Email address is missing.");
      return;
    }

    if (!resetToken) {
      setError(
        "Password reset session is invalid or expired. Please request a new OTP."
      );
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        password,
        reset_token: resetToken,
      });

      onSuccess();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="w-full max-w-[380px]"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-[24px] font-semibold text-ink">
          Reset Password
        </h2>

        <p className="mt-2 text-[14px] text-ink-muted">
          Create a new password for your PenX account.
        </p>
      </div>

      {/* New Password */}
      <Input
        label="New Password"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter new password"
        autoComplete="new-password"
        trailing={
          <button
            type="button"
            onClick={() =>
              setShowPassword((value) => !value)
            }
            className="flex items-center justify-center text-ink-faint transition-colors hover:text-cyan"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff
                size={17}
                strokeWidth={1.75}
              />
            ) : (
              <Eye
                size={17}
                strokeWidth={1.75}
              />
            )}
          </button>
        }
      />

      {/* Confirm Password */}
      <Input
        label="Confirm Password"
        type={
          showConfirmPassword
            ? "text"
            : "password"
        }
        icon={Lock}
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
        placeholder="Confirm new password"
        autoComplete="new-password"
        trailing={
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (value) => !value
              )
            }
            className="flex items-center justify-center text-ink-faint transition-colors hover:text-cyan"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff
                size={17}
                strokeWidth={1.75}
              />
            ) : (
              <Eye
                size={17}
                strokeWidth={1.75}
              />
            )}
          </button>
        }
      />

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <div className="mt-6">
        <Button
          type="submit"
          loading={loading}
        >
          Reset Password
        </Button>
      </div>

      {/* Back to Login */}
      <p className="mt-8 text-center text-sm text-ink-muted">
        <Link
          to="/login"
          className="font-medium text-cyan hover:text-cyan/80"
        >
          Back to Login
        </Link>
      </p>
    </motion.form>
  );
}