import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Monitor,
  MapPin,
  Globe,
  Clock3,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SecurityAlertModal({
  isOpen,
  onClose,
  alert = null,
  onConfirmed,
  onRejected,
}) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const token = localStorage.getItem("access_token");

  const login = alert || {};

  const deviceName =
    login.device_name ||
    login.device ||
    login.app ||
    "Unknown device";

  const ipAddress =
    login.ip_address ||
    login.ip ||
    "Unavailable";

  const location =
    login.location ||
    login.approximate_location ||
    "Unavailable";

  const loginTime =
    login.time ||
    login.created_at ||
    login.login_time ||
    "Unavailable";

  const browser =
    login.browser ||
    login.user_agent ||
    "Unavailable";

  async function handleConfirm() {
    await submitAction("confirm");
  }

  async function handleReject() {
    await submitAction("reject");
  }

  async function submitAction(type) {
    if (!login.id && !login.session_id && !login.token) {
      setError("Security alert information is incomplete.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      setAction(type);
      setError("");

      /*
       * IMPORTANT:
       * These endpoints are intentionally kept behind the modal.
       * The backend security-alert routes will be connected when
       * the login-alert service is implemented.
       */

      const endpoint =
        type === "confirm"
          ? `${API_BASE}/security/login-alert/confirm`
          : `${API_BASE}/security/login-alert/reject`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          alert_id:
            login.id ||
            login.session_id ||
            login.token,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Security action could not be completed."
        );
      }

      if (type === "confirm") {
        onConfirmed?.(data);
      } else {
        onRejected?.(data);
      }

      onClose?.();
    } catch (err) {
      console.error("Security alert action failed:", err);

      setError(
        err.message ||
          "Security action could not be completed."
      );
    } finally {
      setLoading(false);
      setAction("");
    }
  }

  return (
    <div
      className="security-alert-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-alert-title"
    >
      <div className="security-alert-modal">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="security-alert-header">

          <div className="security-alert-title-area">

            <div className="security-alert-icon">
              <ShieldAlert size={25} />
            </div>

            <div>
              <h2 id="security-alert-title">
                New Login Detected
              </h2>

              <p>
                A new login was detected on your PenX account.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="security-alert-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <XCircle size={21} />
          </button>

        </div>

        {/* =====================================================
            WARNING
        ====================================================== */}

        <div className="security-alert-warning">
          <AlertTriangle size={18} />

          <div>
            <strong>
              Was this you?
            </strong>

            <span>
              If you do not recognize this login, reject it
              immediately.
            </span>
          </div>
        </div>

        {/* =====================================================
            LOGIN DETAILS
        ====================================================== */}

        <div className="login-details">

          <div className="login-detail-row">
            <div className="login-detail-icon">
              <Monitor size={17} />
            </div>

            <div>
              <span>Device</span>
              <strong>{deviceName}</strong>
            </div>
          </div>

          <div className="login-detail-row">
            <div className="login-detail-icon">
              <Globe size={17} />
            </div>

            <div>
              <span>IP Address</span>
              <strong>{ipAddress}</strong>
            </div>
          </div>

          <div className="login-detail-row">
            <div className="login-detail-icon">
              <MapPin size={17} />
            </div>

            <div>
              <span>Approximate Location</span>
              <strong>{location}</strong>
            </div>
          </div>

          <div className="login-detail-row">
            <div className="login-detail-icon">
              <Clock3 size={17} />
            </div>

            <div>
              <span>Time</span>
              <strong>{loginTime}</strong>
            </div>
          </div>

          <div className="login-detail-row">
            <div className="login-detail-icon">
              <Monitor size={17} />
            </div>

            <div>
              <span>App / Browser</span>
              <strong>{browser}</strong>
            </div>
          </div>

        </div>

        {/* =====================================================
            REJECT CONSEQUENCE
        ====================================================== */}

        <div className="reject-information">

          <XCircle size={17} />

          <p>
            If you choose <strong>“No, wasn't me”</strong>,
            PenX should revoke the suspicious session and
            require a password change.
          </p>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="security-alert-error">
            <AlertTriangle size={17} />

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            ACTIONS
        ====================================================== */}

        <div className="security-alert-actions">

          <button
            type="button"
            className="not-me-button"
            onClick={handleReject}
            disabled={loading}
          >
            {loading && action === "reject" ? (
              <>
                <Loader2 className="button-spinner" size={17} />
                Revoking...
              </>
            ) : (
              <>
                <XCircle size={17} />
                No, wasn't me
              </>
            )}
          </button>

          <button
            type="button"
            className="was-me-button"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && action === "confirm" ? (
              <>
                <Loader2 className="button-spinner" size={17} />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Yes, it was me
              </>
            )}
          </button>

        </div>

        <div className="security-alert-footer">
          <ShieldAlert size={14} />

          <span>
            PenX security alerts never ask for your password,
            OTP or recovery key through this window.
          </span>
        </div>

      </div>

      {/* =======================================================
          STYLES
      ======================================================== */}

      <style>{`
        .security-alert-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
        }

        .security-alert-modal {
          width: 100%;
          max-width: 540px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border-radius: 18px;
          background:
            radial-gradient(
              circle at top right,
              rgba(0, 217, 255, 0.055),
              transparent 32%
            ),
            #09131c;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 30px 100px rgba(0,0,0,0.55),
            0 0 45px rgba(0,217,255,0.035);
          color: #ffffff;
          padding: 24px;
        }

        .security-alert-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .security-alert-title-area {
          display: flex;
          gap: 13px;
          align-items: flex-start;
        }

        .security-alert-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff7777;
          background: rgba(255,70,70,0.08);
          border: 1px solid rgba(255,80,80,0.18);
        }

        .security-alert-header h2 {
          margin: 0 0 5px;
          font-size: 19px;
          font-weight: 700;
        }

        .security-alert-header p {
          margin: 0;
          color: #81929e;
          font-size: 12px;
          line-height: 1.5;
        }

        .security-alert-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
          border: 0;
          background: transparent;
          color: #71828e;
          cursor: pointer;
        }

        .security-alert-close:hover {
          color: #ffffff;
        }

        .security-alert-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px;
          margin-bottom: 16px;
          border-radius: 11px;
          color: #e6c993;
          background: rgba(255,180,60,0.055);
          border: 1px solid rgba(255,180,60,0.13);
        }

        .security-alert-warning > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .security-alert-warning strong {
          font-size: 12px;
        }

        .security-alert-warning span {
          color: #a99370;
          font-size: 11px;
          line-height: 1.5;
        }

        .login-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 14px;
          padding: 6px;
          border-radius: 13px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.065);
        }

        .login-detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.045);
        }

        .login-detail-row:last-child {
          border-bottom: 0;
        }

        .login-detail-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #00d9ff;
          background: rgba(0,217,255,0.06);
        }

        .login-detail-row > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .login-detail-row span {
          color: #697b87;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .login-detail-row strong {
          color: #dce7ec;
          font-size: 12px;
          font-weight: 500;
          word-break: break-word;
        }

        .reject-information {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          margin-bottom: 14px;
          border-radius: 10px;
          color: #b68b8b;
          background: rgba(255,60,60,0.035);
          border: 1px solid rgba(255,70,70,0.1);
        }

        .reject-information svg {
          color: #ff7373;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .reject-information p {
          margin: 0;
          font-size: 11px;
          line-height: 1.55;
        }

        .reject-information strong {
          color: #ff9999;
        }

        .security-alert-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px;
          margin-bottom: 14px;
          border-radius: 9px;
          color: #ffaaaa;
          background: rgba(255,50,50,0.07);
          border: 1px solid rgba(255,60,60,0.18);
          font-size: 11px;
        }

        .security-alert-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .security-alert-actions button {
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .security-alert-actions button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .not-me-button {
          color: #ff8585;
          background: rgba(255,60,60,0.06);
          border: 1px solid rgba(255,70,70,0.22);
        }

        .not-me-button:hover:not(:disabled) {
          color: #ffffff;
          background: rgba(255,60,60,0.12);
          border-color: rgba(255,80,80,0.42);
        }

        .was-me-button {
          color: #08131a;
          background: #00d9ff;
          border: 1px solid #00d9ff;
        }

        .was-me-button:hover:not(:disabled) {
          background: #42e4ff;
          border-color: #42e4ff;
          box-shadow: 0 0 22px rgba(0,217,255,0.15);
        }

        .security-alert-footer {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin-top: 14px;
          color: #5f727e;
          font-size: 10px;
          line-height: 1.5;
        }

        .security-alert-footer svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .button-spinner {
          animation: security-alert-spin 0.8s linear infinite;
        }

        @keyframes security-alert-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 520px) {
          .security-alert-overlay {
            padding: 10px;
          }

          .security-alert-modal {
            padding: 18px;
            border-radius: 15px;
          }

          .security-alert-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}