import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Fingerprint,
  KeyRound,
  RefreshCw,
  LockKeyhole,
  Download,
  CheckCircle2,
  ShieldCheck,
  X,
  FileText,
  UserRound,
  Mail,
  AtSign,
  Loader2,
} from "lucide-react";

export default function QuickActions({
  user,
  devices = [],
  onLockVault,
}) {
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState("");

  const exportingRef = useRef(false);

  const openModal = (name) => {
    setError("");
    setExportSuccess(false);
    setActiveModal(name);
  };

  const closeModal = () => {
    if (exportingRef.current) return;

    setActiveModal(null);
    setExportSuccess(false);
    setError("");
  };

  const handleExportIdentity = async () => {
    if (exportingRef.current) return;

    if (!user?.id) {
      setError("Account details are not loaded yet.");
      return;
    }

    const electron = window.electron;

    if (typeof electron?.exportPDFReport !== "function") {
      setError("Open PenX in the desktop app to export a PDF.");
      return;
    }

    exportingRef.current = true;
    setExportingPDF(true);
    setExportSuccess(false);
    setError("");

    try {
      const registeredDevices = Array.isArray(devices)
        ? devices
        : [];

      let connectedDevices = [];
      let detectionSucceeded = false;

      if (typeof electron.getUSBDevices === "function") {
        try {
          const result = await electron.getUSBDevices();

          if (Array.isArray(result)) {
            connectedDevices = result;
            detectionSucceeded = true;
          }
        } catch {
          // Account-only export can continue without USB detection.
        }
      }

      // Match a connected USB to this account's registered devices.
      const connectedDevice = connectedDevices.find((connected) =>
        registeredDevices.some(
          (registered) =>
            connected.SerialNumber &&
            registered.usb_serial === connected.SerialNumber
        )
      );

      const registeredDevice = connectedDevice
        ? registeredDevices.find(
            (device) =>
              device.usb_serial === connectedDevice.SerialNumber
          )
        : registeredDevices[0];

      let penxIdentity = null;

      if (
        connectedDevice?.DriveLetter &&
        typeof electron.readUSBIdentity === "function"
      ) {
        try {
          const identity = await electron.readUSBIdentity(
            connectedDevice.DriveLetter
          );

          // Include only identity details belonging to this user.
          if (
            identity &&
            String(identity.owner_id) === String(user.id)
          ) {
            penxIdentity = {
              usb_id: identity.usb_id,
              owner_id: identity.owner_id,
              owner_name: identity.owner_name,
              owner_email: identity.owner_email,
              created_at: identity.created_at,
              vault_version: identity.vault_version,
              encryption: identity.encryption,
              status: identity.status,
            };
          }
        } catch {
          // The USB identity handler may not be available yet.
        }
      }

      const reportData = {
        user: {
          id: user.id,
          penx_id: user.penx_id || "Not available",
          full_name: user.full_name || "Not available",
          username: user.username || "Not available",
          email: user.email || "Not available",
          is_active: user.is_active === true,
          is_verified: user.is_verified === true,
          created_at: user.created_at || user.createdAt || null,
        },

        penx_identity: penxIdentity || {},

        device: registeredDevice
          ? {
              name:
                registeredDevice.usb_model ||
                registeredDevice.name ||
                "PenX Device",
              drive: connectedDevice?.DriveLetter || "Not available",
              status: connectedDevice
                ? "Connected"
                : detectionSucceeded
                  ? "Not connected"
                  : "Connection not checked",
            }
          : null,

        // These values do not claim a live vault security check.
        vault: {
          status: "Not checked",
          encryption: penxIdentity?.encryption || "Not checked",
          authentication: "Not checked",
          identity_verification: penxIdentity
            ? "USB identity owner matched"
            : "Not checked",
        },

        generated_at: new Date().toISOString(),
        application: "PenX",
        report_type: "Digital Identity",
      };

      const result = await electron.exportPDFReport(reportData);

      if (result?.success) {
        setExportSuccess(true);
      } else if (!result?.cancelled) {
        throw new Error(
          result?.error || "Unable to generate the PDF."
        );
      }
    } catch (exportError) {
      setError(
        exportError?.message || "Unable to export Digital Identity."
      );
    } finally {
      exportingRef.current = false;
      setExportingPDF(false);
    }
  };

  const handleLockVault = async () => {
    if (typeof onLockVault !== "function") return;

    try {
      await onLockVault();
      openModal("locked");
    } catch {
      openModal("lock-error");
      setError("Unable to lock the vault. Please try again.");
    }
  };

  const actions = [
    {
      id: "identity",
      title: "Export Digital Identity",
      description: "Download your PenX account and identity details.",
      icon: Fingerprint,
      onClick: () => openModal("identity"),
      disabled: !user?.id,
    },
    {
      id: "recovery",
      title: "Recovery Key",
      description: "View account and recovery information.",
      icon: KeyRound,
      onClick: () => openModal("recovery"),
    },
    {
      id: "sync",
      title: "Sync Vault",
      description: "View cloud backup availability.",
      icon: RefreshCw,
      onClick: () => openModal("sync"),
    },
    {
      id: "lock",
      title: "Lock Vault",
      description: "Lock the current vault view.",
      icon: LockKeyhole,
      onClick: handleLockVault,
      disabled: typeof onLockVault !== "function",
    },
  ];

  return (
    <section className="w-full">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-cyan" />

          <h2 className="text-lg font-semibold text-ink">
            Quick Actions
          </h2>
        </div>

        <p className="mt-1 text-sm text-ink-muted">
          Manage your PenX security and vault.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className="group relative overflow-hidden rounded-2xl border border-line bg-surface/70 p-5 text-left transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-cyan/30 enabled:hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/5 text-cyan">
                <Icon size={19} aria-hidden="true" />
              </div>

              <h3 className="text-sm font-semibold text-ink">
                {action.title}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>

      {activeModal === "identity" && (
        <Modal
          title="Digital Identity"
          icon={Fingerprint}
          onClose={closeModal}
          busy={exportingPDF}
        >
          {exportSuccess ? (
            <div className="py-5 text-center" role="status">
              <CheckCircle2
                size={40}
                className="mx-auto text-cyan"
              />

              <h3 className="mt-4 font-semibold text-ink">
                Report Generated
              </h3>

              <p className="mt-2 text-sm text-ink-muted">
                Your Digital Identity PDF has been saved.
              </p>

              <button
                type="button"
                onClick={closeModal}
                className="mt-5 rounded-xl bg-cyan px-5 py-2.5 text-sm font-semibold text-slate-950"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-line bg-surface/60 p-4">
                <FileText
                  size={22}
                  className="shrink-0 text-cyan"
                />

                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Export your PenX identity
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    Download your account details and available
                    USB identity information. Passwords and
                    encryption keys are not included.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 rounded-xl border border-line bg-surface/40 p-4">
                <IdentityRow
                  icon={UserRound}
                  label="Full Name"
                  value={user?.full_name}
                />

                <IdentityRow
                  icon={AtSign}
                  label="Username"
                  value={user?.username}
                />

                <IdentityRow
                  icon={Fingerprint}
                  label="PenX ID"
                  value={user?.penx_id}
                />

                <IdentityRow
                  icon={Mail}
                  label="Email"
                  value={user?.email}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={exportingPDF}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm text-ink-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExportIdentity}
                  disabled={exportingPDF || !user?.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exportingPDF ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}

                  {exportingPDF ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {activeModal === "recovery" && (
        <Modal
          title="Recovery Key"
          icon={KeyRound}
          onClose={closeModal}
        >
          <p className="text-sm leading-6 text-ink-muted">
            Recovery-key generation is not available in this
            version. The Digital Identity PDF is an account
            report, not a vault recovery key.
          </p>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                closeModal();
                navigate("/dashboard/settings");
              }}
              className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-slate-950"
            >
              Open Settings
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "sync" && (
        <Modal
          title="Sync Vault"
          icon={RefreshCw}
          onClose={closeModal}
        >
          <div className="flex gap-3 rounded-xl border border-line bg-surface/60 p-4">
            <RefreshCw
              size={20}
              className="mt-0.5 shrink-0 text-cyan"
            />

            <div>
              <h3 className="text-sm font-semibold text-ink">
                Cloud Backup
              </h3>

              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Cloud backup is not available in this version.
                Your files have not been synced by this action.
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-line px-4 py-2.5 text-sm text-ink-muted opacity-50"
            >
              Cloud Backup Unavailable
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "locked" && (
        <Modal
          title="Vault View Locked"
          icon={LockKeyhole}
          onClose={closeModal}
        >
          <div className="py-4 text-center">
            <LockKeyhole
              size={36}
              className="mx-auto text-cyan"
            />

            <h3 className="mt-4 font-semibold text-ink">
              Vault view locked
            </h3>

            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Use Unlock Vault in the explorer to reopen this view.
            </p>
          </div>
        </Modal>
      )}

      {activeModal === "lock-error" && (
        <Modal
          title="Unable to Lock"
          icon={LockKeyhole}
          onClose={closeModal}
        >
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        </Modal>
      )}
    </section>
  );
}

function Modal({
  title,
  icon: Icon,
  children,
  onClose,
  busy = false,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-busy={busy}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-void shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
              <Icon size={18} aria-hidden="true" />
            </div>

            <h2 className="text-sm font-semibold text-ink">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-ink-muted transition enabled:hover:bg-surface enabled:hover:text-ink disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function IdentityRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        size={15}
        className="shrink-0 text-cyan"
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-ink-faint">
          {label}
        </p>

        <p className="break-words text-xs font-medium text-ink">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}