import { cn } from '@/utils/cn';
import type { CheckIn } from '@/types';

interface LedgerTimelineProps {
  checkins: CheckIn[];
}

const statusColors = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-rose-500',
};

const statusBg = {
  green: 'bg-emerald-50 border-emerald-200',
  yellow: 'bg-amber-50 border-amber-200',
  red: 'bg-rose-50 border-rose-200',
};

export default function LedgerTimeline({ checkins }: LedgerTimelineProps) {
  if (checkins.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No ledger entries yet. Complete your first check-in to start tracking.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {checkins.map((checkin, index) => {
        const date = new Date(checkin.date + 'T12:00:00');
        const dayLabel = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const bp =
          checkin.systolic && checkin.diastolic
            ? `${checkin.systolic}/${checkin.diastolic}`
            : null;
        const activeSymptoms = checkin.symptoms.filter((s) => s !== 'None');

        return (
          <div key={checkin.id} className="flex gap-3">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className={cn('w-3 h-3 rounded-full mt-1.5 shrink-0', statusColors[checkin.riskStatus])} />
              {index < checkins.length - 1 && (
                <div className="w-px flex-1 bg-slate-200 mt-1" />
              )}
            </div>

            {/* Entry card */}
            <div
              className={cn(
                'flex-1 rounded-lg border p-3 mb-1',
                statusBg[checkin.riskStatus]
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{dayLabel}</span>
                <span className="text-xs text-slate-500">
                  {checkin.medicationTaken ? '💊 Taken' : '⚠️ Missed'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                {bp && <span>BP: {bp}</span>}
                {checkin.glucose && <span>Glucose: {checkin.glucose}</span>}
                {activeSymptoms.length > 0 && (
                  <span>Symptoms: {activeSymptoms.join(', ')}</span>
                )}
              </div>
              {checkin.barrierNote && (
                <p className="text-xs text-slate-500 mt-1 italic">
                  "{checkin.barrierNote}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
