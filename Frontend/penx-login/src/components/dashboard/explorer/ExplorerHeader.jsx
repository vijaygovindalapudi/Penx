import React from "react";
import {
  HardDrive,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

// ======================================================
// PenX Explorer Header
// ======================================================

const ExplorerHeader = ({
  usbName = "No USB Connected",
  driveLetter = "--",
  capacity = "--",
  connected = false,
  onRefresh,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-lg">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">

            <HardDrive
              size={30}
              className="text-cyan-400"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              PenX Explorer
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Browse and manage your USB storage securely.
            </p>

          </div>

        </div>

        {/* Right */}

        <button
          onClick={onRefresh}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-cyan-600
            px-5
            py-3
            text-white
            transition
            hover:bg-cyan-700
          "
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* USB Information */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        {/* USB Name */}

        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            USB Device
          </p>

          <p className="mt-2 font-semibold text-white break-all">
            {usbName}
          </p>

        </div>

        {/* Drive */}

        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Drive Letter
          </p>

          <p className="mt-2 text-xl font-bold text-cyan-400">
            {driveLetter}
          </p>

        </div>

        {/* Status */}

        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Status
          </p>

          <div className="mt-2 flex items-center gap-2">

            {connected ? (
              <>
                <Wifi
                  size={18}
                  className="text-green-400"
                />

                <span className="font-medium text-green-400">
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff
                  size={18}
                  className="text-red-400"
                />

                <span className="font-medium text-red-400">
                  Disconnected
                </span>
              </>
            )}

          </div>

        </div>

      </div>

      {/* Capacity */}

      <div className="mt-6 rounded-xl border border-slate-700 bg-[#0F172A] p-4">

        <div className="flex items-center justify-between">

          <span className="text-sm text-slate-400">
            USB Capacity
          </span>

          <span className="font-semibold text-white">
            {capacity}
          </span>

        </div>

      </div>

    </div>
  );
};

export default ExplorerHeader;