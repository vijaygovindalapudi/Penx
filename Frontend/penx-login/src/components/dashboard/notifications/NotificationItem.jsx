import React from "react";
import {
  Lock,
  Unlock,
  Upload,
  Trash2,
  FolderPlus,
  Pencil,
} from "lucide-react";

const icons = {
  encrypt: <Lock size={18} className="text-cyan-400" />,
  decrypt: <Unlock size={18} className="text-green-400" />,
  upload: <Upload size={18} className="text-blue-400" />,
  delete: <Trash2 size={18} className="text-red-400" />,
  folder: <FolderPlus size={18} className="text-yellow-400" />,
  rename: <Pencil size={18} className="text-purple-400" />,
};

const NotificationItem = ({ notification }) => {
  return (
    <div
      className={`
        relative
        flex
        items-start
        gap-4
        rounded-xl
        border
        border-slate-700
        bg-slate-900/80
        p-4
        transition-all
        duration-300
        hover:border-cyan-500
        hover:bg-slate-800
      `}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
        {icons[notification.type]}
      </div>

      <div className="flex-1">
        <h4 className="font-semibold text-white">
          {notification.title}
        </h4>

        <p className="mt-1 text-sm text-slate-400">
          {notification.message}
        </p>

        <span className="mt-2 block text-xs text-slate-500">
          {notification.time}
        </span>
      </div>

      {notification.unread && (
        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400"></div>
      )}
    </div>
  );
};

export default NotificationItem;