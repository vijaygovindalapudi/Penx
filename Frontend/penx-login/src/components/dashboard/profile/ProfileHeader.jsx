import { ShieldCheck, BadgeCheck, Copy } from "lucide-react";

export default function ProfileHeader({
  user,
  securityScore = 98,
}) {
  const penxId =
    user?.penxId || "PX-USER-91A2F8";

  const copyPenxId = async () => {
    try {
      await navigator.clipboard.writeText(penxId);
      alert("PenX ID copied");
    } catch {
      alert("Unable to copy PenX ID");
    }
  };

  const initial =
    user?.full_name?.charAt(0)?.toUpperCase() || "P";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#08121F] via-[#0A1424] to-[#08111C] p-8">

      {/* Glow */}
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div className="flex items-center gap-6">

          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500 to-blue-600 text-5xl font-bold text-white shadow-[0_0_50px_rgba(34,211,238,.25)]">
            {initial}
          </div>

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold text-white">
                {user?.full_name}
              </h1>

              <BadgeCheck
                className="text-cyan-400"
                size={24}
              />

            </div>

            <p className="mt-2 text-slate-400">
              {user?.email}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-sm text-cyan-300">
                Premium User
              </span>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-300">
                Verified
              </span>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6 backdrop-blur">

          <p className="text-xs uppercase tracking-widest text-slate-500">
            PenX Digital Identity
          </p>

          <div className="mt-4 flex items-center gap-3">

            <code className="text-lg font-semibold text-cyan-300">
              {penxId}
            </code>

            <button
              onClick={copyPenxId}
              className="rounded-lg p-2 transition hover:bg-slate-800"
            >
              <Copy
                size={18}
                className="text-cyan-300"
              />
            </button>

          </div>

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Security Score
              </span>

              <span className="font-bold text-cyan-300">
                {securityScore}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{
                  width: `${securityScore}%`,
                }}
              />

            </div>

            <div className="mt-4 flex items-center gap-2">

              <ShieldCheck
                className="text-emerald-400"
                size={18}
              />

              <span className="text-sm text-emerald-400">
                Vault Fully Protected
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}