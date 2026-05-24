import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import CheckInForm from '@/components/CheckInForm';
import DisclaimerCard from '@/components/DisclaimerCard';
import StatusBadge from '@/components/StatusBadge';
import { usePatient, useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import type { CheckIn } from '@/types';

const resultConfig = {
  green: {
    icon: CheckCircle2,
    title: "You're on track today.",
    description: 'Keep up the great work. Your care team can see your progress.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
  },
  yellow: {
    icon: AlertTriangle,
    title: 'Some things need attention.',
    description: 'Your care team has been notified and will review your entry.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
  },
  red: {
    icon: XCircle,
    title: 'Please seek medical help or contact your care team.',
    description: 'Based on your responses, we recommend reaching out to a healthcare professional as soon as possible.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    iconBg: 'bg-rose-100',
  },
};

export default function DailyCheckIn() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [result, setResult] = useState<CheckIn | null>(null);

  const patient = usePatient(patientId);

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    );
  }

  const showGlucose = patient.condition === 'Diabetes';

  const handleSubmit = (checkin: CheckIn) => {
    dispatch({ type: 'ADD_CHECKIN', payload: checkin });
    setResult(checkin);
  };

  if (result) {
    const config = resultConfig[result.riskStatus];
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8">
          <div className={cn('rounded-2xl border p-6 text-center animate-scale-in', config.bg)}>
            <div className={cn('mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4', config.iconBg)}>
              <Icon className={cn('w-7 h-7', config.color)} />
            </div>
            <StatusBadge status={result.riskStatus} size="md" className="mb-3" />
            <h2 className="text-xl font-bold text-slate-800 mt-2">{config.title}</h2>
            <p className="text-sm text-slate-600 mt-2">{config.description}</p>

            {result.riskReasons.length > 0 && (
              <div className="mt-4 text-left bg-white/60 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Details</p>
                <ul className="space-y-1">
                  {result.riskReasons.map((reason, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate(`/dashboard/${patient.id}`)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all"
            >
              View My Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/clinician')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              View Clinician Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6">
            <DisclaimerCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
            <ClipboardList className="w-6 h-6 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Care Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hi {patient.name} — take a moment to log your care today.
          </p>
          <p className="text-xs text-teal-600 mt-2 font-medium">
            Small daily check-ins help your care team see the full picture.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <CheckInForm
            patientId={patient.id}
            onSubmit={handleSubmit}
            showGlucose={showGlucose}
          />
        </div>

        <div className="mt-6">
          <DisclaimerCard compact />
        </div>
      </div>
    </div>
  );
}
