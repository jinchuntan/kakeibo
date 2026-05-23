import type { RiskStatus } from '@/types';

interface CheckInData {
  medicationTaken: boolean;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  symptoms: string[];
  barrierNote: string;
}

interface ClassificationResult {
  status: RiskStatus;
  reasons: string[];
}

const RED_FLAG_SYMPTOMS = ['Chest pain', 'Shortness of breath'];
const MILD_SYMPTOMS = ['Dizziness', 'Headache', 'Nausea'];

export function classifyRisk(checkin: CheckInData): ClassificationResult {
  const reasons: string[] = [];
  let hasRed = false;
  let hasYellow = false;

  // Check for red-flag symptoms
  for (const symptom of checkin.symptoms) {
    if (RED_FLAG_SYMPTOMS.includes(symptom)) {
      reasons.push(`Red-flag symptom reported: ${symptom}`);
      hasRed = true;
    }
  }

  // Check BP for hypertensive crisis
  if (checkin.systolic !== undefined && checkin.systolic >= 180) {
    reasons.push(`Systolic BP critically high: ${checkin.systolic} mmHg`);
    hasRed = true;
  }
  if (checkin.diastolic !== undefined && checkin.diastolic >= 120) {
    reasons.push(`Diastolic BP critically high: ${checkin.diastolic} mmHg`);
    hasRed = true;
  }

  // Check for multiple serious symptoms
  const seriousSymptomCount = checkin.symptoms.filter(
    (s) => s !== 'None'
  ).length;
  if (seriousSymptomCount >= 3) {
    reasons.push('Multiple symptoms reported simultaneously');
    hasRed = true;
  }

  // Check elevated BP (yellow range)
  if (
    checkin.systolic !== undefined &&
    checkin.systolic >= 140 &&
    checkin.systolic < 180
  ) {
    reasons.push(`Elevated systolic BP: ${checkin.systolic} mmHg`);
    hasYellow = true;
  }
  if (
    checkin.diastolic !== undefined &&
    checkin.diastolic >= 90 &&
    checkin.diastolic < 120
  ) {
    reasons.push(`Elevated diastolic BP: ${checkin.diastolic} mmHg`);
    hasYellow = true;
  }

  // Check missed medication
  if (!checkin.medicationTaken) {
    reasons.push('Medication not taken today');
    hasYellow = true;
  }

  // Check mild symptoms
  for (const symptom of checkin.symptoms) {
    if (MILD_SYMPTOMS.includes(symptom)) {
      reasons.push(`Mild symptom reported: ${symptom}`);
      hasYellow = true;
    }
  }

  // Check barrier note
  if (checkin.barrierNote.trim().length > 0) {
    reasons.push('Patient reported a barrier to care');
    hasYellow = true;
  }

  // Check glucose if provided
  if (checkin.glucose !== undefined) {
    if (checkin.glucose > 300 || checkin.glucose < 54) {
      reasons.push(`Critical glucose level: ${checkin.glucose} mg/dL`);
      hasRed = true;
    } else if (checkin.glucose > 180 || checkin.glucose < 70) {
      reasons.push(`Abnormal glucose level: ${checkin.glucose} mg/dL`);
      hasYellow = true;
    }
  }

  if (hasRed) {
    return { status: 'red', reasons };
  }
  if (hasYellow) {
    return { status: 'yellow', reasons };
  }
  return {
    status: 'green',
    reasons: ['All readings within normal range. Care plan followed.'],
  };
}
