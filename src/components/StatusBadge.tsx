import { cn } from '@/utils/cn';
import type { RiskStatus } from '@/types';

const config: Record<RiskStatus, { label: string; className: string }> = {
  green: {
    label: 'Stable',
    className: 'bg-emerald-100 text-emerald-700',
  },
  yellow: {
    label: 'Attention',
    className: 'bg-amber-100 text-amber-700',
  },
  red: {
    label: 'Urgent',
    className: 'bg-rose-100 text-rose-700',
  },
};

interface StatusBadgeProps {
  status: RiskStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const { label, className: statusClass } = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        statusClass,
        className
      )}
    >
      <span
        className={cn(
          'rounded-full mr-1.5',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          status === 'green' && 'bg-emerald-500',
          status === 'yellow' && 'bg-amber-500',
          status === 'red' && 'bg-rose-500'
        )}
      />
      {label}
    </span>
  );
}
