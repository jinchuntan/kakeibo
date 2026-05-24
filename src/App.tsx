import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  Home,
  UserRound,
  Stethoscope,
  ClipboardList,
  RotateCcw,
} from 'lucide-react';
import LandingPage from '@/pages/LandingPage';
import PatientOnboarding from '@/pages/PatientOnboarding';
import DailyCheckIn from '@/pages/DailyCheckIn';
import PatientDashboard from '@/pages/PatientDashboard';
import ClinicianDashboard from '@/pages/ClinicianDashboard';
import PatientDetail from '@/pages/PatientDetail';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useApp, useAlerts } from '@/context/AppContext';
import { cn } from '@/utils/cn';

function NavBar() {
  const location = useLocation();
  const { dispatch } = useApp();
  const unresolvedAlerts = useAlerts();

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard/p1', label: 'Patient App', icon: UserRound },
    { to: '/clinician', label: 'Clinician', icon: Stethoscope, badge: unresolvedAlerts.length },
  ];

  const handleReset = () => {
    if (confirm('Reset all data to demo defaults?')) {
      localStorage.removeItem('kakeibo-care-data');
      dispatch({ type: 'RESET' });
      window.location.href = '/';
    }
  };

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
          {links.map(({ to, label, icon: Icon, badge }) => {
            const active =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to.split('/')[1] ? `/${to.split('/')[1]}` : to);

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleReset}
            className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            title="Reset demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function BottomNav() {
  const location = useLocation();
  const unresolvedAlerts = useAlerts();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/checkin/p1', icon: ClipboardList, label: 'Check-in' },
    { to: '/dashboard/p1', icon: UserRound, label: 'Dashboard' },
    { to: '/clinician', icon: Stethoscope, label: 'Clinician', badge: unresolvedAlerts.length },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 sm:hidden z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-16">
        {links.map(({ to, icon: Icon, label, badge }) => {
          const active =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to.split('/').slice(0, 2).join('/'));

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1 min-w-[60px]',
                active ? 'text-teal-600' : 'text-slate-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {badge != null && badge > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<PatientOnboarding />} />
            <Route path="/checkin/:patientId" element={<DailyCheckIn />} />
            <Route path="/dashboard/:patientId" element={<PatientDashboard />} />
            <Route path="/clinician" element={<ClinicianDashboard />} />
            <Route path="/clinician/patient/:patientId" element={<PatientDetail />} />
          </Routes>
        </ErrorBoundary>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
