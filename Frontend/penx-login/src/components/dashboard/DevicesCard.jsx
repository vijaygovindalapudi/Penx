import { motion } from "framer-motion";
import { Monitor } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import IconBadge from "../ui/IconBadge";
import CardButton from "../ui/CardButton";

export default function DevicesCard({ count = 0, devices = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="h-full"
    >
      <GlassCard className="flex h-full flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3.5">
            <IconBadge icon={Monitor} tone="cyan" />
            <p className="text-[14.5px] font-medium text-ink">
              Registered Devices
            </p>
          </div>

          <p className="mt-4 text-[16px] font-semibold text-ink">
            {count} {count === 1 ? "Device" : "Devices"}
          </p>

          {devices.length > 0 ? (
            <div className="mt-4 space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-xl border border-white/10 p-3"
                >
                  <p className="font-medium text-white">
                    {device.usb_model}
                  </p>

                  <p className="text-sm text-gray-400">
                    {(device.usb_size / (1024 ** 3)).toFixed(1)} GB
                  </p>

                  <p className="mt-1 text-green-400 text-sm">
                    ✔ Registered
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-ink-faint">
              No registered devices found.
            </p>
          )}
        </div>

        <CardButton icon={Monitor} full>
          Manage Devices
        </CardButton>
      </GlassCard>
    </motion.div>
  );
}