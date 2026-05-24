import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Activity,
  Pill,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  Bell,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import AlertCard from '@/components/AlertCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import { useApp, useAlerts } from '@/context/AppContext';
import { generateSuggestedAction } from '@/services/aiSummary';
import type { RiskStatus } from '@/types';

type FilterStatus = 'all' | RiskStatus;

export default function ClinicianDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const unresolvedAlerts = useAlerts();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const { patients, checkIns } = state;

  const greenCount = patients.filter((p) => p.riskStatus === 'green').length;
  const yellowCount = patients.filter((p) => p.riskStatus === 'yellow').length;
  const redCount = patients.filter((p) => p.riskStatus === 'red').length;
  const today = new Date().toISOString().split('T')[0];
  const missedMedToday = checkIns.filter(
    (c) => c.date === today && !c.medicationTaken
  ).length;

  const filtered = patients
    .filter((p) => filter === 'all' || p.riskStatus === filter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const order: Record<RiskStatus, number> = { red: 0, yellow: 1, green: 2 };
      return order[a.riskStatus] - order[b.riskStatus];
    });

  const filterButtons: { label: string; value: FilterStatus; color: string }[] = [
    { label: 'All', value: 'all', color: 'bg-slate-100 text-slate-700' },
    { label: 'Red', value: 'red', color: 'bg-rose-100 text-rose-700' },
    { label: 'Yellow', value: 'yellow', color: 'bg-amber-100 text-amber-700' },
    { label: 'Green', value: 'green', color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h1 className="text-2xl font-bold text-slate-800">Care Signals</h1>
            </div>
            <p className="text-sm text-slate-500">
              Patients that need attention rise to the top.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold">
            Demo Mode
          </span>
        </div>

        {/* Active Alerts */}
        {unresolvedAlerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-rose-500" />
              Active Alerts ({unresolvedAlerts.length})
            </h2>
            <div className="space-y-3">
              {unresolvedAlerts.slice(0, 3).map((alert) => {
                const patient = patients.find((p) => p.id === alert.patientId);
                return (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    patientName={patient?.name || 'Unknown'}
                    onResolve={() => dispatch({ type: 'RESOLVE_ALERT', payload: alert.id })}
                    onClick={() => navigate(`/clinician/patient/${alert.patientId}`)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total Patients" value={patients.length} icon={Users} color="teal" />
          <StatCard label="Stable" value={greenCount} icon={CheckCircle2} color="emerald" />
          <StatCard label="Attention" value={yellowCount} icon={AlertTriangle} color="amber" />
          <StatCard label="Urgent" value={redCount} icon={Activity} color="rose" />
          <StatCard label="Missed Meds" value={missedMedToday} icon={Pill} color="slate" />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2">
            {filterButtons.map(({ label, value, color }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-h-[44px] sm:min-h-0 ${
                  filter === value
                    ? color + ' ring-2 ring-offset-1 ring-slate-300'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[44px] sm:min-h-0"
            />
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-2">Patient</div>
            <div className="col-span-2">Condition</div>
            <div className="col-span-1">BP</div>
            <div className="col-span-1">Meds</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Last</div>
            <div className="col-span-4">Suggested Action</div>
          </div>

          {filtered.map((patient) => {
            const patientCheckins = checkIns
              .filter((c) => c.patientId === patient.id)
              .sort((a, b) => b.date.localeCompare(a.date));

            const latestCheckIn = patientCheckins[0];

            const bp =
              latestCheckIn?.systolic && latestCheckIn?.diastolic
                ? `${latestCheckIn.systolic}/${latestCheckIn.diastolic}`
                : '—';

            const medStatus = latestCheckIn?.medicationTaken ? 'Taken' : 'Missed';
            const suggestedAction = generateSuggestedAction(patient, patientCheckins);

            const lastCheckIn = patient.lastCheckInAt
              ? new Date(patient.lastCheckInAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '—';

            return (
              <div
                key={patient.id}
                onClick={() => navigate(`/clinician/patient/${patient.id}`)}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between sm:block">
                    <div>
                      <p className="font-medium text-slate-800">{patient.name}</p>
                      <p className="text-xs text-slate-500 sm:hidden">
                        {patient.age}y · {patient.condition}
                      </p>
                    </div>
                    <div className="sm:hidden">
                      <StatusBadge status={patient.riskStatus} />
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex sm:col-span-2 items-center text-sm text-slate-600">
                  {patient.condition}
                </div>
                <div className="hidden sm:flex sm:col-span-1 items-center text-sm text-slate-600">
                  {bp}
                </div>
                <div className="hidden sm:flex sm:col-span-1 items-center">
                  <span
                    className={`text-sm font-medium ${
                      medStatus === 'Taken' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {medStatus}
                  </span>
                </div>
                <div className="hidden sm:flex sm:col-span-1 items-center">
                  <StatusBadge status={patient.riskStatus} />
                </div>
                <div className="hidden sm:flex sm:col-span-1 items-center text-sm text-slate-500">
                  {lastCheckIn}
                </div>
                <div className="sm:col-span-4 flex items-center">
                  <p className="text-sm text-slate-500 line-clamp-2">{suggestedAction}</p>
                </div>

                <div className="flex gap-4 text-xs text-slate-500 sm:hidden">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {bp}
                  </span>
                  <span className="flex items-center gap-1">
                    <Pill className="w-3 h-3" /> {medStatus}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="w-3 h-3" /> {lastCheckIn}
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              No patients match your search or filter.
            </div>
          )}
        </div>

        <div className="mt-6">
          <DisclaimerCard compact />
        </div>
      </div>
    </div>
  );
}
