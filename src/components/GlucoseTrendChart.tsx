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
import { HeartPulse } from 'lucide-react';
import type { CheckIn } from '@/types';

interface GlucoseTrendChartProps {
  checkins: CheckIn[];
}

export default function GlucoseTrendChart({ checkins }: GlucoseTrendChartProps) {
  const data = [...checkins]
    .reverse()
    .filter((c) => c.glucose != null)
    .map((c) => ({
      date: new Date(c.date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      glucose: c.glucose,
    }));

  if (data.length < 2) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-semibold text-slate-700">Blood Glucose Trend</h3>
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
          <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Low', fontSize: 10, fill: '#f59e0b' }} />
          <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High', fontSize: 10, fill: '#f59e0b' }} />
          <ReferenceLine y={300} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Critical', fontSize: 10, fill: '#f43f5e' }} />
          <Line
            type="monotone"
            dataKey="glucose"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#8b5cf6' }}
            name="Glucose (mg/dL)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
