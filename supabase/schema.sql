-- Kakeibo Care Ledger — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database.

-- Patients table
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('Hypertension', 'Diabetes', 'High Cholesterol')),
  medication TEXT NOT NULL,
  medication_frequency TEXT NOT NULL DEFAULT 'Once daily',
  reminder_time TEXT NOT NULL DEFAULT '08:00',
  caregiver_name TEXT,
  risk_status TEXT NOT NULL DEFAULT 'green' CHECK (risk_status IN ('green', 'yellow', 'red')),
  last_check_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE check_ins (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  medication_taken BOOLEAN NOT NULL,
  systolic INTEGER,
  diastolic INTEGER,
  glucose INTEGER,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  barrier_note TEXT NOT NULL DEFAULT '',
  risk_status TEXT NOT NULL CHECK (risk_status IN ('green', 'yellow', 'red')),
  risk_reasons TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  risk_status TEXT NOT NULL CHECK (risk_status IN ('green', 'yellow', 'red')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_checkins_patient_date ON check_ins(patient_id, date DESC);
CREATE INDEX idx_alerts_patient ON alerts(patient_id);
CREATE INDEX idx_patients_risk ON patients(risk_status);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Row Level Security (permissive for hackathon demo)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for demo" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON check_ins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON alerts FOR ALL USING (true) WITH CHECK (true);
