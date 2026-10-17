import { useState } from "react";
import {
  Settings,
  User,
  ShieldCheck,
  LockKeyhole,
  Bell,
  Monitor,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Menu,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import MobileDrawer from "../components/dashboard/MobileDrawer";

export default function SettingsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [activeSection, setActiveSection] = useState("account");

  const [showPassword, setShowPassword] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  const updateSetting = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    console.log("PenX Settings:", {
      ...settings,
      notificationsEnabled,
    });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const sections = [
    {
      id: "account",
      label: "Account",
      icon: User,
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
    },
    {
      id: "vault",
      label: "Vault",
      icon: LockKeyhole,
    },
    {
      id: "application",
      label: "Application",
      icon: Monitor,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-void text-ink">

      {/* =================================================
          Sidebar
      ================================================= */}

      <Sidebar />

      {/* =================================================
          Mobile Drawer
      ================================================= */}

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* =================================================
          Main
      ================================================= */}

      <div className="relative flex-1">

        <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

        <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

          {/* =================================================
              Header
          ================================================= */}

          <div className="mb-8 flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-cyan">
                PENX CONFIGURATION
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                Manage your PenX account, security and application
                preferences.
              </p>

            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/70 px-3 py-2.5 text-sm text-ink-muted transition hover:border-cyan/30 hover:text-cyan lg:hidden"
            >
              <Menu size={17} />
              Menu
            </button>

          </div>

          {/* =================================================
              Settings Layout
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">

            {/* =================================================
                Settings Navigation
            ================================================= */}

            <aside className="h-fit rounded-2xl border border-line bg-surface/60 p-2">

              {sections.map((section) => {
                const Icon = section.icon;

                const active =
                  activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(section.id)
                    }
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      active
                        ? "border border-cyan/20 bg-cyan/10 text-cyan"
                        : "text-ink-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <Icon size={17} />

                    <span>
                      {section.label}
                    </span>
                  </button>
                );
              })}

            </aside>

            {/* =================================================
                Settings Content
            ================================================= */}

            <section className="rounded-2xl border border-line bg-surface/60 p-5 sm:p-7">

              {/* =================================================
                  ACCOUNT
              ================================================= */}

              {activeSection === "account" && (
                <div>

                  <div className="mb-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                        <User size={19} />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-ink">
                          Account
                        </h2>

                        <p className="text-sm text-ink-muted">
                          Manage your PenX account information.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="space-y-5">

                    <div>
                      <label className="mb-2 block text-sm text-ink-muted">
                        Full name
                      </label>

                      <input
                        type="text"
                        value={settings.fullName}
                        onChange={(event) =>
                          updateSetting(
                            "fullName",
                            event.target.value
                          )
                        }
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-ink-muted">
                        Email address
                      </label>

                      <input
                        type="email"
                        value={settings.email}
                        onChange={(event) =>
                          updateSetting(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      />
                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  SECURITY
              ================================================= */}

              {activeSection === "security" && (
                <div>

                  <div className="mb-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                        <ShieldCheck size={19} />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-ink">
                          Security
                        </h2>

                        <p className="text-sm text-ink-muted">
                          Manage your account security settings.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="space-y-5">

                    <div>

                      <label className="mb-2 block text-sm text-ink-muted">
                        Current password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            settings.currentPassword
                          }
                          onChange={(event) =>
                            updateSetting(
                              "currentPassword",
                              event.target.value
                            )
                          }
                          placeholder="Current password"
                          className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 pr-12 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition hover:text-cyan"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>

                      </div>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm text-ink-muted">
                        New password
                      </label>

                      <input
                        type="password"
                        value={
                          settings.newPassword
                        }
                        onChange={(event) =>
                          updateSetting(
                            "newPassword",
                            event.target.value
                          )
                        }
                        placeholder="New password"
                        className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
                      />

                    </div>

                    <div className="rounded-xl border border-cyan/10 bg-cyan/5 p-4">

                      <div className="flex items-start gap-3">

                        <ShieldCheck
                          size={18}
                          className="mt-0.5 shrink-0 text-cyan"
                        />

                        <p className="text-sm leading-6 text-ink-muted">
                          PenX security settings will be connected
                          to your authenticated account and vault
                          security system.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  VAULT
              ================================================= */}

              {activeSection === "vault" && (
                <div>

                  <div className="mb-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                        <LockKeyhole size={19} />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-ink">
                          Vault
                        </h2>

                        <p className="text-sm text-ink-muted">
                          Configure your PenX secure vault.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="space-y-4">

                    <div className="flex items-center justify-between rounded-2xl border border-line bg-void/40 p-5">

                      <div>

                        <p className="text-sm font-medium text-ink">
                          Encryption
                        </p>

                        <p className="mt-1 text-sm text-ink-muted">
                          AES-256-GCM file encryption
                        </p>

                      </div>

                      <span className="rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 text-xs text-cyan">
                        Enabled
                      </span>

                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-line bg-void/40 p-5">

                      <div>

                        <p className="text-sm font-medium text-ink">
                          Vault protection
                        </p>

                        <p className="mt-1 text-sm text-ink-muted">
                          Protected PenX vault environment
                        </p>

                      </div>

                      <span className="rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 text-xs text-cyan">
                        Active
                      </span>

                    </div>

                    <div className="rounded-2xl border border-line bg-void/40 p-5">

                      <p className="text-sm font-medium text-ink">
                        Vault password
                      </p>

                      <p className="mt-1 text-sm leading-6 text-ink-muted">
                        Your vault password is required to decrypt
                        protected files.
                      </p>

                      <button
                        type="button"
                        className="mt-4 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink-muted transition hover:border-cyan/30 hover:text-cyan"
                      >
                        Manage Vault Password
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  APPLICATION
              ================================================= */}

              {activeSection === "application" && (
                <div>

                  <div className="mb-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                        <Monitor size={19} />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-ink">
                          Application
                        </h2>

                        <p className="text-sm text-ink-muted">
                          Configure your PenX desktop experience.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="space-y-4">

                    <div className="flex items-center justify-between rounded-2xl border border-line bg-void/40 p-5">

                      <div className="flex items-center gap-3">

                        <Bell
                          size={18}
                          className="text-cyan"
                        />

                        <div>

                          <p className="text-sm font-medium text-ink">
                            Notifications
                          </p>

                          <p className="mt-1 text-sm text-ink-muted">
                            Receive important PenX activity alerts.
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setNotificationsEnabled(
                            (previous) =>
                              !previous
                          )
                        }
                        className={`relative h-6 w-11 rounded-full transition ${
                          notificationsEnabled
                            ? "bg-cyan"
                            : "bg-surface"
                        }`}
                      >

                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            notificationsEnabled
                              ? "left-6"
                              : "left-1"
                          }`}
                        />

                      </button>

                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-line bg-void/40 p-5">

                      <div>

                        <p className="text-sm font-medium text-ink">
                          Appearance
                        </p>

                        <p className="mt-1 text-sm text-ink-muted">
                          PenX dark interface
                        </p>

                      </div>

                      <span className="rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 text-xs text-cyan">
                        Dark
                      </span>

                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-line bg-void/40 p-5">

                      <div>

                        <p className="text-sm font-medium text-ink">
                          PenX Version
                        </p>

                        <p className="mt-1 text-sm text-ink-muted">
                          Desktop application
                        </p>

                      </div>

                      <span className="text-sm text-ink-muted">
                        v1.0.0
                      </span>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  Save
              ================================================= */}

              <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  {saved && (
                    <div className="flex items-center gap-2 text-sm text-cyan">

                      <CheckCircle2 size={16} />

                      Settings saved

                    </div>
                  )}

                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                >
                  <Save size={17} />
                  Save Changes
                </button>

              </div>

            </section>

          </div>

        </main>
      </div>
    </div>
  );
}