import {
  HardDrive,
  ShieldCheck,
  Link2,
  CheckCircle2,
  Plus,
  ChevronRight,
} from "lucide-react";

export default function USBSection() {
  const usbList = [
    {
      id: "PX-USB-91AF-72KC",
      name: "SanDisk Cruzer Blade",
      capacity: "28.7 GB",
      encryption: "AES-256",
      status: "Connected",
      vault: "Linked",
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

      <div className="mb-6 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-cyan-500/10 p-3">
              <HardDrive
                className="text-cyan-400"
                size={22}
              />
            </div>

            <div>

              <h2 className="text-xl font-bold text-white">
                Trusted USB Registry
              </h2>

              <p className="text-sm text-slate-400">
                USB devices paired with your PenX Vault
              </p>

            </div>

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
            transition
            hover:bg-cyan-500/20
          "
        >
          <Plus size={16} />

          Register USB

        </button>

      </div>

      {/* USB Cards */}

      <div className="space-y-5">

        {usbList.map((usb) => (

          <div
            key={usb.id}
            className="
              group
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/40
              p-5
              transition
              hover:border-cyan-500/30
              hover:bg-slate-900/70
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <h3 className="text-lg font-semibold text-white">
                  {usb.name}
                </h3>

                <p className="mt-1 text-sm text-cyan-300">
                  {usb.id}
                </p>

              </div>

              <ChevronRight
                className="
                  text-slate-500
                  transition
                  group-hover:text-cyan-400
                "
                size={20}
              />

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <div>

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Capacity
                </p>

                <p className="mt-1 text-white">
                  {usb.capacity}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Encryption
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <ShieldCheck
                    size={16}
                    className="text-emerald-400"
                  />

                  <span className="text-white">
                    {usb.encryption}
                  </span>

                </div>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <CheckCircle2
                    size={16}
                    className="text-emerald-400"
                  />

                  <span className="text-emerald-400">
                    {usb.status}
                  </span>

                </div>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Vault Pairing
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <Link2
                    size={16}
                    className="text-cyan-400"
                  />

                  <span className="text-white">
                    {usb.vault}
                  </span>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}