import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");

  const requestRef = useRef(null);
  const versionRef = useRef(0);

  const logout = useCallback((message = "") => {
    versionRef.current += 1;

    requestRef.current?.abort();
    requestRef.current = null;

    localStorage.removeItem("token");

    setUser(null);
    setError("");
    setSessionMessage(
      typeof message === "string" ? message : ""
    );
    setStatus("unauthenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    requestRef.current?.abort();
    requestRef.current = null;

    const version = ++versionRef.current;
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setError("");
      setStatus("unauthenticated");
      return false;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    setStatus("checking");
    setError("");

    try {
      const response = await api.get("/auth/me", {
        signal: controller.signal,
        timeout: 15000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        controller.signal.aborted ||
        version !== versionRef.current
      ) {
        return false;
      }

      if (!response.data?.id) {
        throw new Error("Invalid account response.");
      }

      if (response.data.is_active === false) {
        logout("Your account is inactive.");
        return false;
      }

      setUser(response.data);
      setSessionMessage("");
      setStatus("authenticated");

      return true;
    } catch (requestError) {
      if (
        controller.signal.aborted ||
        version !== versionRef.current
      ) {
        return false;
      }

      if (requestError.response?.status === 401) {
        logout(
          "Your session has expired. Please sign in again."
        );
        return false;
      }

      setUser(null);

      setError(
        requestError.code === "ECONNABORTED" ||
          requestError.code === "ETIMEDOUT"
          ? "The server took too long to respond. Please retry."
          : "Unable to verify your session. Check the backend and retry."
      );

      setStatus("error");
      return false;
    } finally {
      if (version === versionRef.current) {
        requestRef.current = null;
      }
    }
  }, [logout]);

  const login = useCallback(
    async (accessToken) => {
      if (
        typeof accessToken !== "string" ||
        !accessToken.trim()
      ) {
        throw new Error("A valid access token is required.");
      }

      localStorage.setItem("token", accessToken);
      setSessionMessage("");

      return refreshSession();
    },
    [refreshSession]
  );

  // Verify an existing session when the app starts.
  useEffect(() => {
    refreshSession();

    return () => {
      versionRef.current += 1;
      requestRef.current?.abort();
    };
  }, [refreshSession]);

  // Sync login/logout with other windows on the same origin.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.storageArea !== localStorage) return;

      if (event.key !== "token" && event.key !== null) {
        return;
      }

      if (localStorage.getItem("token")) {
        refreshSession();
      } else {
        logout();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [logout, refreshSession]);

  const clearSessionMessage = useCallback(() => {
    setSessionMessage("");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      sessionMessage,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      refreshSession,
      clearSessionMessage,
    }),
    [
      user,
      status,
      error,
      sessionMessage,
      login,
      logout,
      refreshSession,
      clearSessionMessage,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}