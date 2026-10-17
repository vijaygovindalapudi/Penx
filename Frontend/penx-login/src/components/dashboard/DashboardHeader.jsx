import { motion } from "framer-motion";
import { Menu } from "lucide-react";

import NotificationBell from "./notifications/NotificationBell";

export default function DashboardHeader({
  user,
  name = "",
  onMenuClick,
  notificationCount = 0,
  onNotificationClick,
  onProfileClick,
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "P";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-start justify-between gap-5"
    >
      {/* ========================= */}
      {/* Left */}
      {/* ========================= */}

      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="
            mt-1
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-line
            bg-white/[0.03]
            text-ink-muted
            transition-all
            duration-200
            hover:border-cyan/40
            hover:text-cyan
            lg:hidden
          "
        >
          <Menu
            size={18}
            strokeWidth={2}
          />
        </button>

        <div>
          <h1 className="font-display text-[24px] font-semibold tracking-tight text-ink sm:text-[28px]">
            Welcome back,{" "}
            <span className="text-cyan">
              {name}
            </span>
          </h1>

          <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
            <span className="relative flex h-2.5 w-2.5">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />

            </span>

            Vault integrity verified • All systems operational
          </p>
        </div>
      </div>

      {/* ========================= */}
      {/* Right */}
      {/* ========================= */}

      <div className="flex items-center gap-3">

        <NotificationBell
          count={notificationCount}
          onClick={onNotificationClick}
        />

        {/* Profile Avatar */}

        <button
          onClick={onProfileClick}
          className="
            group
            relative
            flex
            h-12
            w-12
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border
            border-cyan-500/20
            bg-gradient-to-br
            from-cyan-500
            to-blue-600
            text-base
            font-bold
            text-white
            shadow-lg
            shadow-cyan-500/10
            transition-all
            duration-300
            hover:scale-105
            hover:shadow-cyan-500/30
          "
        >
          {initial}

          {/* Online Dot */}

          <span
            className="
              absolute
              bottom-1
              right-1
              h-3
              w-3
              rounded-full
              border-2
              border-[#08111C]
              bg-emerald-400
            "
          />

          {/* Glow */}

          <span
            className="
              absolute
              inset-0
              rounded-2xl
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
              shadow-[0_0_30px_rgba(34,211,238,.35)]
            "
          />
        </button>

      </div>
    </motion.header>
  );
}