import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Usb } from "lucide-react";

import GlassCard from "../ui/GlassCard";
import IconBadge from "../ui/IconBadge";
import CardButton from "../ui/CardButton";
import api from "../../services/api";

function getErrorMessage(error) {
  const detail = error.response?.data?.detail;

  return typeof detail === "string"
    ? detail
    : error.message || "USB operation failed. Please try again.";
}

function formatSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) return "--";

  return `${(size / 1024 ** 3).toFixed(1)} GB`;
}

function sameUSB(first, second) {
  return (
    first?.SerialNumber === second?.SerialNumber &&
    first?.DriveLetter === second?.DriveLetter
  );
}

export default function UsbStatusCard({ user, onRegistered }) {
  const [usb, setUsb] = useState(null);

  // null means ownership is unknown, not "unregistered".
  const [ownership, setOwnership] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanError, setScanError] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  // Remember incomplete identity writes during this mount.
  const [pendingIdentity, setPendingIdentity] = useState({});

  const busyRef = useRef(false);
  const mountedRef = useRef(false);
  const generationRef = useRef(0);
  const selectedRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const controller = new AbortController();

    async function scanUSB() {
      const generation = generationRef.current;

      const canUpdate = () =>
        !cancelled &&
        !busyRef.current &&
        generation === generationRef.current;

      try {
        if (busyRef.current) return;

        if (!window.electron?.getUSBDevices) {
          throw new Error(
            "USB detection requires the PenX desktop app."
          );
        }

        const devices = await window.electron.getUSBDevices();

        if (!canUpdate()) return;

        if (!Array.isArray(devices)) {
          throw new Error("Unable to read connected USB devices.");
        }

        // Keep the selected USB while it remains connected.
        const currentUSB =
          devices.find((device) =>
            sameUSB(device, selectedRef.current)
          ) ||
          devices[0] ||
          null;

        if (!sameUSB(currentUSB, selectedRef.current)) {
          setOwnership(null);
          setActionMessage(null);
        }

        selectedRef.current = currentUSB;
        setUsb(currentUSB);

        if (!currentUSB) {
          setOwnership(null);
          setScanError("");
          return;
        }

        if (!currentUSB.SerialNumber) {
          throw new Error("USB serial number is unavailable.");
        }

        if (!user?.id) {
          throw new Error("Account details are not loaded yet.");
        }

        const response = await api.post(
          "/devices/check",
          { usb_serial: currentUSB.SerialNumber },
          { signal: controller.signal }
        );

        if (!canUpdate()) return;

        const result = response.data;

        if (
          typeof result?.registered !== "boolean" ||
          typeof result?.owner !== "boolean"
        ) {
          throw new Error("Invalid USB ownership response.");
        }

        setOwnership(result);
        setScanError("");
      } catch (error) {
        if (!canUpdate()) return;

        setOwnership(null);
        setScanError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          // Schedule after completion to avoid overlapping scans.
          timer = window.setTimeout(scanUSB, 3000);
        }
      }
    }

    scanUSB();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [user?.id]);

  async function registerUSB() {
    if (
      busyRef.current ||
      !usb ||
      !user?.id ||
      !ownership ||
      scanError
    ) {
      return;
    }

    const target = { ...usb };
    const serial = target.SerialNumber;
    const retryIdentity = Boolean(pendingIdentity[serial]);

    if (
      ownership.registered &&
      (!ownership.owner || !retryIdentity)
    ) {
      return;
    }

    busyRef.current = true;
    generationRef.current += 1;
    setBusy(true);
    setActionMessage(null);

    let registeredToUser = false;

    try {
      if (
        !window.electron?.getUSBDevices ||
        !window.electron?.createUSBIdentity
      ) {
        throw new Error(
          "USB registration requires the PenX desktop app."
        );
      }

      if (!target.DriveLetter) {
        throw new Error("USB drive location is unavailable.");
      }

      // Recheck ownership immediately before registration.
      const check = await api.post("/devices/check", {
        usb_serial: serial,
      });

      const latest = check.data;

      if (
        typeof latest?.registered !== "boolean" ||
        typeof latest?.owner !== "boolean"
      ) {
        throw new Error("Unable to confirm USB ownership.");
      }

      if (mountedRef.current) {
        setOwnership(latest);
      }

      if (latest.registered && !latest.owner) {
        throw new Error(
          "This USB is registered to another account."
        );
      }

      if (latest.registered && !retryIdentity) {
        throw new Error(
          "This USB is already registered to your account."
        );
      }

      if (!latest.registered) {
        const response = await api.post("/devices/register", {
          usb_model: target.Model,
          usb_serial: serial,
          usb_size: target.Size,
        });

        registeredToUser = true;

        if (mountedRef.current) {
          // Update the dashboard even if the local write fails.
          try {
            onRegistered?.(response.data);
          } catch {
            // A parent refresh failure must not stop setup.
          }
        }
      } else {
        registeredToUser = true;
      }

      if (mountedRef.current) {
        setOwnership({ registered: true, owner: true });
        setPendingIdentity((previous) => ({
          ...previous,
          [serial]: true,
        }));
      }

      // Verify that the same USB is still at the same location.
      const connected = await window.electron.getUSBDevices();

      if (
        !Array.isArray(connected) ||
        !connected.some((device) => sameUSB(device, target))
      ) {
        throw new Error(
          "USB disconnected or its drive location changed."
        );
      }

      const identity = await window.electron.createUSBIdentity(
        target.DriveLetter,
        {
          owner_id: user.id,
          owner_name: user.full_name,
          owner_email: user.email,
        }
      );

      if (
        !identity?.usb_id ||
        String(identity.owner_id) !== String(user.id)
      ) {
        throw new Error("USB identity could not be confirmed.");
      }

      if (mountedRef.current) {
        setPendingIdentity((previous) => {
          const next = { ...previous };
          delete next[serial];
          return next;
        });

        setActionMessage({
          type: "success",
          text: "USB registration and identity setup completed.",
        });
      }
    } catch (error) {
      if (mountedRef.current) {
        setActionMessage({
          type: "error",
          text: registeredToUser
            ? `Account registration completed, but USB identity setup failed. ${getErrorMessage(error)} Reconnect the USB and retry setup.`
            : getErrorMessage(error),
        });
      }
    } finally {
      busyRef.current = false;

      if (mountedRef.current) {
        setBusy(false);
      }
    }
  }

  const needsIdentity = Boolean(
    usb && pendingIdentity[usb.SerialNumber]
  );

  const disabled =
    busy ||
    !user?.id ||
    !usb ||
    !ownership ||
    Boolean(scanError) ||
    (ownership.registered &&
      (!ownership.owner || !needsIdentity));

  const buttonLabel = busy
    ? "Setting up USB..."
    : !usb
      ? "Connect a USB"
      : !ownership
        ? "Ownership not confirmed"
        : ownership.registered && !ownership.owner
          ? "Registered to another account"
          : ownership.registered && needsIdentity
            ? "Retry USB Setup"
            : ownership.registered
              ? "Registered"
              : "Register USB";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <GlassCard className="flex h-full flex-col justify-between gap-5 p-6">
        <div>
          <div className="flex items-center gap-3">
            <IconBadge icon={Usb} tone="cyan" />

            <p className="text-sm font-medium text-ink">
              USB Status
            </p>
          </div>

          <p className="mt-5 text-lg font-semibold text-white">
            {usb
              ? "USB Connected"
              : scanError
                ? "USB Status Unavailable"
                : "No USB Connected"}
          </p>

          <p className="mt-2 break-words text-sm text-ink-muted">
            {usb?.Model || "Connect your PenX USB to get started."}
          </p>

          {usb && (
            <>
              <p className="mt-3 text-xs text-ink-faint">
                Capacity: {formatSize(usb.Size)}
              </p>

              <p className="mt-1 text-xs text-ink-faint">
                Drive: {usb.DriveLetter || "--"}
              </p>

              {ownership?.registered && ownership.owner && (
                <p className="mt-3 text-sm text-green-400">
                  {needsIdentity
                    ? "Account registered; USB setup pending."
                    : "Registered to this account"}
                </p>
              )}

              {ownership?.registered && !ownership.owner && (
                <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  This USB is registered to another account.
                </p>
              )}
            </>
          )}

          {scanError && (
            <p
              role="alert"
              className="mt-3 text-sm text-amber-300"
            >
              {scanError}
            </p>
          )}

          {actionMessage && (
            <p
              role={
                actionMessage.type === "error" ? "alert" : "status"
              }
              className={`mt-3 text-sm ${
                actionMessage.type === "error"
                  ? "text-red-300"
                  : "text-green-400"
              }`}
            >
              {actionMessage.text}
            </p>
          )}
        </div>

        <CardButton
          icon={Usb}
          full
          onClick={registerUSB}
          disabled={disabled}
        >
          {buttonLabel}
        </CardButton>
      </GlassCard>
    </motion.div>
  );
}