import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const {
    status,
    error,
    refreshSession,
    logout,
  } = useAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-5 text-ink">
        <div
          role="status"
          className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center"
        >
          <div
            aria-hidden="true"
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-line border-t-cyan"
          />

          <h1 className="mt-4 text-lg font-semibold">
            Checking your session
          </h1>

          <p className="mt-2 text-sm text-ink-muted">
            Connecting to your PenX account…
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-5 text-ink">
        <div
          role="alert"
          className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center"
        >
          <h1 className="text-lg font-semibold">
            Unable to verify session
          </h1>

          <p className="mt-3 text-sm leading-6 text-ink-muted">
            {error}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => refreshSession()}
              className="rounded-xl bg-cyan px-5 py-2.5 text-sm font-semibold text-slate-950"
            >
              Retry
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="rounded-xl border border-line px-5 py-2.5 text-sm text-ink-muted"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return children ?? <Outlet />;
}