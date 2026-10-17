import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

import Sidebar from "../components/dashboard/Sidebar";
import MobileDrawer from "../components/dashboard/MobileDrawer";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SecurityStatusCard from "../components/dashboard/SecurityStatusCard";
import UsbStatusCard from "../components/dashboard/UsbStatusCard";
import CloudStorageCard from "../components/dashboard/CloudStorageCard";
import DevicesCard from "../components/dashboard/DevicesCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";
import PenXExplorer from "../components/dashboard/explorer/PenXExplorer";
import NotificationPanel from "../components/dashboard/notifications/NotificationPanel";
import ProfileDrawer from "../components/dashboard/profile/ProfileDrawer";
import PenXMoment from "../components/dashboard/PenXMoment";

function requestErrorMessage(error, label) {
  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return `${label}: server did not respond within 15 seconds.`;
  }

  if (!error.response) {
    return `${label}: unable to reach the backend.`;
  }

  return `${label}: request failed (HTTP ${error.response.status}).`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { notifications = [] } = useNotification();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [devicesError, setDevicesError] = useState("");

  const [profileReloadKey, setProfileReloadKey] = useState(0);
  const [devicesReloadKey, setDevicesReloadKey] = useState(0);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [momentOpen, setMomentOpen] = useState(true);
  const [vaultLocked, setVaultLocked] = useState(false);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((notification) => notification.unread).length
    : 0;

  // Load account details without blocking the dashboard layout.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError("");

      if (!localStorage.getItem("token")) {
        setProfileLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/auth/me", {
          signal: controller.signal,
          timeout: 15000,
        });

        if (!active) return;

        if (!response.data?.id) {
          throw new Error("Invalid account response.");
        }

        setUser(response.data);
      } catch (error) {
        if (!active || controller.signal.aborted) return;

        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        setProfileError(
          error.message === "Invalid account response."
            ? "The backend returned incomplete account details."
            : requestErrorMessage(error, "Account details")
        );
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
      controller.abort();
    };
  }, [navigate, profileReloadKey]);

  // Device loading is independent of account loading.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadDevices() {
      setDevicesLoading(true);
      setDevicesError("");

      if (!localStorage.getItem("token")) {
        setDevicesLoading(false);
        return;
      }

      try {
        const response = await api.get("/devices/", {
          signal: controller.signal,
          timeout: 15000,
        });

        if (!active) return;

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid devices response.");
        }

        setDevices(response.data);
      } catch (error) {
        if (!active || controller.signal.aborted) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        setDevicesError(
          error.message === "Invalid devices response."
            ? "The backend returned an invalid devices list."
            : requestErrorMessage(error, "Registered devices")
        );
      } finally {
        if (active) {
          setDevicesLoading(false);
        }
      }
    }

    loadDevices();

    return () => {
      active = false;
      controller.abort();
    };
  }, [navigate, devicesReloadKey]);

  const retryProfile = () => {
    setProfileReloadKey((previous) => previous + 1);
  };

  const retryDevices = () => {
    setDevicesReloadKey((previous) => previous + 1);
  };

  const handleRegistered = (registeredDevice) => {
    if (!registeredDevice?.id) return;

    setDevices((previous) => [
      ...previous.filter(
        (device) => device.id !== registeredDevice.id
      ),
      registeredDevice,
    ]);

    // Fetch the latest list and cancel any older list request.
    setDevicesReloadKey((previous) => previous + 1);
  };

  const handleLockVault = () => {
    setVaultLocked(true);
    setProfileOpen(false);
  };

  // PenXExplorer verifies the password before invoking this.
  const handleUnlockVault = () => {
    setVaultLocked(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-void">
      <Sidebar />

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

        <main className="relative mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <DashboardHeader
            user={user}
            name={
              user?.full_name ||
              (profileLoading ? "Loading..." : "PenX User")
            }
            onMenuClick={() => setDrawerOpen(true)}
            notificationCount={unreadCount}
            onNotificationClick={() => {
              setProfileOpen(false);
              setNotificationOpen(true);
            }}
            onProfileClick={() => {
              if (!user) return;

              setNotificationOpen(false);
              setProfileOpen((previous) => !previous);
            }}
          />

          {(profileLoading || profileError) && (
            <div
              role={profileError ? "alert" : "status"}
              className="mt-5 rounded-xl border border-line bg-surface/80 p-4"
            >
              <p className="text-sm text-ink-muted">
                {profileError || "Loading account details…"}
              </p>

              {profileError && (
                <button
                  type="button"
                  onClick={retryProfile}
                  className="mt-3 rounded-lg border border-line px-4 py-2 text-sm text-cyan"
                >
                  Retry Account
                </button>
              )}
            </div>
          )}

          <div className="mt-8">
            <SecurityStatusCard />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <UsbStatusCard
              user={user}
              onRegistered={handleRegistered}
            />

            {/* Existing placeholder values; cloud API is not connected. */}
            <CloudStorageCard usedMb={0} totalGb={10} />

            {devicesLoading || devicesError ? (
              <div
                role={devicesError ? "alert" : "status"}
                className="flex h-full flex-col justify-center rounded-2xl border border-line bg-surface/80 p-6"
              >
                <h2 className="text-sm font-medium text-ink">
                  Registered Devices
                </h2>

                <p className="mt-3 text-sm text-ink-muted">
                  {devicesError || "Loading registered devices…"}
                </p>

                {devicesError && (
                  <button
                    type="button"
                    onClick={retryDevices}
                    className="mt-4 self-start rounded-lg border border-line px-4 py-2 text-sm text-cyan"
                  >
                    Retry Devices
                  </button>
                )}
              </div>
            ) : (
              <DevicesCard
                count={devices.length}
                devices={devices}
              />
            )}
          </div>

          <div className="mt-8">
            <QuickActions
              user={user}
              devices={devices}
              onLockVault={handleLockVault}
            />
          </div>

          <div className="mt-8 min-w-0">
            {user ? (
              <PenXExplorer
                user={user}
                vaultLocked={vaultLocked}
                onUnlockVault={handleUnlockVault}
              />
            ) : (
              <div className="rounded-2xl border border-line bg-surface/80 p-6">
                <h2 className="text-lg font-semibold text-ink">
                  PenX Explorer
                </h2>

                <p className="mt-2 text-sm text-ink-muted">
                  {profileLoading
                    ? "Loading your account before opening the explorer…"
                    : "Account details are unavailable. Retry Account above to open the explorer."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pb-4">
            <RecentActivity />
          </div>
        </main>
      </div>

      <NotificationPanel
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {user && (
        <ProfileDrawer
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          devices={devices}
          vaultLocked={vaultLocked}
          onLockVault={handleLockVault}
        />
      )}

      {user && !profileLoading && (
        <PenXMoment
          open={momentOpen}
          userName={user.full_name || ""}
          onClose={() => setMomentOpen(false)}
        />
      )}
    </div>
  );
}