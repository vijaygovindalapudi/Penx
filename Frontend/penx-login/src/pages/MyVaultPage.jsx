import { useEffect, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/dashboard/Sidebar";
import MobileDrawer from "../components/dashboard/MobileDrawer";
import PenXExplorer from "../components/dashboard/explorer/PenXExplorer";

export default function MyVaultPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ============================================
  // Vault Lock State
  // ============================================

  const [vaultLocked, setVaultLocked] = useState(false);

  // ============================================
  // Load Logged-in User
  // ============================================

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const response = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("My Vault User:", response.data);

        setUser(response.data);
      } catch (error) {
        console.error(
          "My Vault User Error:",
          error.response?.data || error
        );
      }
    }

    loadUser();
  }, []);

  // ============================================
  // Lock Vault
  // ============================================

  const handleLockVault = () => {
    console.log("🔒 My Vault locked.");

    setVaultLocked(true);
  };

  // ============================================
  // Unlock Vault
  // ============================================

  const handleUnlockVault = () => {
    console.log("🔓 My Vault unlocked.");

    setVaultLocked(false);
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="flex min-h-screen w-full bg-void">

      {/* ========================================
          Desktop Sidebar
      ======================================== */}

      <Sidebar />

      {/* ========================================
          Mobile Drawer
      ======================================== */}

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ========================================
          Main Content
      ======================================== */}

      <div className="relative flex-1">

        {/* PenX background atmosphere */}

        <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

        <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

          {/* ====================================
              Page Header
          ==================================== */}

          <div className="mb-8">

            <div className="flex items-center justify-between">

              <div>
                <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
                  My Vault
                </h1>

                <p className="mt-1 text-sm text-ink-muted">
                  Your files. Your control.
                </p>
              </div>

              {/* Mobile menu */}

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded-xl border border-line bg-surface/70 px-3 py-2 text-sm text-ink-muted transition hover:border-cyan/30 hover:text-cyan lg:hidden"
              >
                Menu
              </button>

            </div>

          </div>

          {/* ====================================
              PenX Explorer
          ==================================== */}

          <PenXExplorer
            user={user}
            vaultLocked={vaultLocked}
            onUnlockVault={handleUnlockVault}
            vaultMode={true}
          />

        </main>

      </div>

    </div>
  );
}