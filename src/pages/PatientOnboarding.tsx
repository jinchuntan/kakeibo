import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Pill, Clock, HeartPulse } from 'lucide-react';
import { cn } from '@/utils/cn';
import DisclaimerCard from '@/components/DisclaimerCard';
import type { Condition, Patient } from '@/types';

const CONDITIONS: Condition[] = ['Hypertension', 'Diabetes', 'High Cholesterol'];

export default function PatientOnboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [medication, setMedication] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [caregiverName, setCaregiverName] = useState('');

  const canSubmit = name.trim() && age && condition && medication.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;

    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      age: Number(age),
      condition: condition as Condition,
      medication: medication.trim(),
      medicationFrequency: medicationFrequency || 'Once daily',
      reminderTime,
      caregiverName: caregiverName.trim() || undefined,
      riskStatus: 'green',
      lastCheckInAt: null,
    };

    // In a real app, save to backend. For now, navigate to dashboard.
    // Store in sessionStorage so the dashboard can pick it up
    const existing = JSON.parse(sessionStorage.getItem('customPatients') || '[]');
    existing.push(newPatient);
    sessionStorage.setItem('customPatients', JSON.stringify(existing));

    navigate(`/dashboard/${newPatient.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
            <UserRound className="w-6 h-6 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Onboarding</h1>
          <p className="text-sm text-slate-500 mt-1">
            Set up your care profile to start daily check-ins.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 52"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                    condition === c
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Medication */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Pill className="w-4 h-4 text-teal-600" />
              Medication Name
            </label>
            <input
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              placeholder="e.g. Amlodipine 5mg"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Frequency</label>
            <select
              value={medicationFrequency}
              onChange={(e) => setMedicationFrequency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="">Select frequency</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="As needed">As needed</option>
            </select>
          </div>

          {/* Reminder Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              Preferred Reminder Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Caregiver */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Emergency Contact / Caregiver{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              value={caregiverName}
              onChange={(e) => setCaregiverName(e.target.value)}
              placeholder="e.g. Fatima (wife)"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            Start My Care Ledger
          </button>
        </div>

        <div className="mt-6">
          <DisclaimerCard compact />
        </div>
      </div>
    </div>
  );
}
