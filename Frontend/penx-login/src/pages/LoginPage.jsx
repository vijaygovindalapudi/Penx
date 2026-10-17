import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Logo from "../components/auth/Logo";
import BrandPanel from "../components/auth/BrandPanel";
import LoginForm from "../components/auth/LoginForm";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function getLoginError(error, fallback) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return "The server took too long to respond. Please try again.";
  }

  return error.message || fallback;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    sessionMessage,
    clearSessionMessage,
  } = useAuth();

  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  const busyRef = useRef(false);

  const goToDashboard = () => {
    const requestedPath = location.state?.from;

    // Only return to known private pages.
    const allowedPaths = [
      "/dashboard",
      "/dashboard/vault",
      "/dashboard/devices",
      "/dashboard/restore",
      "/dashboard/activity",
      "/dashboard/settings",
    ];

    const pathname =
      typeof requestedPath === "string"
        ? requestedPath.split(/[?#]/)[0]
        : "";

    const destination = allowedPaths.includes(pathname)
      ? requestedPath
      : "/dashboard";

    navigate(destination, { replace: true });
  };

  const completeLogin = async (accessToken) => {
    if (
      typeof accessToken !== "string" ||
      !accessToken.trim()
    ) {
      throw new Error(
        "PenX server did not return a valid access token."
      );
    }

    // Saves the token and verifies /auth/me.
    await login(accessToken);

    // ProtectedRoute handles authenticated, error, or expired
    // session states. It never shows private content unverified.
    goToDashboard();
  };

  const beginLogin = () => {
    if (busyRef.current) return false;

    busyRef.current = true;
    setBusy(true);
    setLoginError("");
    clearSessionMessage();

    return true;
  };

  const finishLogin = () => {
    busyRef.current = false;
    setBusy(false);
  };

  // Email and password login.
  const handleLogin = async ({ email, password }) => {
    if (!beginLogin()) return;

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      await completeLogin(response.data?.access_token);
    } catch (error) {
      setLoginError(
        getLoginError(
          error,
          "Login failed. Please try again."
        )
      );
    } finally {
      finishLogin();
    }
  };

  // Google login through Electron.
  const handleGoogleLogin = async () => {
    if (!beginLogin()) return;

    try {
      if (typeof window.electron?.googleLogin !== "function") {
        throw new Error(
          "Google sign-in requires the PenX desktop app."
        );
      }

      const googleResult = await window.electron.googleLogin();

      if (googleResult?.cancelled) {
        return;
      }

      if (!googleResult?.success) {
        throw new Error(
          googleResult?.error ||
            "Google authentication failed."
        );
      }

      if (!googleResult.idToken) {
        throw new Error(
          "Google did not return an ID token."
        );
      }

      const response = await api.post("/auth/google", {
        id_token: googleResult.idToken,
      });

      await completeLogin(response.data?.access_token);
    } catch (error) {
      setLoginError(
        error.response?.status === 404
          ? "The Google sign-in endpoint was not found. Check the backend URL and routes."
          : getLoginError(
              error,
              "Google sign-in failed. Please try again."
            )
      );
    } finally {
      finishLogin();
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

        {/* Background */}
        <div className="pointer-events-none absolute inset-0 bg-grid-fade lg:hidden" />

        {/* Session and login messages */}
        {(sessionMessage || loginError) && (
          <div
            role={loginError ? "alert" : "status"}
            className={`relative mb-5 w-full max-w-md rounded-xl border p-4 text-sm ${
              loginError
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-cyan/20 bg-cyan/5 text-ink-muted"
            }`}
          >
            {loginError || sessionMessage}
          </div>
        )}

        {/* Login form */}
        <fieldset
          disabled={busy}
          aria-busy={busy}
          className="relative m-0 w-full min-w-0 max-w-md border-0 p-0"
        >
          <LoginForm
            onSubmit={handleLogin}
            onGoogleLogin={handleGoogleLogin}
          />
        </fieldset>

        {busy && (
          <p
            role="status"
            className="relative mt-4 text-sm text-cyan"
          >
            Signing you in…
          </p>
        )}

        {/* Footer */}
        <p className="relative mt-10 text-[12px] text-ink-faint">
          © {new Date().getFullYear()} PenX Security Inc.
          All rights reserved.
        </p>
      </div>
    </div>
  );
}