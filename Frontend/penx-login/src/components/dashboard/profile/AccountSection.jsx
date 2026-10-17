import {
  Clock3,
  LogIn,
  Lock,
  Cloud,
  HardDrive,
  ChevronRight,
} from "lucide-react";

export default function AccountSection() {
  const timeline = [
    {
      icon: LogIn,
      title: "Last Login",
      value: "Today • 09:14 AM",
      color: "text-cyan-400",
    },
    {
      icon: Lock,
      title: "Last Encryption",
      value: "Resume.pdf • 2 min ago",
      color: "text-emerald-400",
    },
    {
      icon: Cloud,
      title: "Last Cloud Sync",
      value: "Just now",
      color: "text-violet-400",
    },
    {
      icon: HardDrive,
      title: "USB Connected",
      value: "SanDisk Cruzer Blade",
      color: "text-orange-400",
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

              <Clock3
                size={22}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-white">
                Identity Timeline
              </h2>

              <p className="text-sm text-slate-400">
                Recent PenX account activity
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="space-y-4">

        {timeline.map((item, index) => {

          const Icon = item.icon;

          return (

            <div
              key={index}
              className="
                group
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/40
                p-4
                transition
                hover:border-cyan-500/30
                hover:bg-slate-900/70
              "
            >

              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-slate-800 p-3">

                  <Icon
                    size={20}
                    className={item.color}
                  />

                </div>

                <div>

                  <h3 className="font-medium text-white">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {item.value}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={18}
                className="
                  text-slate-500
                  transition
                  group-hover:text-cyan-400
                "
              />

            </div>

          );

        })}

      </div>

    </section>
  );
}