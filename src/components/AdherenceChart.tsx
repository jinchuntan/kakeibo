import { Pill } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { CheckIn } from '@/types';

interface AdherenceChartProps {
  checkins: CheckIn[];
}

export default function AdherenceChart({ checkins }: AdherenceChartProps) {
  const last7 = [...checkins].slice(0, 7).reverse();

  if (last7.length === 0) return null;

  const takenCount = last7.filter((c) => c.medicationTaken).length;
  const percentage = Math.round((takenCount / last7.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-semibold text-slate-700">Medication Adherence</h3>
        </div>
        <span className={cn(
          'text-sm font-bold',
          percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
        )}>
          {percentage}%
        </span>
      </div>
      <div className="flex gap-1.5">
        {last7.map((c, i) => {
          const date = new Date(c.date + 'T12:00:00');
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div key={i} className="flex-1 text-center">
              <div
                className={cn(
                  'h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all',
                  c.medicationTaken
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                )}
              >
                {c.medicationTaken ? '✓' : '✗'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{dayLabel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
