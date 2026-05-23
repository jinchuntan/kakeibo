import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  Home,
  UserRound,
  Stethoscope,
} from 'lucide-react';
import LandingPage from '@/pages/LandingPage';
import PatientOnboarding from '@/pages/PatientOnboarding';
import DailyCheckIn from '@/pages/DailyCheckIn';
import PatientDashboard from '@/pages/PatientDashboard';
import ClinicianDashboard from '@/pages/ClinicianDashboard';
import PatientDetail from '@/pages/PatientDetail';
import { cn } from '@/utils/cn';

function NavBar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard/p1', label: 'Patient App', icon: UserRound },
    { to: '/clinician', label: 'Clinician', icon: Stethoscope },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <HeartPulse className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm hidden sm:block">
            Kakeibo Care
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<PatientOnboarding />} />
          <Route path="/checkin/:patientId" element={<DailyCheckIn />} />
          <Route path="/dashboard/:patientId" element={<PatientDashboard />} />
          <Route path="/clinician" element={<ClinicianDashboard />} />
          <Route path="/clinician/patient/:patientId" element={<PatientDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
