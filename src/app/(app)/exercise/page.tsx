'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { getToday, generateId, getChineseDayName } from '@/lib/utils';
import { estimateExerciseCalories } from '@/lib/calculations';
import { ChevronLeft, ChevronRight, Check, Plus, X, Dumbbell, Zap } from 'lucide-react';

export default function ExercisePage() {
  const profile = useStore((s) => s.profile);
  const weekPlans = useStore((s) => s.weekPlans);
  const exerciseLogs = useStore((s) => s.exerciseLogs);
  const toggleExercise = useStore((s) => s.toggleExercise);
  const addExerciseLog = useStore((s) => s.addExerciseLog);
  const removeExerciseLog = useStore((s) => s.removeExerciseLog);

  const [currentWeek, setCurrentWeek] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customEx, setCustomEx] = useState<{ name: string; duration: number; type: 'run' | 'basketball' | 'strength' }>({ name: '', duration: 30, type: 'run' });

  const today = getToday();
  const maxWeek = weekPlans.length - 1;
  const week = weekPlans[currentWeek];
  const todayLogs = exerciseLogs[today] || [];

  const weekCompleted = week
    ? week.days.reduce((sum, d) => {
        const dateKey = getDateForDayOfWeek(currentWeek, d.dayOfWeek);
        const logs = exerciseLogs[getDateKey(dateKey)] || [];
        const completedCount = logs.filter((l) => l.completed).length;
        return sum + completedCount;
      }, 0)
    : 0;
  const weekTotal = week ? week.days.filter((d) => d.type !== 'rest').length * 2 : 1;
  const weekPct = Math.round((weekCompleted / weekTotal) * 100);

  function getDateForDayOfWeek(weekNum: number, dayOfWeek: number): Date {
    const start = new Date(profile ? getToday() : '');
    start.setDate(start.getDate() - start.getDay() + 1 + weekNum * 7 + dayOfWeek - 1);
    return start;
  }

  function getDateKey(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  function handleToggle(dateKey: string, planName: string) {
    const logs = exerciseLogs[dateKey] || [];
    const existing = logs.find((l) => l.name === planName);
    if (existing) {
      toggleExercise(dateKey, existing.id);
    }
  }

  function handleAddCustom() {
    if (!customEx.name) return;
    const burned = estimateExerciseCalories(customEx.type, profile?.currentWeightKg || 70, customEx.duration);
    addExerciseLog({
      id: generateId(),
      date: today,
      dayOfWeek: new Date().getDay(),
      type: customEx.type,
      name: customEx.name,
      durationMinutes: customEx.duration,
      caloriesBurned: burned,
      completed: true,
    });
    setCustomEx({ name: '', duration: 30, type: 'run' });
    setShowAddForm(false);
  }

  if (!profile) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">运动计划</h1>
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))} disabled={currentWeek === 0} className="p-1 hover:text-[var(--accent)] disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <span className="font-bold number-font min-w-[80px] text-center">第 {currentWeek + 1} 周</span>
          <button onClick={() => setCurrentWeek((w) => Math.min(maxWeek, w + 1))} disabled={currentWeek >= maxWeek} className="p-1 hover:text-[var(--accent)] disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Completion */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted)] tracking-wider uppercase">本周完成率</span>
          <span className="text-sm font-bold number-font">{weekPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--border)]">
          <div className="h-full bg-[var(--success)]" style={{ width: `${weekPct}%` }} />
        </div>
      </div>

      {/* Week Plan */}
      {week && (
        <div className="space-y-2">
          {week.days.map((day) => {
            const date = getDateForDayOfWeek(currentWeek, day.dayOfWeek);
            const dateKey = getDateKey(date);
            const logs = exerciseLogs[dateKey] || [];
            const isCompleted = logs.some((l) => l.name === day.name && l.completed);
            const isToday = dateKey === today;
            const isPast = dateKey < today;

            if (!dateKey) return null;

            return (
              <div
                key={day.dayOfWeek}
                className={`bg-[var(--card)] border p-4 flex items-center gap-4 ${
                  isToday ? 'border-[var(--accent)]' : ''
                } ${isPast && !isCompleted && day.type !== 'rest' ? 'opacity-70' : ''}`}
              >
                <div className="w-10 text-center">
                  <div className="text-xs text-[var(--muted)]">{getChineseDayName(day.dayOfWeek)}</div>
                  <div className="text-xs font-bold number-font">{date.getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{day.name}</span>
                    {day.suggestedPace && (
                      <span className="text-xs text-[var(--accent)] number-font">{day.suggestedPace}</span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted)]">{day.description}</div>
                  {day.type !== 'rest' && (
                    <div className="text-xs text-[var(--muted)] mt-0.5">{day.durationMinutes} 分钟</div>
                  )}
                  {day.exercises && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {day.exercises.map((ex, i) => (
                        <span key={i} className="text-[10px] bg-[var(--border)] px-1.5 py-0.5">
                          {ex.name} {ex.sets}x{ex.reps}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {day.type !== 'rest' && (
                  <button
                    onClick={() => handleToggle(dateKey, day.name)}
                    className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                      isCompleted
                        ? 'bg-[var(--success)] border-[var(--success)] text-white'
                        : 'border-[var(--border)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={2.5} /> : <Zap size={14} />}
                  </button>
                )}
                {day.type === 'rest' && (
                  <div className="text-xs text-[var(--muted)]">休息</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Today's Custom Logs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs text-[var(--muted)] tracking-wider uppercase">今日额外运动</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs text-[var(--accent)] flex items-center gap-1"
          >
            <Plus size={14} /> 添加
          </button>
        </div>

        {showAddForm && (
          <div className="bg-[var(--card)] border p-4 space-y-3 mb-3">
            <input
              value={customEx.name}
              onChange={(e) => setCustomEx({ ...customEx, name: e.target.value })}
              placeholder="运动名称"
              className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted)]">时长（分钟）</label>
                <input
                  type="number"
                  value={customEx.duration}
                  onChange={(e) => setCustomEx({ ...customEx, duration: Number(e.target.value) })}
                  className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)] number-font"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">类型</label>
                <select
                  value={customEx.type}
                  onChange={(e) => setCustomEx({ ...customEx, type: e.target.value as 'run' | 'basketball' | 'strength' })}
                  className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)]"
                >
                  <option value="run">跑步</option>
                  <option value="basketball">篮球</option>
                  <option value="strength">力量</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddCustom} className="flex-1 py-2 bg-[var(--accent)] text-black text-sm font-semibold">
                记录
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border text-sm">
                取消
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {todayLogs.map((log) => (
            <div key={log.id} className="bg-[var(--card)] border p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Dumbbell size={16} strokeWidth={1.5} className="text-[var(--muted)]" />
                <span className="text-sm">{log.name}</span>
                <span className="text-xs text-[var(--muted)]">{log.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--accent)] number-font">{log.caloriesBurned} kcal</span>
                <button onClick={() => removeExerciseLog(today, log.id)} className="text-[var(--muted)] hover:text-[var(--danger)]">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {todayLogs.length === 0 && !showAddForm && (
            <div className="text-xs text-[var(--muted)] text-center py-4">暂无额外运动记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
