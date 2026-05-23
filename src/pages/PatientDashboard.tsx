import { useParams, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Pill,
  CalendarCheck,
  Activity,
  ClipboardList,
  Flame,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import LedgerTimeline from '@/components/LedgerTimeline';
import DisclaimerCard from '@/components/DisclaimerCard';
import { mockPatients, mockCheckIns } from '@/data/mockPatients';
import { cn } from '@/utils/cn';

export default function PatientDashboard() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const patient = mockPatients.find((p) => p.id === patientId);

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    );
  }

  const checkins = mockCheckIns
    .filter((c) => c.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const latestCheckIn = checkins[0];
  const streak = calculateStreak(checkins);
  const bp =
    latestCheckIn?.systolic && latestCheckIn?.diastolic
      ? `${latestCheckIn.systolic}/${latestCheckIn.diastolic}`
      : '—';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Hi {patient.name} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Your daily care ledger</p>
        </div>

        {/* Status Card */}
        <div
          className={cn(
            'rounded-2xl border p-5 mb-4',
            patient.riskStatus === 'green' && 'bg-emerald-50 border-emerald-200',
            patient.riskStatus === 'yellow' && 'bg-amber-50 border-amber-200',
            patient.riskStatus === 'red' && 'bg-rose-50 border-rose-200'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Current Status</span>
            <StatusBadge status={patient.riskStatus} size="md" />
          </div>
          <p className="text-sm text-slate-600">
            {patient.riskStatus === 'green' && "You're doing great. Keep following your care plan."}
            {patient.riskStatus === 'yellow' && 'Some items need attention. Your care team will review.'}
            {patient.riskStatus === 'red' && 'Please contact your care team or seek medical attention.'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <Activity className="w-5 h-5 text-teal-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-800">{bp}</p>
            <p className="text-xs text-slate-500">Latest BP</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-800">{streak}</p>
            <p className="text-xs text-slate-500">Day Streak</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <CalendarCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-800">{checkins.length}</p>
            <p className="text-xs text-slate-500">Entries</p>
          </div>
        </div>

        {/* Medication Reminder */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex items-center gap-3">
          <div className="bg-teal-50 rounded-lg p-2.5">
            <Pill className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">{patient.medication}</p>
            <p className="text-xs text-slate-500">
              {patient.medicationFrequency} · Reminder at {patient.reminderTime}
            </p>
          </div>
        </div>

        {/* Care Plan */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-700">Your Care Plan</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              Take {patient.medication} {patient.medicationFrequency.toLowerCase()}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              Measure blood pressure daily
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              Watch for dizziness, chest pain, severe headache, or shortness of breath
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              Follow up if readings remain high or if you have side effects
            </li>
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(`/checkin/${patient.id}`)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all active:scale-[0.98] mb-4"
        >
          <ClipboardList className="w-4 h-4" />
          Complete Today's Check-in
        </button>

        {/* Ledger Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Ledger Entries</h3>
          <LedgerTimeline checkins={checkins} />
        </div>

        <DisclaimerCard compact />
      </div>
    </div>
  );
}

function calculateStreak(checkins: { date: string; medicationTaken: boolean }[]): number {
  let streak = 0;
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  for (const c of sorted) {
    if (c.medicationTaken) streak++;
    else break;
  }
  return streak;
}
