import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Mail,
} from "lucide-react";

import Button from "../ui/Button";
import api from "../../services/api";

export default function VerifyResetOTPForm({
  email,
  onSuccess,
}) {
  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  // =====================================================
  // Countdown
  // =====================================================

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // =====================================================
  // Mask Email
  // =====================================================

  const maskEmail = (value) => {
    if (!value) {
      return "your email";
    }

    const [username, domain] = value.split("@");

    if (!username || !domain) {
      return value;
    }

    if (username.length <= 2) {
      return `${username[0] || ""}••••@${domain}`;
    }

    return `${username.slice(0, 2)}••••@${domain}`;
  };

  // =====================================================
  // OTP Input
  // =====================================================

  const handleOtpChange = (index, value) => {
    const digit = value
      .replace(/\D/g, "")
      .slice(-1);

    if (!digit) {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    const updated = [...otp];
    updated[index] = digit;

    setOtp(updated);
    setError("");

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // =====================================================
  // Backspace / Arrow Keys
  // =====================================================

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (otp[index]) {
        const updated = [...otp];
        updated[index] = "";
        setOtp(updated);
        return;
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < 5
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // =====================================================
  // Paste OTP
  // =====================================================

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) {
      return;
    }

    const updated = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setOtp(updated);
    setError("");

    const focusIndex = Math.min(
      pasted.length,
      5
    );

    inputRefs.current[focusIndex]?.focus();
  };

  // =====================================================
  // Verify OTP
  // =====================================================

  const verifyOTP = async (event) => {
    event.preventDefault();

    setError("");

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError(
        "Enter the complete 6-digit verification code."
      );
      return;
    }

    if (!email) {
      setError(
        "Email address is missing. Please start again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/verify-reset-otp",
        {
          email,
          otp: enteredOtp,
        }
      );

      // Backend returns the password-reset token
      // in the access_token field.
      const resetToken =
        response.data?.access_token;

      if (!resetToken) {
        throw new Error(
          "Reset token was not received."
        );
      }

      // Pass the reset token to the page.
      onSuccess(resetToken);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Resend OTP
  // =====================================================

  const resendOTP = async () => {
    if (countdown > 0 || sending) {
      return;
    }

    setError("");

    if (!email) {
      setError(
        "Email address is missing. Please start again."
      );
      return;
    }

    try {
      setSending(true);

      await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      // OTP is sent to the user's email.
      // Never expose the OTP in the frontend.
      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setCountdown(60);

      inputRefs.current[0]?.focus();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to resend verification code."
      );
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <motion.form
      onSubmit={verifyOTP}
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="relative w-full max-w-[430px]"
    >
      {/* HEADER */}

      <div className="mb-8">
        <div className="mb-5 flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan/20
              bg-cyan/10
            "
          >
            <ShieldCheck
              size={21}
              className="text-cyan"
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan">
              PENX / AUTH-01
            </p>

            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Secure Channel
            </p>
          </div>
        </div>

        <h2 className="font-display text-[26px] font-semibold text-ink">
          Verify Your Identity
        </h2>

        <p className="mt-3 text-[14px] leading-6 text-ink-muted">
          A secure verification code was sent to
        </p>

        <div className="mt-1 flex items-center gap-2 text-[14px] font-medium text-cyan">
          <Mail size={15} />

          <span>
            {maskEmail(email)}
          </span>
        </div>
      </div>

      {/* OTP CARD */}

      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-line
          bg-surface/60
          p-6
          shadow-[0_0_40px_rgba(34,211,238,0.04)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-40
            w-40
            rounded-full
            bg-cyan/5
            blur-3xl
          "
        />

        <div className="relative">
          <div className="mb-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Enter Access Code
            </p>

            <p className="mt-2 text-[13px] text-ink-muted">
              Enter the 6-digit code to continue.
            </p>
          </div>

          {/* OTP BOXES */}

          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] =
                    element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={
                  index === 0
                    ? "one-time-code"
                    : "off"
                }
                maxLength={1}
                value={digit}
                onChange={(event) =>
                  handleOtpChange(
                    index,
                    event.target.value
                  )
                }
                onKeyDown={(event) =>
                  handleOtpKeyDown(
                    index,
                    event
                  )
                }
                onPaste={handleOtpPaste}
                className="
                  h-14
                  w-11
                  rounded-xl
                  border
                  border-line
                  bg-void
                  text-center
                  text-xl
                  font-semibold
                  text-ink
                  outline-none
                  transition
                  focus:border-cyan/60
                  focus:bg-cyan/5
                  focus:shadow-[0_0_18px_rgba(34,211,238,0.10)]
                  sm:h-16
                  sm:w-12
                "
              />
            ))}
          </div>

          {/* TIMER */}

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-cyan
                  shadow-[0_0_8px_rgba(34,211,238,0.8)]
                "
              />

              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                Code validity
              </span>
            </div>

            <span
              className={`text-[12px] font-medium ${
                countdown <= 10
                  ? "text-red-300"
                  : "text-cyan"
              }`}
            >
              {countdown > 0
                ? `00:${String(
                    countdown
                  ).padStart(2, "0")}`
                : "Expired"}
            </span>
          </div>

          {/* ERROR */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                className="
                  mt-5
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  p-3
                  text-sm
                  text-red-300
                "
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* VERIFY */}

          <div className="mt-6">
            <Button
              type="submit"
              loading={loading}
              disabled={
                otp.join("").length !== 6
              }
            >
              <span className="flex items-center justify-center gap-2">
                Verify Identity

                {!loading && (
                  <ArrowRight size={16} />
                )}
              </span>
            </Button>
          </div>

          {/* RESEND */}

          <div className="mt-4">
            <button
              type="button"
              onClick={resendOTP}
              disabled={
                countdown > 0 || sending
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-line
                bg-void/50
                px-4
                py-3
                text-sm
                text-ink-muted
                transition
                hover:border-cyan/30
                hover:text-cyan
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <RefreshCw
                size={15}
                className={
                  sending
                    ? "animate-spin"
                    : ""
                }
              />

              {sending
                ? "Sending new code..."
                : countdown > 0
                ? `Request new code in ${countdown}s`
                : "Request new code"}
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE EMAIL */}

      <p className="mt-7 text-center text-sm text-ink-muted">
        Wrong email?

        <Link
          to="/forgot-password"
          className="ml-1 font-medium text-cyan transition hover:text-cyan/80"
        >
          Change Email Address
        </Link>
      </p>

      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        IDENTITY CHANNEL • ENCRYPTED • PENX
      </p>
    </motion.form>
  );
}