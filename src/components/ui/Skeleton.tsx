import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'pill';
}

/**
 * Skeleton Elite (@Agent-UX)
 * Placeholder neomórfico animado para carregamento elegante.
 */
export const Skeleton = ({ className = '', variant = 'default' }: SkeletonProps) => {
  const radiusClass = {
    default: 'rounded-[20px]',
    circle: 'rounded-full',
    pill: 'rounded-pill',
  }[variant];

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${radiusClass} ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
      />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="w-full p-6 bg-white dark:bg-slate-900 rounded-[32px] shadow-soft-out border border-slate-50 dark:border-slate-800 mb-4">
    <div className="flex items-center gap-6">
      <Skeleton className="w-14 h-14" variant="default" />
      <div className="flex-1 space-y-3">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  </div>
);
