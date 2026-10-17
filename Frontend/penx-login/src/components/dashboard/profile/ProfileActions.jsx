import {
  Download,
  KeyRound,
  ShieldCheck,
  LogOut,
  RefreshCw,
} from "lucide-react";

export default function ProfileActions({
  vaultLocked = false,
  onLockVault,
}) {
  const handleLockVault = () => {
    if (vaultLocked) return;

    if (typeof onLockVault === "function") {
      onLockVault();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    // Return to login page
    window.location.href = "/login";
  };

  const actions = [
    {
      title: "Export Digital Identity",
      description: "Download your PenX identity information.",
      icon: Download,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      disabled: true,
    },
    {
      title: "Recovery Key",
      description: "View or export your recovery key.",
      icon: KeyRound,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      disabled: true,
    },
    {
      title: "Sync Vault",
      description: "Synchronize your encrypted vault.",
      icon: RefreshCw,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      disabled: true,
    },
    {
      title: vaultLocked ? "Vault Locked" : "Lock Vault",
      description: vaultLocked
        ? "Your secure vault is currently locked."
        : "Immediately lock your secure vault.",
      icon: ShieldCheck,
      color: vaultLocked
        ? "text-slate-400"
        : "text-emerald-400",
      bg: vaultLocked
        ? "bg-slate-500/10"
        : "bg-emerald-500/10",
      disabled: vaultLocked,
      onClick: handleLockVault,
    },
  ];

  return (
    <section
      className="
        rounded-3xl
        border
        border-cyan-500/10
        bg-[#0B1324]
        p-6
        shadow-[0_0_30px_rgba(34,211,238,.05)]
      "
    >
      {/* Header */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Quick Actions
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Frequently used PenX security actions.
        </p>
      </div>

      {/* Actions */}

      <div className="grid gap-4 md:grid-cols-2">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              disabled={action.disabled}
              onClick={action.onClick}
              className={`
                group
                flex
                items-start
                gap-4
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/40
                p-5
                text-left
                transition-all
                duration-300
                ${
                  action.disabled
                    ? "cursor-not-allowed opacity-70"
                    : "hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-slate-900/70"
                }
              `}
            >
              <div
                className={`rounded-xl p-3 ${action.bg}`}
              >
                <Icon
                  className={action.color}
                  size={22}
                />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}

      </div>

      {/* Logout */}

      <div className="mt-8 border-t border-slate-800 pt-6">

        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            py-4
            font-semibold
            text-red-400
            transition-all
            duration-300
            hover:bg-red-500/20
          "
        >
          <LogOut size={20} />
          Secure Logout
        </button>

      </div>
    </section>
  );
}