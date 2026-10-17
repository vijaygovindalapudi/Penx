import { useState } from "react";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { Mail, ShieldCheck } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import api from "../../services/api";


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export default function ForgotPasswordForm({
  onSuccess,
}) {

  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    // ---------------------------------------------
    // Validate email
    // ---------------------------------------------

    if (!EMAIL_PATTERN.test(normalizedEmail)) {

      setError(
        "Please enter a valid email address."
      );

      return;
    }

    try {

      setLoading(true);

      // -------------------------------------------
      // Request password reset OTP
      // -------------------------------------------

      await api.post(
        "/auth/forgot-password",
        {
          email: normalizedEmail,
        }
      );

      // -------------------------------------------
      // Move to OTP verification page
      // -------------------------------------------

      onSuccess(normalizedEmail);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Unable to send reset OTP. Please try again."
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

      transition={{
        duration: 0.4,
      }}

      className="w-full max-w-[380px]"
    >

      {/* ----------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------- */}

      <div className="mb-8">

        <div
          className="
            mb-5
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-cyan/20
            bg-cyan/5
          "
        >

          <ShieldCheck
            size={21}
            className="text-cyan"
          />

        </div>

        <h2
          className="
            font-display
            text-[24px]
            font-semibold
            text-ink
          "
        >
          Forgot Password
        </h2>

        <p
          className="
            mt-2
            text-[14px]
            leading-6
            text-ink-muted
          "
        >
          Enter your registered email address
          to receive a password reset
          verification code.
        </p>

      </div>


      {/* ----------------------------------------- */}
      {/* Email */}
      {/* ----------------------------------------- */}

      <Input

        label="Email Address"

        icon={Mail}

        type="email"

        value={email}

        onChange={(e) =>
          setEmail(e.target.value)
        }

        placeholder="name@example.com"

        autoComplete="email"
      />


      {/* ----------------------------------------- */}
      {/* Error */}
      {/* ----------------------------------------- */}

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

          className="
            mt-4
            rounded-lg
            border
            border-red-500/20
            bg-red-500/10
            p-3
            text-sm
            text-red-300
          "
        >

          {error}

        </motion.p>

      )}


      {/* ----------------------------------------- */}
      {/* Submit */}
      {/* ----------------------------------------- */}

      <div className="mt-6">

        <Button

          type="submit"

          loading={loading}

          disabled={loading}
        >

          {loading
            ? "Sending OTP..."
            : "Send Reset OTP"}

        </Button>

      </div>


      {/* ----------------------------------------- */}
      {/* Back to Login */}
      {/* ----------------------------------------- */}

      <p
        className="
          mt-8
          text-center
          text-sm
          text-ink-muted
        "
      >

        Remember your password?{" "}

        <Link
          to="/login"
          className="
            font-medium
            text-cyan
            transition
            hover:text-cyan/80
          "
        >
          Back to Login
        </Link>

      </p>

    </motion.form>

  );
}