import {
  Shield,
  Laptop,
  Smartphone,
  Monitor,
  Plus,
} from "lucide-react";

import DeviceCard from "./DeviceCard";

export default function DevicesSection({
  devices = [],
}) {
  const computerCount = devices.filter(
    (device) =>
      device.type?.toLowerCase() === "laptop" ||
      device.type?.toLowerCase() === "desktop"
  ).length;

  const mobileCount = devices.filter(
    (device) =>
      device.type?.toLowerCase() === "mobile" ||
      device.type?.toLowerCase() === "phone"
  ).length;

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

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-cyan-500/10 p-3">

            <Shield
              className="text-cyan-400"
              size={22}
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-white">
              Trusted Devices
            </h2>

            <p className="text-sm text-slate-400">
              Registered devices linked to your PenX Identity
            </p>

          </div>

        </div>

        <button
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            px-4
            py-2
            text-sm
            font-medium
            text-cyan-300
            transition-all
            duration-300
            hover:bg-cyan-500/20
            hover:scale-105
          "
        >
          <Plus size={16} />

          Register Device

        </button>

      </div>

      {/* Summary */}

      <div className="mb-6 grid grid-cols-3 gap-3">

        <div className="rounded-2xl bg-slate-900/40 p-4 text-center">

          <Laptop
            className="mx-auto mb-2 text-cyan-400"
            size={22}
          />

          <h3 className="text-lg font-bold text-white">
            {computerCount}
          </h3>

          <p className="text-xs text-slate-400">
            Computers
          </p>

        </div>

        <div className="rounded-2xl bg-slate-900/40 p-4 text-center">

          <Smartphone
            className="mx-auto mb-2 text-cyan-400"
            size={22}
          />

          <h3 className="text-lg font-bold text-white">
            {mobileCount}
          </h3>

          <p className="text-xs text-slate-400">
            Mobile
          </p>

        </div>

        <div className="rounded-2xl bg-slate-900/40 p-4 text-center">

          <Monitor
            className="mx-auto mb-2 text-cyan-400"
            size={22}
          />

          <h3 className="text-lg font-bold text-white">
            {devices.length}
          </h3>

          <p className="text-xs text-slate-400">
            Total Trusted
          </p>

        </div>

      </div>

      {/* Device Cards */}

      <div className="space-y-5">

        {devices.length === 0 ? (

          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-700
              bg-slate-900/20
              py-10
              text-center
            "
          >

            <Shield
              size={40}
              className="mx-auto mb-4 text-slate-600"
            />

            <h3 className="text-lg font-semibold text-white">
              No Registered Devices
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Register your first trusted device to start
              securing your PenX identity.
            </p>

          </div>

        ) : (

          devices.map((device) => (

            <DeviceCard
              key={device.penxId || device.id}
              device={device}
            />

          ))

        )}

      </div>

    </section>
  );
}