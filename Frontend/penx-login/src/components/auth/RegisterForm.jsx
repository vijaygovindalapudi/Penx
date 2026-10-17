import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Divider from "../ui/Divider";
import GoogleButton from "../ui/GoogleButton";

import api from "../../services/api";

// ======================================================
// Constants
// ======================================================

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USERNAME_PATTERN =
  /^[a-zA-Z0-9._-]+$/;

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;

const MIN_PASSWORD_LENGTH = 8;


// ======================================================
// Register Form
// ======================================================

export default function RegisterForm({
  onSubmit,
}) {

  // ====================================================
  // Form Fields
  // ====================================================

  const [fields, setFields] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  // ====================================================
  // OTP
  // ====================================================

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(false);

  // IMPORTANT:
  // Token returned by /otp/verify
  const [verificationToken, setVerificationToken] =
    useState("");


  const [sendingOtp, setSendingOtp] =
    useState(false);

  const [verifyingOtp, setVerifyingOtp] =
    useState(false);

  const [countdown, setCountdown] =
    useState(0);


  // ====================================================
  // UI State
  // ====================================================

  const [touched, setTouched] =
    useState({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");


  // ====================================================
  // Update Field
  // ====================================================

  const updateField =
    (key) =>
    (e) => {

      let value = e.target.value;

      // Username should not contain spaces.
      if (key === "username") {

        value = value
          .replace(/\s/g, "")
          .slice(0, MAX_USERNAME_LENGTH);
      }

      setFields((prev) => ({
        ...prev,
        [key]: value,
      }));


      // ------------------------------------------------
      // Email changed after OTP verification
      // ------------------------------------------------
      // Previous verification token belongs to
      // the old email, so it must be discarded.
      // ------------------------------------------------

      if (
        key === "email" &&
        otpVerified
      ) {

        setOtpVerified(false);
        setVerificationToken("");
        setOtp("");
      }
    };


  // ====================================================
  // Mark Field Touched
  // ====================================================

  const markTouched =
    (key) =>
    () =>
      setTouched((prev) => ({
        ...prev,
        [key]: true,
      }));


  // ====================================================
  // Validation
  // ====================================================

  const errors = {

    fullName:
      !fields.fullName.trim()
        ? "Enter your full name."
        : "",


    username:
      !fields.username.trim()
        ? "Choose a username."
        : fields.username.length <
          MIN_USERNAME_LENGTH
        ? `Username must contain at least ${MIN_USERNAME_LENGTH} characters.`
        : !USERNAME_PATTERN.test(
            fields.username
          )
        ? "Use only letters, numbers, dots, underscores, or hyphens."
        : "",


    email:
      !fields.email.trim()
        ? "Enter your email address."
        : !EMAIL_PATTERN.test(
            fields.email
          )
        ? "Enter a valid email address."
        : "",


    password:
      !fields.password
        ? "Create a password."
        : fields.password.length <
          MIN_PASSWORD_LENGTH
        ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
        : "",


    confirmPassword:
      !fields.confirmPassword
        ? "Confirm your password."
        : fields.confirmPassword !==
          fields.password
        ? "Passwords must match."
        : "",
  };


  // ====================================================
  // Visible Error
  // ====================================================

  const visibleError = (key) =>
    touched[key]
      ? errors[key]
      : "";


  // ====================================================
  // Form Error Check
  // ====================================================

  const hasErrors =
    Object.values(errors).some(Boolean);


  // ====================================================
  // Send OTP
  // ====================================================

  const sendOtp = async () => {

    setFormError("");

    setTouched((prev) => ({
      ...prev,
      email: true,
    }));

    if (errors.email) {
      return;
    }


    try {

      setSendingOtp(true);


      // ------------------------------------------------
      // IMPORTANT:
      // New OTP means previous verification is invalid.
      // ------------------------------------------------

      setOtpVerified(false);
      setVerificationToken("");
      setOtp("");


      await api.post(
        "/otp/send",
        {
          email: fields.email,
          purpose: "REGISTER",
        }
      );


      setOtpSent(true);

      setCountdown(60);


      const timer =
        setInterval(() => {

          setCountdown((prev) => {

            if (prev <= 1) {

              clearInterval(timer);

              return 0;
            }

            return prev - 1;
          });

        }, 1000);


    } catch (err) {

      setFormError(
        err?.response?.data?.detail ||
        "Failed to send OTP. Please try again."
      );

    } finally {

      setSendingOtp(false);
    }
  };


  // ====================================================
  // Verify OTP
  // ====================================================

  const verifyOtp = async () => {

    setFormError("");


    if (
      !otp ||
      otp.length !== 6
    ) {

      setFormError(
        "Please enter the 6-digit OTP."
      );

      return;
    }


    try {

      setVerifyingOtp(true);


      const response =
        await api.post(
          "/otp/verify",
          {
            email: fields.email,
            otp,
            purpose: "REGISTER",
          }
        );


      // ------------------------------------------------
      // IMPORTANT:
      // Store backend verification proof.
      // ------------------------------------------------

      const token =
        response.data?.verification_token;


      if (!token) {

        throw new Error(
          "OTP verification token was not received."
        );
      }


      setVerificationToken(token);

      setOtpVerified(true);

      setFormError("");


      alert(
        "OTP verified successfully."
      );


    } catch (err) {

      setOtpVerified(false);
      setVerificationToken("");


      setFormError(
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid or expired OTP."
      );

    } finally {

      setVerifyingOtp(false);
    }
  };


  // ====================================================
  // Submit Registration
  // ====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setFormError("");


    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });


    if (hasErrors) {
      return;
    }


    // ------------------------------------------------
    // OTP must be sent
    // ------------------------------------------------

    if (!otpSent) {

      setFormError(
        "Please send an OTP first."
      );

      return;
    }


    // ------------------------------------------------
    // OTP must be verified
    // ------------------------------------------------

    if (!otpVerified) {

      setFormError(
        "Please verify your OTP first."
      );

      return;
    }


    // ------------------------------------------------
    // Verification token must exist
    // ------------------------------------------------

    if (!verificationToken) {

      setFormError(
        "OTP verification has expired. Please verify your email again."
      );

      setOtpVerified(false);

      return;
    }


    setLoading(true);


    try {

      await onSubmit?.({

        fullName:
          fields.fullName,

        username:
          fields.username,

        email:
          fields.email,

        password:
          fields.password,

        // IMPORTANT:
        // Do NOT send the OTP itself.
        verificationToken,
      });


    } catch (err) {

      setFormError(
        err?.message ||
        err?.response?.data?.detail ||
        "Could not create your PenX account. Try again."
      );

    } finally {

      setLoading(false);
    }
  };


  // ====================================================
  // Render
  // ====================================================

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

      {/* ==================================================
          Header
          ================================================== */}

      <div className="mb-8">

        <h2
          className="
            font-display
            text-[24px]
            font-semibold
            tracking-tight
            text-ink
          "
        >
          Create Your PenX Vault
        </h2>


        <p
          className="
            mt-2
            text-[14px]
            leading-relaxed
            text-ink-muted
          "
        >
          Create your secure PenX account
          to protect, backup, and recover
          your USB files securely.
        </p>

      </div>


      {/* ==================================================
          Fields
          ================================================== */}

      <div className="space-y-5">


        {/* ==================================================
            Full Name
            ================================================== */}

        <Input
          label="Full Name"
          type="text"
          name="fullName"
          icon={User}
          value={fields.fullName}
          onChange={updateField("fullName")}
          onBlur={markTouched("fullName")}
          placeholder="Jordan Blake"
          autoComplete="name"
          required
          error={visibleError("fullName")}
        />


        {/* ==================================================
            Username
            ================================================== */}

        <Input
          label="Username"
          type="text"
          name="username"
          icon={AtSign}
          value={fields.username}
          onChange={updateField("username")}
          onBlur={markTouched("username")}
          placeholder="vixcy"
          autoComplete="username"
          required
          error={visibleError("username")}
        />


        {/* ==================================================
            Username Hint
            ================================================== */}

        <p
          className="
            -mt-3
            px-1
            text-[11px]
            leading-relaxed
            text-ink-faint
          "
        >
          Your username will be part of
          your PenX identity.
        </p>


        {/* ==================================================
            Email
            ================================================== */}

        <Input
          label="Email Address"
          type="email"
          name="email"
          icon={Mail}
          value={fields.email}
          onChange={updateField("email")}
          onBlur={markTouched("email")}
          placeholder="name@company.com"
          autoComplete="email"
          required
          error={visibleError("email")}
        />


        {/* ==================================================
            Send OTP
            ================================================== */}

        <div className="flex justify-end">

          <Button
            type="button"
            onClick={sendOtp}
            loading={sendingOtp}
            disabled={
              countdown > 0 ||
              sendingOtp
            }
          >
            {countdown > 0
              ? `Resend OTP (${countdown}s)`
              : otpSent
              ? "Resend OTP"
              : "Send OTP"}
          </Button>

        </div>


        {/* ==================================================
            OTP
            ================================================== */}

        {otpSent && (
          <>

            <Input
              label="Verification Code"
              type="text"
              name="otp"
              icon={Mail}
              value={otp}
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              autoComplete="one-time-code"

              onChange={(e) => {

                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                // If user edits OTP after
                // successful verification,
                // invalidate previous proof.

                if (otpVerified) {

                  setOtpVerified(false);
                  setVerificationToken("");
                }

                setOtp(
                  value.slice(0, 6)
                );

              }}

              required
            />


            <div className="flex justify-end">

              <Button
                type="button"
                onClick={verifyOtp}

                loading={verifyingOtp}

                disabled={
                  otp.length !== 6 ||
                  otpVerified ||
                  verifyingOtp
                }
              >
                {otpVerified
                  ? "✓ OTP Verified"
                  : "Verify OTP"}
              </Button>

            </div>

          </>
        )}


        {/* ==================================================
            Password
            ================================================== */}

        <Input
          label="Password"
          type={
            showPassword
              ? "text"
              : "password"
          }
          name="password"
          icon={Lock}
          value={fields.password}
          onChange={updateField("password")}
          onBlur={markTouched("password")}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          error={visibleError("password")}
          disabled={!otpVerified}

          trailing={

            <button
              type="button"

              onClick={() =>
                setShowPassword(
                  (value) => !value
                )
              }

              className="
                flex
                items-center
                justify-center
                text-ink-faint
                transition-colors
                hover:text-cyan
              "

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


        {/* ==================================================
            Confirm Password
            ================================================== */}

        <Input
          label="Confirm Password"
          type={
            showConfirmPassword
              ? "text"
              : "password"
          }
          name="confirmPassword"
          icon={Lock}
          value={fields.confirmPassword}

          onChange={updateField(
            "confirmPassword"
          )}

          onBlur={markTouched(
            "confirmPassword"
          )}

          placeholder="Re-enter your password"
          autoComplete="new-password"
          required

          error={visibleError(
            "confirmPassword"
          )}

          disabled={!otpVerified}

          trailing={

            <button
              type="button"

              onClick={() =>
                setShowConfirmPassword(
                  (value) => !value
                )
              }

              className="
                flex
                items-center
                justify-center
                text-ink-faint
                transition-colors
                hover:text-cyan
              "

              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
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


        {/* ==================================================
            Error
            ================================================== */}

        {formError && (

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
              rounded-lg
              border
              border-red-500/25
              bg-red-500/[0.07]
              px-3.5
              py-2.5
              text-[13px]
              text-red-300
            "

            role="alert"
          >
            {formError}
          </motion.p>

        )}


        {/* ==================================================
            Create Account
            ================================================== */}

        <Button
          type="submit"
          loading={loading}
          disabled={
            !otpVerified ||
            !verificationToken ||
            loading
          }
        >
          Create Account
        </Button>


        {/* ==================================================
            Divider
            ================================================== */}

        <Divider label="OR" />


        {/* ==================================================
            Google
            ================================================== */}

        <GoogleButton />

      </div>


      {/* ==================================================
          Login Link
          ================================================== */}

      <p
        className="
          mt-7
          text-center
          text-[13.5px]
          text-ink-muted
        "
      >

        Already have an account?{" "}

        <Link
          to="/login"

          className="
            font-medium
            text-cyan/90
            transition-colors
            hover:text-cyan
          "
        >
          Sign In
        </Link>

      </p>

    </motion.form>
  );
}