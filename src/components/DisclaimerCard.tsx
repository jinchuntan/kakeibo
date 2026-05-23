import { AlertTriangle } from 'lucide-react';

interface DisclaimerCardProps {
  compact?: boolean;
}

export default function DisclaimerCard({ compact = false }: DisclaimerCardProps) {
  if (compact) {
    return (
      <p className="text-xs text-slate-400 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        This tool does not provide a diagnosis. For emergencies, contact a healthcare professional.
      </p>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-800">Medical Disclaimer</p>
        <p className="text-sm text-amber-700 mt-1">
          This tool does not provide a diagnosis. For urgent symptoms or emergencies,
          contact emergency services or a healthcare professional immediately.
        </p>
      </div>
    </div>
  );
}
