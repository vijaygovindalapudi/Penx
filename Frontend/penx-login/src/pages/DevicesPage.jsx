import { useEffect, useState } from "react";
import { HardDrive, ShieldCheck, Usb, RefreshCw } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import MobileDrawer from "../components/dashboard/MobileDrawer";

export default function DevicesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.electron?.getUSBDevices) {
        throw new Error("Electron USB service is not available.");
      }

      const result = await window.electron.getUSBDevices();

      setDevices(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Devices Error:", err);
      setError(
        err?.message || "Unable to detect connected USB devices."
      );
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-void text-ink">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main */}
      <div className="relative flex-1">
        <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

        <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan">
                DEVICE MANAGEMENT
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                Devices
              </h1>

              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                Manage the USB devices connected to your PenX ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDevices}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/70 px-4 py-2.5 text-sm text-ink-muted transition hover:border-cyan/40 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded-xl border border-line bg-surface/70 px-3 py-2.5 text-sm text-ink-muted transition hover:border-cyan/30 hover:text-cyan lg:hidden"
              >
                Menu
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <Usb size={20} />
                </div>

                <div>
                  <p className="text-xs text-ink-muted">
                    Connected Devices
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-ink">
                    {devices.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-xs text-ink-muted">
                    PenX Protected
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-ink">
                    {devices.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <HardDrive size={20} />
                </div>

                <div>
                  <p className="text-xs text-ink-muted">
                    Storage Devices
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-ink">
                    {devices.length}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Device List */}
          <section className="rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-ink">
                Connected Devices
              </h2>

              <p className="mt-1 text-sm text-ink-muted">
                USB storage devices detected by PenX.
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="rounded-xl border border-line bg-void/40 p-8 text-center">
                <RefreshCw
                  size={22}
                  className="mx-auto animate-spin text-cyan"
                />

                <p className="mt-3 text-sm text-ink-muted">
                  Detecting connected devices...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-sm font-medium text-red-300">
                  Unable to load devices
                </p>

                <p className="mt-1 text-sm text-ink-muted">
                  {error}
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && devices.length === 0 && (
              <div className="rounded-xl border border-dashed border-line bg-void/30 p-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-cyan">
                  <Usb size={26} />
                </div>

                <h3 className="mt-4 text-base font-medium text-ink">
                  No USB device detected
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                  Connect your PenX USB device and click Refresh to detect it.
                </p>

                <button
                  type="button"
                  onClick={loadDevices}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:opacity-90"
                >
                  <RefreshCw size={16} />
                  Scan Again
                </button>

              </div>
            )}

            {/* Devices */}
            {!loading && !error && devices.length > 0 && (
              <div className="space-y-3">

                {devices.map((device, index) => {
                  const drive =
                    device.DriveLetter ||
                    device.driveLetter ||
                    device.drive ||
                    "Unknown";

                  const name =
                    device.Name ||
                    device.name ||
                    device.VolumeName ||
                    device.volumeName ||
                    `USB Device ${index + 1}`;

                  return (
                    <div
                      key={`${drive}-${index}`}
                      className="flex flex-col gap-4 rounded-2xl border border-line bg-void/40 p-5 transition hover:border-cyan/30 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/5 text-cyan">
                          <Usb size={22} />
                        </div>

                        <div>
                          <h3 className="font-medium text-ink">
                            {name}
                          </h3>

                          <p className="mt-1 text-sm text-ink-muted">
                            Drive: {drive}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 text-xs text-cyan">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                          Connected
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted">
                          <ShieldCheck size={13} />
                          PenX Ready
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

        </main>
      </div>
    </div>
  );
}