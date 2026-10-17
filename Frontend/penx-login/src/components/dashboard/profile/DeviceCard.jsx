import {
  Monitor,
  Smartphone,
  Laptop,
  ShieldCheck,
  Clock3,
  Cpu,
  ChevronRight,
} from "lucide-react";

export default function DeviceCard({ device }) {

  const getIcon = () => {
    switch ((device.type || "").toLowerCase()) {
      case "mobile":
      case "phone":
        return <Smartphone size={24} />;

      case "laptop":
        return <Laptop size={24} />;

      default:
        return <Monitor size={24} />;
    }
  };

  const deviceName =
    device.name ||
    device.device_name ||
    "Unknown Device";

  const deviceOS =
    device.os ||
    device.operating_system ||
    "Unknown OS";

  const deviceId =
    device.penxId ||
    device.penx_id ||
    device.id ||
    "Pending";

  const lastActive =
    device.lastActive ||
    device.last_active ||
    "Unknown";

  const trusted =
    device.trusted !== undefined
      ? device.trusted
      : true;

  const current =
    device.current ||
    device.is_current ||
    false;

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-cyan-500/10
        bg-[#0B1324]
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400/40
        hover:shadow-[0_0_40px_rgba(34,211,238,.12)]
      "
    >

      {/* Background Glow */}

      <div
        className="
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-cyan-500/5
          blur-3xl
        "
      />

      {/* Header */}

      <div className="relative flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-cyan-500/10
              text-cyan-300
            "
          >
            {getIcon()}
          </div>

          <div>

            <h3 className="text-lg font-semibold text-white">
              {deviceName}
            </h3>

            <p className="text-sm text-slate-400">
              {deviceOS}
            </p>

          </div>

        </div>

        {current && (
          <span
            className="
              rounded-full
              bg-emerald-500/15
              px-3
              py-1
              text-xs
              font-semibold
              text-emerald-300
            "
          >
            CURRENT
          </span>
        )}

      </div>

      {/* PenX Device ID */}

      <div className="mt-6">

        <p className="text-xs uppercase tracking-widest text-slate-500">
          PenX Device ID
        </p>

        <code className="mt-1 block break-all font-semibold text-cyan-300">
          {deviceId}
        </code>

      </div>

      {/* Information */}

      <div className="mt-6 grid grid-cols-2 gap-5">

        <div>

          <p className="text-xs text-slate-500">
            Trust
          </p>

          <div className="mt-2 flex items-center gap-2">

            <ShieldCheck
              size={16}
              className={
                trusted
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            />

            <span className="text-sm text-white">
              {trusted ? "Trusted" : "Untrusted"}
            </span>

          </div>

        </div>

        <div>

          <p className="text-xs text-slate-500">
            Last Active
          </p>

          <div className="mt-2 flex items-center gap-2">

            <Clock3
              size={16}
              className="text-cyan-400"
            />

            <span className="text-sm text-white">
              {lastActive}
            </span>

          </div>

        </div>

      </div>

      {/* Hover Section */}

      <div
        className="
          mt-6
          max-h-0
          overflow-hidden
          transition-all
          duration-300
          group-hover:max-h-40
        "
      >

        <div className="border-t border-slate-800 pt-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Cpu
                size={18}
                className="text-cyan-400"
              />

              <span className="text-sm text-slate-300">
                Device Passport
              </span>

            </div>

            <ChevronRight
              size={18}
              className="text-cyan-400"
            />

          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            View complete device identity,
            vault pairing, hardware security,
            encryption status and trusted activity.
          </p>

        </div>

      </div>

    </div>
  );
}