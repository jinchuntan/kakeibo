import { supabase, isSupabaseConfigured } from './supabase';
import type { Patient, CheckIn, Alert } from '@/types';
import { mockPatients, mockCheckIns, mockAlerts } from '@/data/mockPatients';

// ---- Snake ↔ Camel converters ----

function patientToSnake(p: Patient) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    condition: p.condition,
    medication: p.medication,
    medication_frequency: p.medicationFrequency,
    reminder_time: p.reminderTime,
    caregiver_name: p.caregiverName ?? null,
    risk_status: p.riskStatus,
    last_check_in_at: p.lastCheckInAt,
  };
}

function patientToCamel(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    condition: row.condition as Patient['condition'],
    medication: row.medication as string,
    medicationFrequency: row.medication_frequency as string,
    reminderTime: row.reminder_time as string,
    caregiverName: (row.caregiver_name as string) || undefined,
    riskStatus: row.risk_status as Patient['riskStatus'],
    lastCheckInAt: (row.last_check_in_at as string) || null,
  };
}

function checkInToSnake(c: CheckIn) {
  return {
    id: c.id,
    patient_id: c.patientId,
    date: c.date,
    medication_taken: c.medicationTaken,
    systolic: c.systolic ?? null,
    diastolic: c.diastolic ?? null,
    glucose: c.glucose ?? null,
    symptoms: c.symptoms,
    barrier_note: c.barrierNote,
    risk_status: c.riskStatus,
    risk_reasons: c.riskReasons,
  };
}

function checkInToCamel(row: Record<string, unknown>): CheckIn {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    date: row.date as string,
    medicationTaken: row.medication_taken as boolean,
    systolic: (row.systolic as number) || undefined,
    diastolic: (row.diastolic as number) || undefined,
    glucose: (row.glucose as number) || undefined,
    symptoms: row.symptoms as string[],
    barrierNote: row.barrier_note as string,
    riskStatus: row.risk_status as CheckIn['riskStatus'],
    riskReasons: row.risk_reasons as string[],
  };
}

function alertToSnake(a: Alert) {
  return {
    id: a.id,
    patient_id: a.patientId,
    created_at: a.createdAt,
    risk_status: a.riskStatus,
    title: a.title,
    message: a.message,
    suggested_action: a.suggestedAction,
    resolved: a.resolved,
  };
}

function alertToCamel(row: Record<string, unknown>): Alert {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    createdAt: row.created_at as string,
    riskStatus: row.risk_status as Alert['riskStatus'],
    title: row.title as string,
    message: row.message as string,
    suggestedAction: row.suggested_action as string,
    resolved: row.resolved as boolean,
  };
}

// ---- Data Operations ----

export async function fetchPatients(): Promise<Patient[]> {
  if (!isSupabaseConfigured()) return mockPatients;
  const { data, error } = await supabase!.from('patients').select('*').order('risk_status');
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(patientToCamel);
}

export async function fetchCheckIns(patientId?: string): Promise<CheckIn[]> {
  if (!isSupabaseConfigured()) {
    return patientId
      ? mockCheckIns.filter((c) => c.patientId === patientId)
      : mockCheckIns;
  }
  let query = supabase!.from('check_ins').select('*').order('date', { ascending: false });
  if (patientId) query = query.eq('patient_id', patientId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(checkInToCamel);
}

export async function fetchAlerts(patientId?: string): Promise<Alert[]> {
  if (!isSupabaseConfigured()) {
    return patientId
      ? mockAlerts.filter((a) => a.patientId === patientId)
      : mockAlerts;
  }
  let query = supabase!.from('alerts').select('*').order('created_at', { ascending: false });
  if (patientId) query = query.eq('patient_id', patientId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(alertToCamel);
}

export async function insertPatient(patient: Patient): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase!.from('patients').insert(patientToSnake(patient));
  if (error) throw error;
}

export async function insertCheckIn(checkIn: CheckIn): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase!.from('check_ins').insert(checkInToSnake(checkIn));
  if (error) throw error;
  await supabase!
    .from('patients')
    .update({
      risk_status: checkIn.riskStatus,
      last_check_in_at: new Date().toISOString(),
    })
    .eq('id', checkIn.patientId);
}

export async function insertAlert(alert: Alert): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase!.from('alerts').insert(alertToSnake(alert));
  if (error) throw error;
}

export async function resolveAlert(alertId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase!.from('alerts').update({ resolved: true }).eq('id', alertId);
}

export async function seedDemoData(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { count } = await supabase!.from('patients').select('*', { count: 'exact', head: true });
  if (count && count > 0) return;
  await supabase!.from('patients').insert(mockPatients.map(patientToSnake));
  await supabase!.from('check_ins').insert(mockCheckIns.map(checkInToSnake));
  await supabase!.from('alerts').insert(mockAlerts.map(alertToSnake));
}
