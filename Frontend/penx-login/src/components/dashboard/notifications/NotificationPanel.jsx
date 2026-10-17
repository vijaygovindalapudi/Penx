import React from "react";
import { X } from "lucide-react";

import NotificationItem from "./NotificationItem";
import { useNotification } from "../../../context/NotificationContext";

const NotificationPanel = ({
  open,
  onClose,
}) => {
  const {
    notifications,
    markAllRead,
    clearNotifications,
  } = useNotification();

  return (
    <div
      className={`
        fixed
        top-0
        right-0
        z-[9999]
        h-screen
        w-[400px]
        border-l
        border-slate-800
        bg-[#0B1120]
        shadow-2xl
        transition-transform
        duration-300
        ${open ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="border-b border-slate-800 p-5">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-white">
              Notifications
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Recent PenX activities
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>

        </div>

        <div className="mt-4 flex gap-2">

          <button
            onClick={markAllRead}
            className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-cyan-400 transition hover:bg-slate-700"
          >
            Mark All Read
          </button>

          <button
            onClick={clearNotifications}
            className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-red-400 transition hover:bg-slate-700"
          >
            Clear All
          </button>

        </div>

      </div>

      {/* Notifications */}

      <div className="space-y-3 overflow-y-auto p-4">

        {notifications.length === 0 ? (

          <div className="flex h-[70vh] items-center justify-center">

            <div className="text-center">

              <div className="text-5xl">🔔</div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                No Notifications
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Your recent PenX activities will appear here.
              </p>

            </div>

          </div>

        ) : (

          notifications.map((notification) => (

            <NotificationItem
              key={notification.id}
              notification={notification}
            />

          ))

        )}

      </div>

    </div>
  );
};

export default NotificationPanel;