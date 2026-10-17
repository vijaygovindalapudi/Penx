import { useState } from "react";
import {
  Activity,
  ShieldCheck,
  LockKeyhole,
  UnlockKeyhole,
  Upload,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import MobileDrawer from "../components/dashboard/MobileDrawer";

export default function ActivityPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Temporary activity data.
  // Later we will connect this to real PenX activity logs.
  const activities = [
    {
      id: 1,
      type: "security",
      icon: ShieldCheck,
      title: "PenX security initialized",
      description: "Your secure vault environment is ready.",
      time: "Today",
    },
    {
      id: 2,
      type: "encrypt",
      icon: LockKeyhole,
      title: "File encrypted",
      description: "A file was securely encrypted inside your vault.",
      time: "Today",
    },
    {
      id: 3,
      type: "import",
      icon: Upload,
      title: "File imported",
      description: "A file was added to your PenX Vault.",
      time: "Today",
    },
    {
      id: 4,
      type: "decrypt",
      icon: UnlockKeyhole,
      title: "File decrypted",
      description: "A protected file was restored to a selected folder.",
      time: "Yesterday",
    },
    {
      id: 5,
      type: "restore",
      icon: Download,
      title: "File restored",
      description: "A vault file was successfully restored.",
      time: "Yesterday",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-void text-ink">

      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main Content */}
      <div className="relative flex-1">

        {/* Background */}
        <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

        <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-cyan">
                SECURITY HISTORY
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                Activity
              </h1>

              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                Keep track of important actions performed inside your PenX
                ecosystem.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl border border-line bg-surface/70 px-3 py-2.5 text-sm text-ink-muted transition hover:border-cyan/30 hover:text-cyan lg:hidden"
            >
              Menu
            </button>

          </div>

          {/* Security Overview */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <Activity size={21} />
                </div>

                <div>
                  <p className="text-xs text-ink-muted">
                    Total Events
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-ink">
                    {activities.length}
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-xs text-ink-muted">
                    Security Status
                  </p>

                  <p className="mt-1 text-sm font-medium text-cyan">
                    Protected
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <RefreshCw size={21} />
                </div>

                <div>
                  <p className="text-xs text-ink-muted">
                    Latest Activity
                  </p>

                  <p className="mt-1 text-sm font-medium text-ink">
                    Today
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Activity List */}
          <section className="rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-ink">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-ink-muted">
                Recent security and file operations.
              </p>
            </div>

            <div className="space-y-3">

              {activities.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-2xl border border-line bg-void/40 p-4 transition hover:border-cyan/30"
                  >

                    {/* Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/5 text-cyan">
                      <Icon size={19} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">

                        <h3 className="text-sm font-medium text-ink">
                          {item.title}
                        </h3>

                        <span className="text-xs text-ink-muted">
                          {item.time}
                        </span>

                      </div>

                      <p className="mt-1 text-sm text-ink-muted">
                        {item.description}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>

          {/* Future Activity Logging */}
          <div className="mt-6 rounded-2xl border border-cyan/10 bg-cyan/5 p-5">

            <div className="flex items-start gap-3">

              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-cyan"
              />

              <div>
                <p className="text-sm font-medium text-ink">
                  Activity logging
                </p>

                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  PenX will record important vault operations such as
                  encryption, decryption, imports, restores and security
                  events.
                </p>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}