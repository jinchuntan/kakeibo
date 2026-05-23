import type { Patient, CheckIn } from '@/types';

/**
 * Generates a clinician-facing summary for a patient based on their check-ins.
 *
 * Currently uses rule-based logic. Structured so it can be replaced
 * with an OpenAI/Claude API call in the future.
 */
export function generateClinicianSummary(
  patient: Patient,
  checkins: CheckIn[]
): string {
  if (checkins.length === 0) {
    return `${patient.name} is a ${patient.condition.toLowerCase()} patient. No check-ins have been recorded yet.`;
  }

  const latest = checkins[0];
  const parts: string[] = [];

  parts.push(
    `${patient.name} is a ${patient.condition.toLowerCase()} patient on ${patient.medication}.`
  );

  // BP reading
  if (latest.systolic && latest.diastolic) {
    parts.push(
      `Most recent BP reading: ${latest.systolic}/${latest.diastolic} mmHg.`
    );
  }

  // Glucose
  if (latest.glucose) {
    parts.push(`Blood glucose: ${latest.glucose} mg/dL.`);
  }

  // Medication adherence
  if (!latest.medicationTaken) {
    parts.push('Medication was missed on the most recent check-in.');
  }

  // Symptoms
  const activeSymptoms = latest.symptoms.filter((s) => s !== 'None');
  if (activeSymptoms.length > 0) {
    parts.push(`Reported symptoms: ${activeSymptoms.join(', ')}.`);
  }

  // Barrier
  if (latest.barrierNote.trim()) {
    parts.push(`Patient noted: "${latest.barrierNote.trim()}"`);
  }

  // Recommendation
  if (latest.riskStatus === 'red') {
    parts.push(
      'Immediate clinician review is recommended. Patient may need urgent assessment.'
    );
  } else if (latest.riskStatus === 'yellow') {
    parts.push(
      'Consider reviewing adherence barriers and whether a follow-up teleconsult is needed within 24–48 hours.'
    );
  } else {
    parts.push(
      'Patient appears stable. Continue monitoring through daily check-ins.'
    );
  }

  // Streak info
  const recentAdherence = checkins
    .slice(0, 7)
    .filter((c) => c.medicationTaken).length;
  const totalRecent = Math.min(checkins.length, 7);
  parts.push(
    `Medication adherence over last ${totalRecent} check-ins: ${recentAdherence}/${totalRecent}.`
  );

  return parts.join(' ');
}

/**
 * Generates a suggested next action for a patient.
 */
export function generateSuggestedAction(
  _patient: Patient,
  checkins: CheckIn[]
): string {
  if (checkins.length === 0) {
    return 'Encourage patient to complete their first daily check-in.';
  }

  const latest = checkins[0];

  if (latest.riskStatus === 'red') {
    return 'Escalate to clinician immediately. Patient may need urgent assessment.';
  }

  if (latest.riskStatus === 'yellow') {
    const actions: string[] = [];
    if (!latest.medicationTaken) {
      actions.push('review medication adherence');
    }
    if (latest.symptoms.filter((s) => s !== 'None').length > 0) {
      actions.push('assess reported symptoms');
    }
    if (latest.barrierNote.trim()) {
      actions.push('address care barriers');
    }
    if (latest.systolic && latest.systolic >= 140) {
      actions.push('review BP management');
    }
    return `Recommend follow-up message or teleconsult review within 24–48 hours to ${actions.join(', ')}.`;
  }

  return 'No immediate action needed. Continue routine monitoring.';
}

/**
 * Placeholder for future LLM API integration.
 * Replace this function body with an actual API call.
 */
export async function generateAISummary(
  _patient: Patient,
  _checkins: CheckIn[]
): Promise<string> {
  // Future: Replace with actual API call
  // const response = await fetch('/api/ai/summary', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ patient, checkins }),
  // });
  // return response.json();
  return generateClinicianSummary(_patient, _checkins);
}
