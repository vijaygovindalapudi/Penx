import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";
import GoogleButton from "./GoogleButton";

export default function LoginForm({
  onSubmit,
  onGoogleLogin,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setGoogleError("");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit?.({
        email,
        password,
        remember,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Could not verify those credentials. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleError("");
    setError("");
    setGoogleLoading(true);

    try {
      await onGoogleLogin?.();
    } catch (err) {
      setGoogleError(
        err?.message ||
          "Google sign-in could not be completed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
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
      transition={{
        duration: 0.45,
        delay: 0.15,
      }}
      className="w-full max-w-[380px]"
      noValidate
    >
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">
          Welcome back
        </h2>

        <p className="mt-2 text-[14px] text-ink-muted">
          Sign in to access your encrypted vault.
        </p>
      </div>

      {/* GOOGLE LOGIN */}
      <GoogleButton
        onClick={handleGoogleLogin}
        loading={googleLoading}
      />

      {/* DIVIDER */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />

        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Or continue with
        </span>

        <div className="h-px flex-1 bg-line" />
      </div>

      {/* EMAIL + PASSWORD */}
      <div className="space-y-5">
        {/* EMAIL */}
        <Input
          label="Email"
          type="email"
          name="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          autoComplete="email"
          required
        />

        {/* PASSWORD */}
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
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

        {/* NORMAL LOGIN ERROR */}
        {error && (
          <motion.p
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3.5 py-2.5 text-[13px] text-red-300"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {/* GOOGLE ERROR */}
        {googleError && (
          <motion.p
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3.5 py-2.5 text-[13px] text-red-300"
            role="alert"
          >
            {googleError}
          </motion.p>
        )}

        {/* REMEMBER + FORGOT */}
        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="remember-me"
            checked={remember}
            onChange={() =>
              setRemember((value) => !value)
            }
            label="Keep me signed in"
          />

          <a
            href="/forgot-password"
            className="text-[13px] font-medium text-cyan/90 transition-colors hover:text-cyan"
          >
            Forgot password?
          </a>
        </div>

        {/* PASSWORD LOGIN */}
        <Button
          type="submit"
          loading={loading}
        >
          Unlock vault
        </Button>
      </div>

      {/* REGISTER */}
      <p className="mt-7 text-center text-[13.5px] text-ink-muted">
        Don&rsquo;t have a vault yet?{" "}

        <a
          href="/register"
          className="font-medium text-cyan/90 transition-colors hover:text-cyan"
        >
          Create one
        </a>
      </p>
    </motion.form>
  );
}