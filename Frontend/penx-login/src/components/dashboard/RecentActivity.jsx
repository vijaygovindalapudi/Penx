import { motion } from 'framer-motion';
import { UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const ACTIVITY = [
  { icon: UserPlus, title: 'Account Created', time: 'Just now' },
  { icon: LogIn, title: 'Login Successful', time: 'Just now' },
  { icon: ShieldCheck, title: 'Vault Initialized', time: 'Just now' },
];

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
    >
      <GlassCard className="p-6">
        <h2 className="text-[15px] font-semibold text-ink">Recent Activity</h2>

        <div className="mt-5 space-y-0">
          {ACTIVITY.map((item, i) => (
            <div key={item.title} className="relative flex gap-3.5 pb-6 last:pb-0">
              {i !== ACTIVITY.length - 1 && (
                <span className="absolute left-[15px] top-8 h-full w-px bg-line" />
              )}
              <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan/25 bg-cyan/[0.08]">
                <item.icon size={14.5} strokeWidth={1.9} className="text-cyan" />
              </div>
              <div className="pt-1">
                <p className="text-[13.5px] font-medium text-ink">{item.title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-faint">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
