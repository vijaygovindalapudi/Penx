import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Trash2,
  AlertTriangle,
  Monitor,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Clock3,
  LogOut,
} from "lucide-react";

import RemoteWipeModal from "../components/dashboard/RemoteWipeModal";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

export default function SecurityPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showWipeModal, setShowWipeModal] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSecurityData();
  }, []);

  async function loadSecurityData(showRefresh = false) {
    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setMessage("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userResponse, devicesResponse] = await Promise.all([
        fetch(`${API_BASE}/users/me`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_BASE}/devices/`, {
          method: "GET",
          headers,
        }),
      ]);

      if (userResponse.status === 401 || devicesResponse.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
        return;
      }

      if (!userResponse.ok) {
        throw new Error("Unable to load account information.");
      }

      if (!devicesResponse.ok) {
        throw new Error("Unable to load registered devices.");
      }

      const userData = await userResponse.json();
      const deviceData = await devicesResponse.json();

      setUser(userData);
      setDevices(Array.isArray(deviceData) ? deviceData : []);
    } catch (err) {
      console.error("Security page error:", err);
      setError(err.message || "Unable to load security information.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function openRemoteWipe(device) {
    setError("");
    setMessage("");
    setSelectedDevice(device);
    setShowWipeModal(true);
  }

  function closeRemoteWipe() {
    setShowWipeModal(false);
    setSelectedDevice(null);
  }

  function handleWipeSuccess(result) {
    setShowWipeModal(false);

    setMessage(
      result?.message ||
        "Remote wipe request submitted successfully."
    );

    setSelectedDevice(null);

    loadSecurityData(true);
  }

  function getDeviceName(device) {
    return (
      device?.usb_model ||
      device?.model ||
      "PenX USB Device"
    );
  }

  function getDeviceSerial(device) {
    return (
      device?.usb_serial ||
      device?.serial_number ||
      "Serial unavailable"
    );
  }

  function formatSize(bytes) {
    if (!bytes || Number(bytes) <= 0) {
      return "Unknown size";
    }

    const size = Number(bytes);

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.floor(
      Math.log(size) / Math.log(1024)
    );

    return `${(size / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 1
    )} ${units[index] || "TB"}`;
  }

  return (
    <div className="security-page">
      <div className="security-page-inner">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="security-header">
          <div className="security-header-left">
            <div className="security-icon">
              <Shield size={26} />
            </div>

            <div>
              <h1>Security</h1>
              <p>
                Protect your PenX account, devices and encrypted
                vaults.
              </p>
            </div>
          </div>

          <button
            className="security-refresh-btn"
            onClick={() => loadSecurityData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =====================================================
            ALERTS
        ====================================================== */}

        {message && (
          <div className="security-alert success">
            <CheckCircle2 size={20} />

            <div>
              <strong>Security action completed</strong>
              <span>{message}</span>
            </div>

            <button
              onClick={() => setMessage("")}
              aria-label="Close"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="security-alert error">
            <AlertTriangle size={20} />

            <div>
              <strong>Security information unavailable</strong>
              <span>{error}</span>
            </div>

            <button
              onClick={() => setError("")}
              aria-label="Close"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* =====================================================
            SECURITY OVERVIEW
        ====================================================== */}

        <section className="security-section">

          <div className="section-heading">
            <div>
              <h2>Security Overview</h2>
              <p>
                Review the protection status of your PenX account.
              </p>
            </div>
          </div>

          <div className="security-overview-grid">

            <div className="security-card">
              <div className="card-icon">
                <Lock size={21} />
              </div>

              <div>
                <span className="card-label">
                  Account Password
                </span>

                <strong>Protected</strong>

                <small>
                  Your password is stored using secure hashing.
                </small>
              </div>
            </div>

            <div className="security-card">
              <div className="card-icon">
                <Shield size={21} />
              </div>

              <div>
                <span className="card-label">
                  Vault Encryption
                </span>

                <strong>AES-256-GCM</strong>

                <small>
                  PenX encrypted vault files remain protected.
                </small>
              </div>
            </div>

            <div className="security-card">
              <div className="card-icon">
                <Monitor size={21} />
              </div>

              <div>
                <span className="card-label">
                  Registered Devices
                </span>

                <strong>{devices.length}</strong>

                <small>
                  Device(s) associated with your account.
                </small>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            REMOTE SECURITY
        ====================================================== */}

        <section className="security-section">

          <div className="section-heading">
            <div>
              <h2>Remote Security</h2>

              <p>
                Control what happens to a registered PenX device
                if it is lost or compromised.
              </p>
            </div>
          </div>

          <div className="remote-security-banner">
            <div className="remote-security-icon">
              <Shield size={25} />
            </div>

            <div>
              <h3>Device-level protection</h3>

              <p>
                Remote actions affect the selected PenX device.
                Your PenX account is not automatically deleted.
              </p>
            </div>
          </div>

          {/* ===================================================
              DEVICES
          ==================================================== */}

          <div className="devices-container">

            {loading ? (
              <div className="security-loading">
                <RefreshCw size={22} className="spin" />
                <span>Loading registered devices...</span>
              </div>
            ) : devices.length === 0 ? (
              <div className="no-devices">
                <Monitor size={30} />

                <h3>No registered devices</h3>

                <p>
                  Register a PenX USB device before using remote
                  security controls.
                </p>
              </div>
            ) : (
              devices.map((device) => (
                <div
                  className="device-security-card"
                  key={device.id}
                >

                  <div className="device-main">

                    <div className="device-symbol">
                      <Monitor size={23} />
                    </div>

                    <div className="device-details">
                      <h3>
                        {getDeviceName(device)}
                      </h3>

                      <div className="device-meta">
                        <span>
                          ID: {device.id || "Unknown"}
                        </span>

                        <span>
                          Serial: {getDeviceSerial(device)}
                        </span>

                        {device.usb_size && (
                          <span>
                            Size: {formatSize(device.usb_size)}
                          </span>
                        )}
                      </div>

                      <div className="device-status">
                        <span className="status-dot" />
                        Registered
                      </div>
                    </div>

                  </div>

                  {/* ===========================================
                      DEVICE ACTIONS
                  ============================================ */}

                  <div className="device-actions">

                    <button
                      className="remote-lock-btn"
                      type="button"
                      onClick={() => {
                        setMessage(
                          "Remote Lock UI will be connected next."
                        );
                      }}
                    >
                      <Lock size={16} />
                      Remote Lock
                    </button>

                    <button
                      className="remote-wipe-btn"
                      type="button"
                      onClick={() => openRemoteWipe(device)}
                    >
                      <Trash2 size={16} />
                      Remote Wipe
                    </button>

                  </div>
                </div>
              ))
            )}

          </div>
        </section>

        {/* =====================================================
            WIPE INFORMATION
        ====================================================== */}

        <section className="security-section">

          <div className="wipe-information">

            <div className="wipe-info-icon">
              <AlertTriangle size={23} />
            </div>

            <div>
              <h3>About Remote Wipe</h3>

              <p>
                Remote Wipe creates a secure wipe request for a
                selected registered device. If the device is
                offline, the request remains pending until the
                device securely reconnects.
              </p>

              <p>
                The wipe request targets local PenX vault data,
                metadata, local key material, security logs and
                device identity. Your PenX account is not deleted
                automatically.
              </p>

              <div className="wipe-warning">
                <Clock3 size={17} />

                <span>
                  A pending wipe should be cancelled before device
                  execution if you recover the device and no longer
                  want the wipe to occur.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            SECURITY PRINCIPLES
        ====================================================== */}

        <section className="security-section">

          <div className="section-heading">
            <div>
              <h2>Security Principles</h2>
              <p>
                Important protections built into the PenX security
                workflow.
              </p>
            </div>
          </div>

          <div className="security-principles">

            <div>
              <CheckCircle2 size={18} />
              <span>
                Remote actions require an authenticated account.
              </span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>
                Device ownership is verified before security
                commands are created.
              </span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>
                Remote Wipe requires your full name and account
                password.
              </span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>
                Wipe requests can remain pending while a device is
                offline.
              </span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>
                Account deletion is separate from device wiping.
              </span>
            </div>

          </div>
        </section>

      </div>

      {/* =======================================================
          REMOTE WIPE MODAL
      ======================================================== */}

      <RemoteWipeModal
        isOpen={showWipeModal}
        onClose={closeRemoteWipe}
        device={selectedDevice}
        user={user}
        onSuccess={handleWipeSuccess}
      />

      {/* =======================================================
          PAGE STYLES
      ======================================================== */}

      <style>{`
        .security-page {
          min-height: 100%;
          width: 100%;
          background:
            radial-gradient(
              circle at top right,
              rgba(0, 210, 255, 0.055),
              transparent 30%
            ),
            #071018;
          color: #ffffff;
          padding: 32px;
          box-sizing: border-box;
        }

        .security-page-inner {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
        }

        .security-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .security-header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .security-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00d9ff;
          background: rgba(0, 217, 255, 0.08);
          border: 1px solid rgba(0, 217, 255, 0.2);
          box-shadow: 0 0 25px rgba(0, 217, 255, 0.08);
        }

        .security-header h1 {
          margin: 0 0 5px;
          font-size: 28px;
          font-weight: 700;
        }

        .security-header p {
          margin: 0;
          color: #8395a3;
          font-size: 14px;
        }

        .security-refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.035);
          color: #d8e4eb;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .security-refresh-btn:hover {
          border-color: rgba(0,217,255,0.35);
          color: #00d9ff;
          background: rgba(0,217,255,0.06);
        }

        .security-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .security-section {
          margin-bottom: 28px;
        }

        .section-heading {
          margin-bottom: 15px;
        }

        .section-heading h2 {
          margin: 0 0 5px;
          font-size: 19px;
        }

        .section-heading p {
          margin: 0;
          color: #7f919e;
          font-size: 13px;
        }

        .security-overview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .security-card {
          display: flex;
          gap: 13px;
          padding: 18px;
          border-radius: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .card-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00d9ff;
          background: rgba(0,217,255,0.07);
        }

        .security-card > div:last-child {
          display: flex;
          flex-direction: column;
        }

        .card-label {
          color: #80919e;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .security-card strong {
          font-size: 15px;
          margin-bottom: 5px;
        }

        .security-card small {
          color: #71818d;
          font-size: 11px;
          line-height: 1.4;
        }

        .remote-security-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border-radius: 14px;
          margin-bottom: 15px;
          background: rgba(0,217,255,0.035);
          border: 1px solid rgba(0,217,255,0.12);
        }

        .remote-security-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 11px;
          color: #00d9ff;
          background: rgba(0,217,255,0.08);
        }

        .remote-security-banner h3 {
          margin: 0 0 4px;
          font-size: 15px;
        }

        .remote-security-banner p {
          margin: 0;
          color: #8496a3;
          font-size: 12px;
        }

        .devices-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .device-security-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px;
          border-radius: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s ease;
        }

        .device-security-card:hover {
          border-color: rgba(0,217,255,0.18);
        }

        .device-main {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .device-symbol {
          width: 45px;
          height: 45px;
          border-radius: 11px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00d9ff;
          background: rgba(0,217,255,0.07);
        }

        .device-details {
          min-width: 0;
        }

        .device-details h3 {
          margin: 0 0 7px;
          font-size: 15px;
        }

        .device-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          color: #667985;
          font-size: 11px;
        }

        .device-status {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          color: #82939e;
          font-size: 11px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00d9ff;
          box-shadow: 0 0 8px rgba(0,217,255,0.65);
        }

        .device-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .remote-lock-btn,
        .remote-wipe-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .remote-lock-btn {
          color: #c9d6de;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .remote-lock-btn:hover {
          color: #00d9ff;
          border-color: rgba(0,217,255,0.3);
        }

        .remote-wipe-btn {
          color: #ff7070;
          background: rgba(255,70,70,0.055);
          border: 1px solid rgba(255,70,70,0.2);
        }

        .remote-wipe-btn:hover {
          color: #ffffff;
          background: rgba(255,60,60,0.12);
          border-color: rgba(255,80,80,0.45);
        }

        .security-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          margin-bottom: 20px;
          border-radius: 11px;
          border: 1px solid;
        }

        .security-alert.success {
          color: #bcefff;
          background: rgba(0,217,255,0.045);
          border-color: rgba(0,217,255,0.2);
        }

        .security-alert.error {
          color: #ffb8b8;
          background: rgba(255,60,60,0.045);
          border-color: rgba(255,60,60,0.2);
        }

        .security-alert > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .security-alert strong {
          font-size: 12px;
        }

        .security-alert span {
          font-size: 11px;
          opacity: 0.8;
        }

        .security-alert button {
          background: transparent;
          border: 0;
          color: inherit;
          cursor: pointer;
        }

        .wipe-information {
          display: flex;
          gap: 15px;
          padding: 20px;
          border-radius: 14px;
          background: rgba(255,60,60,0.035);
          border: 1px solid rgba(255,80,80,0.13);
        }

        .wipe-info-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff7777;
          background: rgba(255,70,70,0.07);
        }

        .wipe-information h3 {
          margin: 0 0 8px;
          font-size: 15px;
        }

        .wipe-information p {
          margin: 0 0 8px;
          color: #8999a4;
          font-size: 12px;
          line-height: 1.6;
        }

        .wipe-warning {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 12px;
          color: #c28f8f;
          font-size: 11px;
          line-height: 1.5;
        }

        .security-principles {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .security-principles > div {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          color: #8798a4;
          font-size: 12px;
          line-height: 1.5;
          border: 1px solid rgba(255,255,255,0.055);
        }

        .security-principles svg {
          color: #00d9ff;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .security-loading,
        .no-devices {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #70818d;
          border-radius: 14px;
          border: 1px dashed rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.015);
        }

        .no-devices h3 {
          margin: 3px 0 0;
          color: #d7e2e8;
          font-size: 14px;
        }

        .no-devices p {
          margin: 0;
          font-size: 11px;
          color: #697a86;
        }

        .spin {
          animation: security-spin 1s linear infinite;
        }

        @keyframes security-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .security-overview-grid {
            grid-template-columns: 1fr;
          }

          .device-security-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .device-actions {
            width: 100%;
          }

          .device-actions button {
            flex: 1;
            justify-content: center;
          }

          .security-principles {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .security-page {
            padding: 18px;
          }

          .security-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .security-refresh-btn {
            width: 100%;
            justify-content: center;
          }

          .device-actions {
            flex-direction: column;
          }

          .device-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}