import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserRound,
  Pill,
  HeartPulse,
  CalendarCheck,
  Phone,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import LedgerTimeline from '@/components/LedgerTimeline';
import ClinicianSummary from '@/components/ClinicianSummary';
import BPTrendChart from '@/components/BPTrendChart';
import GlucoseTrendChart from '@/components/GlucoseTrendChart';
import AdherenceChart from '@/components/AdherenceChart';
import DisclaimerCard from '@/components/DisclaimerCard';
import { usePatient, usePatientCheckIns, useAlerts } from '@/context/AppContext';
import { generateClinicianSummary, generateSuggestedAction, generateAISummary } from '@/services/aiSummary';
import { exportPatientReport } from '@/services/pdfExport';
import { shareCarePlan } from '@/services/shareService';

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const patient = usePatient(patientId);
  const checkins = usePatientCheckIns(patientId);
  const alerts = useAlerts(patientId);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAI, setIsAI] = useState(false);

  const latestCheckIn = checkins[0];
  const ruleSummary = patient ? generateClinicianSummary(patient, checkins) : '';
  const ruleAction = patient ? generateSuggestedAction(patient, checkins) : '';

  useEffect(() => {
    if (!patient || checkins.length === 0) return;

    let cancelled = false;
    setIsLoadingAI(true);

    generateAISummary(patient, checkins).then((result) => {
      if (cancelled) return;
      if (result.summary !== ruleSummary) {
        setAiSummary(result.summary);
        setAiAction(result.suggestedAction);
        setIsAI(true);
      }
      setIsLoadingAI(false);
    }).catch(() => {
      if (!cancelled) setIsLoadingAI(false);
    });

    return () => { cancelled = true; };
  }, [patient?.id, checkins.length]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Patient not found.</p>
      </div>
    );
  }

  const summary = aiSummary || ruleSummary;
  const suggestedAction = aiAction || ruleAction;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/clinician')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        {/* Patient Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 animate-fade-in-up">
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

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => exportPatientReport(patient, checkins, summary)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              PDF Report
            </button>
            <button
              type="button"
              onClick={() => shareCarePlan(patient, summary)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-rose-700 mb-1">
              {alerts.length} active alert{alerts.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-rose-600">{alerts[0].message}</p>
          </div>
        )}

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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Clinical Assessment</h2>
            {isAI && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                AI-Generated
              </span>
            )}
            {isLoadingAI && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full text-xs font-medium animate-pulse">
                <Sparkles className="w-3 h-3" />
                Generating...
              </span>
            )}
          </div>
          <ClinicianSummary
            summary={summary}
            suggestedAction={suggestedAction}
            riskStatus={patient.riskStatus}
            riskReasons={latestCheckIn?.riskReasons || []}
          />
        </div>

        {/* Charts */}
        <BPTrendChart checkins={checkins} />
        {patient.condition === 'Diabetes' && <GlucoseTrendChart checkins={checkins} />}
        <AdherenceChart checkins={checkins} />

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
