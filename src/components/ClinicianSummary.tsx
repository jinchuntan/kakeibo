import { Stethoscope, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { RiskStatus } from '@/types';

interface ClinicianSummaryProps {
  summary: string;
  suggestedAction: string;
  riskStatus: RiskStatus;
  riskReasons: string[];
}

const statusStyles = {
  green: 'border-emerald-200 bg-emerald-50',
  yellow: 'border-amber-200 bg-amber-50',
  red: 'border-rose-200 bg-rose-50',
};

const actionStyles = {
  green: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-rose-100 text-rose-800',
};

export default function ClinicianSummary({
  summary,
  suggestedAction,
  riskStatus,
  riskReasons,
}: ClinicianSummaryProps) {
  return (
    <div className="space-y-4">
      {/* AI Summary */}
      <div className={cn('rounded-xl border p-4', statusStyles[riskStatus])}>
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="w-4 h-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-700">Clinical Summary</h4>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      </div>

      {/* Risk Reasons */}
      {riskReasons.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Risk Factors</h4>
          <ul className="space-y-1">
            {riskReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-slate-400 mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Action */}
      <div className={cn('rounded-lg p-3 flex items-start gap-2', actionStyles[riskStatus])}>
        <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Suggested Action</p>
          <p className="text-sm mt-0.5">{suggestedAction}</p>
        </div>
      </div>
    </div>
  );
}
