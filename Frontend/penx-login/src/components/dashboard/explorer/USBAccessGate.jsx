import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

function maskEmail(value) {
  if (typeof value !== "string") return "Hidden account";
  const at = value.lastIndexOf("@");
  if (at < 1) return "Hidden account";
  const local = value.slice(0, at);
  if (local.includes("*")) return value;
  const visible = local.length > 12 ? 6 : local.length > 6 ? 2 : 1;
  const suffix = local.length > 12 ? 4 : local.length > 6 ? 1 : 0;
  return `${local.slice(0, visible)}******${suffix ? local.slice(-suffix) : ""}${value.slice(at)}`;
}

function sameDevice(a, b) {
  return a?.SerialNumber === b?.SerialNumber && a?.DriveLetter === b?.DriveLetter;
}

// Renderer containment, NOT an Electron authorization boundary.
export default function USBAccessGate({ children }) {
  const { user, status } = useAuth();
  const token = localStorage.getItem("token");
  if (status !== "authenticated" || !user?.id || !token) {
    return <AccessMessage message="Sign in to access USB files." />;
  }
  return (
    <DeviceAccess key={`${user.id}:${token}`} user={user} token={token}>
      {children}
    </DeviceAccess>
  );
}

function AccessMessage({ message, retry }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6" role="status">
      <h2 className="text-lg font-semibold text-ink">USB Access</h2>
      <p className="mt-3 text-sm text-ink-muted">{message}</p>
      {retry && <button type="button" onClick={retry} className="mt-4 rounded-xl border border-line px-4 py-2 text-sm text-cyan">Check again</button>}
    </div>
  );
}

function DeviceAccess({ user, token, children }) {
  const [access, setAccess] = useState({ device: null, message: "Checking USB ownership…" });
  const [retry, setRetry] = useState(0);
  const alive = useRef(false);
  const allowed = useRef(null);
  const epoch = useRef(0);

  function deny(message) {
    allowed.current = null;
    epoch.current += 1;
    if (alive.current) setAccess({ device: null, message });
  }

  // Checks the backend account and the exact currently connected serial.
  async function verify(expected) {
    if (!alive.current || localStorage.getItem("token") !== token) {
      throw new Error("Session changed. Sign in again.");
    }
    if (typeof window.electron?.getUSBDevices !== "function") {
      throw new Error("Open PenX in the desktop app to access USB files.");
    }
    const devices = await window.electron.getUSBDevices();
    if (!Array.isArray(devices)) throw new Error("USB detection failed.");
    const device = expected
      ? devices.find((item) => sameDevice(item, expected))
      : devices[0];
    if (!device) throw new Error("Connect your registered USB to continue.");
    if (!device.SerialNumber || !device.DriveLetter) {
      throw new Error("USB identity is unavailable. Access blocked.");
    }
    const response = await api.post("/devices/check", {
      usb_serial: device.SerialNumber,
    }, { timeout: 10000, headers: { Authorization: `Bearer ${token}` } });
    const ownership = response.data;
    if (ownership?.registered !== true || ownership?.owner !== true) {
      if (ownership?.registered === true) {
        throw new Error(`This device is already registered to another account. Account: ${maskEmail(ownership.owner_email)}`);
      }
      throw new Error("Register this USB to your account before opening files.");
    }
    if (!alive.current || localStorage.getItem("token") !== token) {
      throw new Error("Session changed. Sign in again.");
    }
    return device;
  }

  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    let timer;
    async function check() {
      const started = epoch.current;
      try {
        const device = await verify(allowed.current);
        if (cancelled || started !== epoch.current) return;
        if (!sameDevice(device, allowed.current)) {
          allowed.current = device;
          setAccess({ device, message: "" });
        }
      } catch (error) {
        if (!cancelled) deny(error.message || "Ownership check failed. Access blocked.");
      } finally {
        if (!cancelled) timer = setTimeout(check, 3000);
      }
    }
    check();
    return () => {
      cancelled = true;
      alive.current = false;
      allowed.current = null;
      epoch.current += 1;
      clearTimeout(timer);
    };
  }, [retry]);

  const bridge = useMemo(() => new Proxy({}, {
    get(_target, method) {
      return async (...args) => {
        const expected = allowed.current;
        const started = epoch.current;
        if (!expected) throw new Error("USB access is blocked.");
        try {
          const device = await verify(expected);
          if (started !== epoch.current || !allowed.current) throw new Error("USB access changed.");
          if (method === "getUSBDevices") return [device];
          const operation = window.electron?.[method];
          if (typeof operation !== "function") throw new Error("This desktop operation is unavailable.");
          const result = await operation(...args);
          // Do not publish stale results into an account/drive that changed.
          if (!alive.current || started !== epoch.current || localStorage.getItem("token") !== token) {
            throw new Error("Session or USB changed during the operation.");
          }
          return result;
        } catch (error) {
          deny(error.message || "USB access could not be verified.");
          throw error;
        }
      };
    },
  }), [token]);

  if (!access.device) {
    return <AccessMessage message={access.message} retry={() => setRetry((value) => value + 1)} />;
  }
  return children({ device: access.device, user, bridge });
}
