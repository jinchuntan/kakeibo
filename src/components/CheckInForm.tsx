import { useState } from 'react';
import { HeartPulse, Pill, AlertTriangle, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { classifyRisk } from '@/utils/riskClassifier';
import type { CheckIn } from '@/types';

const SYMPTOM_OPTIONS = [
  'None',
  'Dizziness',
  'Headache',
  'Chest pain',
  'Shortness of breath',
  'Nausea',
];

interface CheckInFormProps {
  patientId: string;
  onSubmit: (checkin: CheckIn) => void;
  showGlucose?: boolean;
}

export default function CheckInForm({ patientId, onSubmit, showGlucose = false }: CheckInFormProps) {
  const [medicationTaken, setMedicationTaken] = useState<boolean | null>(null);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [glucose, setGlucose] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [barrierNote, setBarrierNote] = useState('');

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'None') {
      setSymptoms((prev) => (prev.includes('None') ? [] : ['None']));
      return;
    }
    setSymptoms((prev) => {
      const without = prev.filter((s) => s !== 'None');
      return without.includes(symptom)
        ? without.filter((s) => s !== symptom)
        : [...without, symptom];
    });
  };

  const canSubmit = medicationTaken !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const data = {
      medicationTaken: medicationTaken!,
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      glucose: glucose ? Number(glucose) : undefined,
      symptoms: symptoms.length > 0 ? symptoms : ['None'],
      barrierNote,
    };

    const { status, reasons } = classifyRisk(data);

    const checkin: CheckIn = {
      id: `c-${Date.now()}`,
      patientId,
      date: new Date().toISOString().split('T')[0],
      ...data,
      riskStatus: status,
      riskReasons: reasons,
    };

    onSubmit(checkin);
  };

  return (
    <div className="space-y-6">
      {/* Medication */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
          <Pill className="w-4 h-4 text-teal-600" />
          Did you take your medication today?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMedicationTaken(true)}
            className={cn(
              'py-3 rounded-xl border-2 text-sm font-medium transition-all',
              medicationTaken === true
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            Yes, I took it
          </button>
          <button
            type="button"
            onClick={() => setMedicationTaken(false)}
            className={cn(
              'py-3 rounded-xl border-2 text-sm font-medium transition-all',
              medicationTaken === false
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            No, I missed it
          </button>
        </div>
      </div>

      {/* Blood Pressure */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
          <HeartPulse className="w-4 h-4 text-teal-600" />
          Blood Pressure Reading
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Systolic (top)</label>
            <input
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              placeholder="e.g. 120"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Diastolic (bottom)</label>
            <input
              type="number"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              placeholder="e.g. 80"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Glucose (optional) */}
      {showGlucose && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            Blood Glucose (optional)
          </label>
          <input
            type="number"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            placeholder="e.g. 110 mg/dL"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Symptoms */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
          <AlertTriangle className="w-4 h-4 text-teal-600" />
          Any symptoms today?
        </label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => toggleSymptom(symptom)}
              className={cn(
                'px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                symptoms.includes(symptom)
                  ? symptom === 'None'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Barrier Note */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          What made care difficult today?
        </label>
        <textarea
          value={barrierNote}
          onChange={(e) => setBarrierNote(e.target.value)}
          placeholder="Optional — share anything that made it hard to follow your care plan today."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          'w-full py-3 rounded-xl text-sm font-semibold transition-all',
          canSubmit
            ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        )}
      >
        Submit Today's Ledger Entry
      </button>
    </div>
  );
}
