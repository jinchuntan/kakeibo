export type RiskStatus = 'green' | 'yellow' | 'red';

export type Condition = 'Hypertension' | 'Diabetes' | 'High Cholesterol';

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: Condition;
  medication: string;
  medicationFrequency: string;
  reminderTime: string;
  caregiverName?: string;
  riskStatus: RiskStatus;
  lastCheckInAt: string | null;
}

export interface CheckIn {
  id: string;
  patientId: string;
  date: string;
  medicationTaken: boolean;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  symptoms: string[];
  barrierNote: string;
  riskStatus: RiskStatus;
  riskReasons: string[];
}

export interface Alert {
  id: string;
  patientId: string;
  createdAt: string;
  riskStatus: RiskStatus;
  title: string;
  message: string;
  suggestedAction: string;
  resolved: boolean;
}
