import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  HardDrive,
  Smartphone,
  Cloud,
  RotateCcw,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import Logo from "../auth/Logo";
import NavItem from "./NavItem";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/dashboard/vault",
    icon: HardDrive,
    label: "My Vault",
  },
  {
    to: "/dashboard/devices",
    icon: Smartphone,
    label: "Devices",
  },
  {
    to: "/dashboard/backup",
    icon: Cloud,
    label: "Cloud Backup",
    disabled: true,
  },
  {
    to: "/dashboard/restore",
    icon: RotateCcw,
    label: "Restore",
  },
  {
    to: "/dashboard/activity",
    icon: Activity,
    label: "Activity",
  },
  {
    to: "/dashboard/settings",
    icon: Settings,
    label: "Settings",
  },
];

export default function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout("You have been signed out.");

    navigate("/login", {
      replace: true,
    });

    // Close the mobile drawer when present.
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="px-1.5 pb-8">
          <Logo />
        </div>

        <nav
          aria-label="Main navigation"
          className="space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            if (item.disabled) {
              const Icon = item.icon;

              return (
                <button
                  key={item.to}
                  type="button"
                  disabled
                  title="Cloud Backup is not available yet"
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium text-ink-faint opacity-60"
                >
                  <Icon
                    size={17}
                    strokeWidth={1.85}
                    className="shrink-0"
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onNavigate={onNavigate}
              />
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="group mt-6 flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-[13.5px] font-medium text-ink-muted transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-300"
      >
        <LogOut
          size={17}
          strokeWidth={1.85}
          className="shrink-0 text-ink-faint transition-colors group-hover:text-red-300"
          aria-hidden="true"
        />

        <span>Log Out</span>
      </button>
    </div>
  );
}