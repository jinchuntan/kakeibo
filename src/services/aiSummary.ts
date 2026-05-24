import type { Patient, CheckIn } from '@/types';

/**
 * Generates a clinician-facing summary using rule-based logic.
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

  if (latest.systolic && latest.diastolic) {
    parts.push(
      `Most recent BP reading: ${latest.systolic}/${latest.diastolic} mmHg.`
    );
  }

  if (latest.glucose) {
    parts.push(`Blood glucose: ${latest.glucose} mg/dL.`);
  }

  if (!latest.medicationTaken) {
    parts.push('Medication was missed on the most recent check-in.');
  }

  const activeSymptoms = latest.symptoms.filter((s) => s !== 'None');
  if (activeSymptoms.length > 0) {
    parts.push(`Reported symptoms: ${activeSymptoms.join(', ')}.`);
  }

  if (latest.barrierNote.trim()) {
    parts.push(`Patient noted: "${latest.barrierNote.trim()}"`);
  }

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
 * Generates an AI-powered clinical summary.
 * Calls Supabase Edge Function → OpenAI if configured.
 * Falls back to rule-based if not configured or on error.
 */
export async function generateAISummary(
  patient: Patient,
  checkins: CheckIn[]
): Promise<{ summary: string; suggestedAction: string }> {
  const fallback = {
    summary: generateClinicianSummary(patient, checkins),
    suggestedAction: generateSuggestedAction(patient, checkins),
  };

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return fallback;

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ patient, checkins: checkins.slice(0, 7) }),
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    return {
      summary: data.summary || fallback.summary,
      suggestedAction: data.suggestedAction || fallback.suggestedAction,
    };
  } catch {
    return fallback;
  }
}
