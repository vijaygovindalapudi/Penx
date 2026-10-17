import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Load notifications
  useEffect(() => {
    const saved = localStorage.getItem("penx_notifications");

    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Save notifications
  useEffect(() => {
    localStorage.setItem(
      "penx_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // Add Notification
  const addNotification = ({
    type,
    title,
    message,
  }) => {
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      unread: true,
      time: new Date().toLocaleTimeString(),
    };

    setNotifications((prev) => [
      notification,
      ...prev,
    ]);
  };

  // Mark All Read
  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        unread: false,
      }))
    );
  };

  // Clear All
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAllRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}