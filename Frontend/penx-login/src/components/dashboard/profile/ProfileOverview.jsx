import {
  Laptop,
  HardDrive,
  ShieldCheck,
  Cloud,
} from "lucide-react";

export default function ProfileOverview({
  devices = [],
  usbCount = 0,
  vaultStatus = "Protected",
  cloudStatus = "Connected",
}) {
  const cards = [
    {
      title: "Trusted Devices",
      value: devices.length,
      subtitle:
        devices.length === 1
          ? "Registered Device"
          : "Registered Devices",
      icon: Laptop,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Trusted USBs",
      value: usbCount,
      subtitle:
        usbCount === 1
          ? "Registered USB"
          : "Registered USBs",
      icon: HardDrive,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Vault Status",
      value: vaultStatus,
      subtitle: "AES-256 Encryption",
      icon: ShieldCheck,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      title: "Cloud Sync",
      value: cloudStatus,
      subtitle: "PenX Cloud",
      icon: Cloud,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
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
              hover:shadow-[0_0_35px_rgba(34,211,238,.12)]
            "
          >
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex-1">

                <p className="text-sm font-medium text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-white">
                  {card.value}
                </h2>

                <p className="mt-2 text-xs tracking-wide text-slate-500">
                  {card.subtitle}
                </p>

              </div>

              <div
                className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  ${card.bg}
                `}
              >
                <Icon
                  size={26}
                  className={card.color}
                />
              </div>
            </div>

            {/* Bottom Line */}

            <div className="mt-5 h-[2px] w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
          </div>
        );
      })}
    </div>
  );
}