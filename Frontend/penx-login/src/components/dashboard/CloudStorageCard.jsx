import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import IconBadge from '../ui/IconBadge';
import CardButton from '../ui/CardButton';
import ProgressBar from '../ui/ProgressBar';

export default function CloudStorageCard({ usedMb = 0, totalGb = 10 }) {
  const totalMb = totalGb * 1024;
  const percent = (usedMb / totalMb) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="h-full"
    >
      <GlassCard className="flex h-full flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3.5">
            <IconBadge icon={Cloud} tone="cyan" />
            <p className="text-[14.5px] font-medium text-ink">Storage Used</p>
          </div>

          <p className="mt-4 text-[16px] font-semibold text-ink">
            {usedMb} MB <span className="text-ink-faint">/ {totalGb} GB</span>
          </p>

          <div className="mt-3">
            <ProgressBar value={percent} />
          </div>
        </div>

        <div className="mt-4">
          <CardButton icon={Cloud} full>
            Open Cloud
          </CardButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}
