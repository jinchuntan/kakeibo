import { useNavigate } from 'react-router-dom';
import { Activity, Pill, CalendarCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Patient, CheckIn } from '@/types';

interface PatientCardProps {
  patient: Patient;
  latestCheckIn?: CheckIn;
}

export default function PatientCard({ patient, latestCheckIn }: PatientCardProps) {
  const navigate = useNavigate();

  const adherence = latestCheckIn?.medicationTaken ? 'Taken' : 'Missed';
  const bp =
    latestCheckIn?.systolic && latestCheckIn?.diastolic
      ? `${latestCheckIn.systolic}/${latestCheckIn.diastolic}`
      : '—';

  const lastCheckIn = patient.lastCheckInAt
    ? new Date(patient.lastCheckInAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

  return (
    <div
      onClick={() => navigate(`/clinician/patient/${patient.id}`)}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{patient.name}</h3>
          <p className="text-sm text-slate-500">
            {patient.age}y · {patient.condition}
          </p>
        </div>
        <StatusBadge status={patient.riskStatus} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span>{bp}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Pill className="w-3.5 h-3.5 text-slate-400" />
          <span>{adherence}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>{lastCheckIn}</span>
        </div>
      </div>
    </div>
  );
}
