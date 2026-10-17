import React from "react";
import { Bell } from "lucide-react";

const NotificationBell = ({
  count = 0,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="
        relative
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-2xl
        border
        border-slate-700
        bg-slate-900/70
        text-slate-200
        transition-all
        duration-300
        hover:border-cyan-500
        hover:text-cyan-400
        hover:shadow-lg
        hover:shadow-cyan-500/20
      "
    >
      <Bell size={22} />

      {count > 0 && (
        <span
          className="
            absolute
            -right-1
            -top-1
            flex
            h-5
            min-w-[20px]
            items-center
            justify-center
            rounded-full
            bg-red-500
            px-1
            text-[11px]
            font-bold
            text-white
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;