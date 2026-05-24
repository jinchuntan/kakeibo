import type { Patient } from '@/types';

export async function shareCarePlan(
  patient: Patient,
  summary: string
): Promise<void> {
  const text = [
    `Care Summary for ${patient.name}`,
    '',
    summary,
    '',
    `Medication: ${patient.medication} (${patient.medicationFrequency})`,
    `Condition: ${patient.condition}`,
    '',
    'Shared via Kakeibo Care Ledger',
  ].join('\n');

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Care Plan — ${patient.name}`,
        text,
      });
      return;
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    alert('Care summary copied to clipboard.');
  } catch {
    // Final fallback
    prompt('Copy this care summary:', text);
  }
}
