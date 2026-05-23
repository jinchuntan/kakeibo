import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  ClipboardList,
  CalendarCheck,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Activity,
  UserRound,
} from 'lucide-react';
import DisclaimerCard from '@/components/DisclaimerCard';

const features = [
  {
    icon: ClipboardList,
    title: 'Daily Care Ledger',
    description: 'Simple daily check-ins inspired by the Kakeibo method of mindful tracking.',
  },
  {
    icon: Activity,
    title: 'Smart Risk Signals',
    description: 'Automatic Green / Yellow / Red classification to surface what needs attention.',
  },
  {
    icon: Stethoscope,
    title: 'Clinician Dashboard',
    description: 'Clinicians see only the patients who need help, not endless lists.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Supportive',
    description: 'No diagnosis. No prescriptions. Just structured follow-up and human connection.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        {/* Demo badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mb-6">
          <HeartPulse className="w-3.5 h-3.5" />
          Hackathon Demo
        </span>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Kakeibo Care Ledger
        </h1>

        <p className="mt-4 text-lg text-teal-700 font-medium">
          Daily chronic care follow-up, inspired by the Japanese art of mindful tracking.
        </p>

        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Help patients stay consistent after a consult, while giving clinicians only the signals that need attention.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/checkin/p1')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all active:scale-[0.98]"
          >
            Start Ali's Demo
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/clinician')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            Clinician Dashboard
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4"
            >
              <div className="bg-teal-50 rounded-lg p-2.5 h-fit">
                <Icon className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-6">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              step: '1',
              icon: UserRound,
              title: 'Patient checks in',
              desc: 'A quick daily ledger entry about medication, vitals, and symptoms.',
            },
            {
              step: '2',
              icon: Activity,
              title: 'Risk is classified',
              desc: 'Green, Yellow, or Red — so everyone knows where things stand.',
            },
            {
              step: '3',
              icon: Stethoscope,
              title: 'Clinician sees signals',
              desc: 'Only patients who need attention rise to the top.',
            },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                {step}
              </div>
              <Icon className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <p className="text-sm text-slate-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-teal-600" />
            Explore the Demo
          </h3>
          <div className="grid sm:grid-cols-3 gap-2">
            <button
              onClick={() => navigate('/onboarding')}
              className="text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <p className="text-sm font-medium text-slate-700">Patient Onboarding</p>
              <p className="text-xs text-slate-500">Register a new patient</p>
            </button>
            <button
              onClick={() => navigate('/dashboard/p1')}
              className="text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <p className="text-sm font-medium text-slate-700">Ali's Dashboard</p>
              <p className="text-xs text-slate-500">Patient view</p>
            </button>
            <button
              onClick={() => navigate('/clinician')}
              className="text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <p className="text-sm font-medium text-slate-700">Clinician View</p>
              <p className="text-xs text-slate-500">All patients at a glance</p>
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <DisclaimerCard />
      </div>
    </div>
  );
}
