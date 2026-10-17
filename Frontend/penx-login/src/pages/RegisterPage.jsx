import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../components/auth/Logo";
import BrandPanel from "../components/auth/BrandPanel";
import RegisterForm from "../components/auth/RegisterForm";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function getRegistrationError(error) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(" ") || "Please check your registration details.";
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    !error.response
  ) {
    return (
      "Unable to confirm registration. " +
      "Your account may have been created. " +
      "Try signing in before registering again."
    );
  }

  return "Registration failed. Please try again.";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const submittingRef = useRef(false);

  const handleRegister = async ({
    fullName,
    username,
    email,
    password,
    verificationToken,
  }) => {
    if (submittingRef.current) return;

    submittingRef.current = true;

    try {
      let response;

      try {
        response = await api.post("/auth/register", {
          full_name: fullName,
          username,
          email,
          password,
          verification_token: verificationToken,
        });
      } catch (error) {
        // RegisterForm displays the thrown error.
        throw new Error(getRegistrationError(error));
      }

      const accessToken = response.data?.access_token;

      if (
        typeof accessToken !== "string" ||
        !accessToken.trim()
      ) {
        throw new Error(
          "Account creation was accepted, but no valid sign-in " +
          "token was returned. Please open the login page and sign in."
        );
      }

      try {
        // AuthContext saves "token" and verifies /auth/me.
        await login(accessToken);
      } catch {
        throw new Error(
          "Your account was created, but automatic sign-in failed. " +
          "Please open the login page and sign in."
        );
      }

      // ProtectedRoute handles verification errors with Retry,
      // or redirects expired/invalid sessions to login.
      navigate("/dashboard", {
        replace: true,
      });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-void">
      <BrandPanel />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>

        {/* Mobile background */}
        <div className="pointer-events-none absolute inset-0 bg-grid-fade lg:hidden" />

        {/* Existing OTP and registration form */}
        <RegisterForm onSubmit={handleRegister} />

        <p className="mt-10 text-[12px] text-ink-faint">
          © {new Date().getFullYear()} PenX Security Inc.
          All rights reserved.
        </p>
      </div>
    </div>
  );
}