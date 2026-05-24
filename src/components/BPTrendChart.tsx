import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Activity } from 'lucide-react';
import type { CheckIn } from '@/types';

interface BPTrendChartProps {
  checkins: CheckIn[];
}

export default function BPTrendChart({ checkins }: BPTrendChartProps) {
  const data = [...checkins]
    .reverse()
    .filter((c) => c.systolic && c.diastolic)
    .map((c) => ({
      date: new Date(c.date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      systolic: c.systolic,
      diastolic: c.diastolic,
    }));

  if (data.length < 2) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-semibold text-slate-700">Blood Pressure Trend</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High', fontSize: 10, fill: '#f59e0b' }} />
          <ReferenceLine y={180} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Crisis', fontSize: 10, fill: '#f43f5e' }} />
          <Line
            type="monotone"
            dataKey="systolic"
            stroke="#0d9488"
            strokeWidth={2}
            dot={{ r: 4, fill: '#0d9488' }}
            name="Systolic"
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#14b8a6' }}
            name="Diastolic"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-teal-700 rounded" /> Systolic
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-teal-500 rounded" /> Diastolic
        </span>
      </div>
    </div>
  );
}
