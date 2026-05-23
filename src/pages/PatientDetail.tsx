import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserRound,
  Pill,
  HeartPulse,
  CalendarCheck,
  Phone,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import LedgerTimeline from '@/components/LedgerTimeline';
import ClinicianSummary from '@/components/ClinicianSummary';
import DisclaimerCard from '@/components/DisclaimerCard';
import { mockPatients, mockCheckIns } from '@/data/mockPatients';
import { generateClinicianSummary, generateSuggestedAction } from '@/services/aiSummary';

export default function PatientDetail() {
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
  const summary = generateClinicianSummary(patient, checkins);
  const suggestedAction = generateSuggestedAction(patient, checkins);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/clinician')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        {/* Patient Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <UserRound className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{patient.name}</h1>
                <p className="text-sm text-slate-500">
                  {patient.age} years old · {patient.condition}
                </p>
              </div>
            </div>
            <StatusBadge status={patient.riskStatus} size="md" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Pill className="w-4 h-4 text-slate-400" />
              <div>
                <p className="font-medium">{patient.medication}</p>
                <p className="text-xs text-slate-400">{patient.medicationFrequency}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CalendarCheck className="w-4 h-4 text-slate-400" />
              <div>
                <p className="font-medium">Reminder</p>
                <p className="text-xs text-slate-400">{patient.reminderTime}</p>
              </div>
            </div>
            {patient.caregiverName && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="font-medium">Emergency Contact</p>
                  <p className="text-xs text-slate-400">{patient.caregiverName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Latest Check-in Summary */}
        {latestCheckIn && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-semibold text-slate-700">Latest Check-in</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {new Date(latestCheckIn.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-slate-800">
                  {latestCheckIn.systolic && latestCheckIn.diastolic
                    ? `${latestCheckIn.systolic}/${latestCheckIn.diastolic}`
                    : '—'}
                </p>
                <p className="text-xs text-slate-500">Blood Pressure</p>
              </div>
              {latestCheckIn.glucose && (
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{latestCheckIn.glucose}</p>
                  <p className="text-xs text-slate-500">Glucose (mg/dL)</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-slate-800">
                  {latestCheckIn.medicationTaken ? '✓' : '✗'}
                </p>
                <p className="text-xs text-slate-500">Medication</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-slate-800">
                  {latestCheckIn.symptoms.filter((s) => s !== 'None').length}
                </p>
                <p className="text-xs text-slate-500">Symptoms</p>
              </div>
            </div>

            {latestCheckIn.symptoms.filter((s) => s !== 'None').length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Reported Symptoms
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {latestCheckIn.symptoms
                    .filter((s) => s !== 'None')
                    .map((symptom) => (
                      <span
                        key={symptom}
                        className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-medium"
                      >
                        {symptom}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {latestCheckIn.barrierNote && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Patient Note
                </p>
                <p className="text-sm text-slate-600 italic bg-slate-50 rounded-lg p-3">
                  "{latestCheckIn.barrierNote}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Clinical Assessment</h2>
          <ClinicianSummary
            summary={summary}
            suggestedAction={suggestedAction}
            riskStatus={patient.riskStatus}
            riskReasons={latestCheckIn?.riskReasons || []}
          />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Ledger History</h2>
          <LedgerTimeline checkins={checkins} />
        </div>

        <DisclaimerCard />
      </div>
    </div>
  );
}
