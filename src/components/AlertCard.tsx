import { CheckCircle, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { cn } from '@/utils/cn';
import type { Alert } from '@/types';

interface AlertCardProps {
  alert: Alert;
  patientName: string;
  onResolve: () => void;
  onClick: () => void;
}

const bgStyles = {
  green: 'bg-emerald-50 border-emerald-200',
  yellow: 'bg-amber-50 border-amber-200',
  red: 'bg-rose-50 border-rose-200',
};

export default function AlertCard({ alert, patientName, onResolve, onClick }: AlertCardProps) {
  return (
    <div className={cn('rounded-xl border p-4 animate-fade-in-up', bgStyles[alert.riskStatus])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800">{patientName}</span>
            <StatusBadge status={alert.riskStatus} />
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">{alert.title}</p>
          <p className="text-xs text-slate-500 mt-1">{alert.suggestedAction}</p>
          <div className="flex items-center gap-1 text-xs text-teal-600 font-medium mt-2">
            View details <ChevronRight className="w-3 h-3" />
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onResolve();
          }}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Resolve
        </button>
      </div>
    </div>
  );
}
