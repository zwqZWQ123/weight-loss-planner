'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { WeightLog } from '@/lib/types';
import { getToday, generateId } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ProgressPage() {
  const profile = useStore((s) => s.profile);
  const weightLogs = useStore((s) => s.weightLogs);
  const recordWeight = useStore((s) => s.recordWeight);
  const results = useStore((s) => s.results);

  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');

  const sortedWeights = useMemo(() => {
    return Object.entries(weightLogs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [weightLogs]);

  const latestWeight = sortedWeights.length > 0
    ? sortedWeights[sortedWeights.length - 1].weightKg
    : profile?.currentWeightKg || 0;

  const weightLost = (profile?.currentWeightKg || 0) - latestWeight;
  const remaining = latestWeight - (profile?.targetWeightKg || 0);
  const totalToLose = (profile?.currentWeightKg || 0) - (profile?.targetWeightKg || 0);
  const pctLost = totalToLose > 0 ? Math.round((weightLost / totalToLose) * 100) : 0;

  function handleRecord() {
    const w = parseFloat(newWeight);
    if (!w || w < 30 || w > 300) return;
    const log: WeightLog = {
      date: getToday(),
      weightKg: w,
      waistCm: newWaist ? parseFloat(newWaist) : undefined,
    };
    recordWeight(log);
    setNewWeight('');
    setNewWaist('');
  }

  const chartData = useMemo(() => {
    const data = sortedWeights.map((w) => ({
      date: w.date.slice(5),
      weight: w.weightKg,
    }));
    if (profile && (sortedWeights.length === 0 || sortedWeights[0].date !== getToday())) {
      data.unshift({
        date: getToday().slice(5),
        weight: profile.currentWeightKg,
      });
    }
    return data;
  }, [sortedWeights, profile]);

  const startWeight = profile?.currentWeightKg || 0;
  const targetWeight = profile?.targetWeightKg || 0;

  const chartMin = Math.min(targetWeight - 2, latestWeight - 2, 30);
  const chartMax = startWeight + 2;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--card)] border px-3 py-2 text-xs">
          <p className="font-bold">{payload[0].payload.date}</p>
          <p className="number-font">{payload[0].value.toFixed(1)} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold tracking-tight">进度追踪</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-1">起始</div>
          <div className="text-lg font-bold number-font">{startWeight.toFixed(1)}</div>
          <div className="text-[10px] text-[var(--muted)]">kg</div>
        </div>
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-1">当前</div>
          <div className="text-lg font-bold number-font text-[var(--accent)]">{latestWeight.toFixed(1)}</div>
          <div className="text-[10px] text-[var(--muted)]">kg</div>
        </div>
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-1">目标</div>
          <div className="text-lg font-bold number-font text-[var(--success)]">{targetWeight.toFixed(1)}</div>
          <div className="text-[10px] text-[var(--muted)]">kg</div>
        </div>
      </div>

      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted)] tracking-wider uppercase">总进度</span>
          <span className="text-sm font-bold number-font">{pctLost}%</span>
        </div>
        <div className="w-full h-2 bg-[var(--border)] mb-1">
          <div className="h-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${pctLost}%` }} />
        </div>
        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>已减 {weightLost.toFixed(1)} kg</span>
          <span>还需 {remaining.toFixed(1)} kg</span>
        </div>
      </div>

      <div className="bg-[var(--card)] border p-4">
        <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-3">体重曲线</div>
        {chartData.length > 1 ? (
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[Math.round(chartMin), Math.round(chartMax)]}
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: 'var(--accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[var(--muted)]">
            记录更多体重数据以查看曲线
          </div>
        )}
        {chartData.length > 1 && (
          <div className="text-xs text-[var(--muted)] mt-2 text-right">
            目标线: {targetWeight} kg
          </div>
        )}
      </div>

      <div className="bg-[var(--card)] border p-4">
        <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-3">记录体重</div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[10px] text-[var(--muted)]">体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="xx.x"
              className="w-full bg-transparent border px-3 py-2 text-sm number-font focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-[var(--muted)]">腰围 (cm) 可选</label>
            <input
              type="number"
              step="0.1"
              value={newWaist}
              onChange={(e) => setNewWaist(e.target.value)}
              placeholder="可选"
              className="w-full bg-transparent border px-3 py-2 text-sm number-font focus:border-[var(--accent)]"
            />
          </div>
          <button onClick={handleRecord} className="py-2 px-4 bg-[var(--accent)] text-black text-sm font-semibold shrink-0">
            记录
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xs text-[var(--muted)] tracking-wider uppercase mb-3">记录历史</h2>
        <div className="space-y-1">
          {sortedWeights.length === 0 && (
            <div className="text-xs text-[var(--muted)] text-center py-4">还没有体重记录</div>
          )}
          {[...sortedWeights].reverse().map((log) => (
            <div key={log.date} className="bg-[var(--card)] border px-4 py-3 flex justify-between items-center">
              <div className="text-sm">{log.date}</div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold number-font">{log.weightKg.toFixed(1)} kg</span>
                {log.waistCm && (
                  <span className="text-xs text-[var(--muted)]">腰围 {log.waistCm} cm</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}