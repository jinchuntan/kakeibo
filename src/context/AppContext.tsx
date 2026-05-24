import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { Patient, CheckIn, Alert } from '@/types';
import { mockPatients, mockCheckIns, mockAlerts } from '@/data/mockPatients';
import { generateSuggestedAction } from '@/services/aiSummary';

// --------------- State ---------------

interface AppState {
  patients: Patient[];
  checkIns: CheckIn[];
  alerts: Alert[];
  isLoading: boolean;
}

// --------------- Actions ---------------

type Action =
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'ADD_CHECKIN'; payload: CheckIn }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'RESOLVE_ALERT'; payload: string }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'RESET' };

// --------------- Reducer ---------------

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };

    case 'ADD_CHECKIN': {
      const newCheckIns = [action.payload, ...state.checkIns];
      const patients = state.patients.map((p) =>
        p.id === action.payload.patientId
          ? {
              ...p,
              riskStatus: action.payload.riskStatus,
              lastCheckInAt: new Date().toISOString(),
            }
          : p
      );

      // Auto-generate alert for yellow/red check-ins
      let newAlerts = state.alerts;
      if (
        action.payload.riskStatus === 'red' ||
        action.payload.riskStatus === 'yellow'
      ) {
        const patient = state.patients.find(
          (p) => p.id === action.payload.patientId
        );
        if (patient) {
          const newAlert: Alert = {
            id: `a-${Date.now()}`,
            patientId: action.payload.patientId,
            createdAt: new Date().toISOString(),
            riskStatus: action.payload.riskStatus,
            title: `${patient.name}: ${action.payload.riskStatus === 'red' ? 'Critical — urgent review needed' : 'Attention needed'}`,
            message: action.payload.riskReasons.join('. ') + '.',
            suggestedAction: generateSuggestedAction(patient, [action.payload]),
            resolved: false,
          };
          newAlerts = [newAlert, ...state.alerts];
        }
      }

      return { ...state, checkIns: newCheckIns, patients, alerts: newAlerts };
    }

    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'RESOLVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload ? { ...a, resolved: true } : a
        ),
      };

    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'HYDRATE':
      return action.payload;

    case 'RESET':
      return defaultState;

    default:
      return state;
  }
}

// --------------- Defaults & Persistence ---------------

const defaultState: AppState = {
  patients: mockPatients,
  checkIns: mockCheckIns,
  alerts: mockAlerts,
  isLoading: false,
};

const STORAGE_KEY = 'kakeibo-care-data';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AppState;
      // Ensure all required fields exist (handles schema changes)
      if (parsed.patients && parsed.checkIns && parsed.alerts) {
        return { ...parsed, isLoading: false };
      }
    }
  } catch {
    // Corrupt data — fall through to default
  }
  return defaultState;
}

// --------------- Context ---------------

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        patients: state.patients,
        checkIns: state.checkIns,
        alerts: state.alerts,
      })
    );
  }, [state.patients, state.checkIns, state.alerts]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// --------------- Hooks ---------------

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function usePatient(id: string | undefined) {
  const { state } = useApp();
  return state.patients.find((p) => p.id === id);
}

export function usePatientCheckIns(patientId: string | undefined) {
  const { state } = useApp();
  return state.checkIns
    .filter((c) => c.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function useAlerts(patientId?: string) {
  const { state } = useApp();
  const alerts = patientId
    ? state.alerts.filter((a) => a.patientId === patientId)
    : state.alerts;
  return alerts.filter((a) => !a.resolved);
}
