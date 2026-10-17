import { useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import StartupAnimation from "./components/common/StartupAnimation";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DashboardPage from "./pages/DashboardPage";
import MyVaultPage from "./pages/MyVaultPage";
import DevicesPage from "./pages/DevicesPage";
import RestorePage from "./pages/RestorePage";
import ActivityPage from "./pages/ActivityPage";
import SettingsPage from "./pages/SettingsPage";

import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyResetOTPPage from "./pages/VerifyResetOTPPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import "./index.css";

// Remember completion within this loaded app.
// Navigating between pages will not replay the intro.
// A full refresh or reopening the app starts it again.
let introCompleted = false;

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !introCompleted
  );

  const finishIntro = () => {
    introCompleted = true;
    setShowIntro(false);
  };

  return (
    <HashRouter>
      {showIntro ? (
        <StartupAnimation onComplete={finishIntro} />
      ) : (
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route
            path="/verify-reset-otp"
            element={<VerifyResetOTPPage />}
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          {/* Authentication required */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/dashboard/vault"
              element={<MyVaultPage />}
            />

            <Route
              path="/dashboard/devices"
              element={<DevicesPage />}
            />

            <Route
              path="/dashboard/restore"
              element={<RestorePage />}
            />

            <Route
              path="/dashboard/activity"
              element={<ActivityPage />}
            />

            <Route
              path="/dashboard/settings"
              element={<SettingsPage />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      )}
    </HashRouter>
  );
}