'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { ExerciseLog } from '@/lib/types';
import { getToday, generateId, getChineseDayName } from '@/lib/utils';
import { estimateExerciseCalories } from '@/lib/calculations';
import { formatDate } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Check, Plus, X, Dumbbell, Zap,
  Camera, Edit3, Save, Calendar
} from 'lucide-react';

export default function ExercisePage() {
  const profile = useStore((s) => s.profile);
  const weekPlans = useStore((s) => s.weekPlans);
  const exerciseLogs = useStore((s) => s.exerciseLogs);
  const addExerciseLog = useStore((s) => s.addExerciseLog);
  const removeExerciseLog = useStore((s) => s.removeExerciseLog);
  const updateExerciseLog = useStore((s) => s.updateExerciseLog);

  const [currentWeek, setCurrentWeek] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLog, setEditingLog] = useState<{ date: string; log: ExerciseLog } | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [customEx, setCustomEx] = useState({
    name: '', duration: 30, type: 'run' as 'run' | 'basketball' | 'strength', notes: '',
    date: getToday(),
  });

  const today = getToday();
  const maxWeek = weekPlans.length - 1;
  const week = weekPlans[currentWeek];

  // ---- date helpers ----
  function getDateForDayOfWeek(weekNum: number, dayOfWeek: number): Date {
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() + 1 + weekNum * 7 + dayOfWeek - 1);
    return start;
  }

  function getDateKey(d: Date): string {
    return formatDate(d);
  }

  // ---- week completion stats ----
  const weekStats = useMemo(() => {
    if (!week) return { completed: 0, total: 0, pct: 0, dayStats: [] as { dayOfWeek: number; completed: boolean; dateKey: string }[] };

    const dayStats = week.days.map((d) => {
      const date = getDateForDayOfWeek(currentWeek, d.dayOfWeek);
      const dateKey = getDateKey(date);
      const logs = exerciseLogs[dateKey] || [];
      const comp = logs.some((l) => l.name === d.name && l.completed);
      return { dayOfWeek: d.dayOfWeek, completed: d.type === 'rest' ? true : comp, dateKey };
    });

    const nonRest = dayStats.filter((s) => {
      const day = week.days.find((d) => d.dayOfWeek === s.dayOfWeek);
      return day && day.type !== 'rest';
    });
    const completed = nonRest.filter((s) => s.completed).length;
    const total = nonRest.length || 1;
    return { completed, total, pct: Math.round((completed / total) * 100), dayStats };
  }, [week, exerciseLogs, currentWeek, today]);

  // ---- toggle plan completion ----
  function handleToggle(dateKey: string, day: typeof week.days[0]) {
    const logs = exerciseLogs[dateKey] || [];
    const existing = logs.find((l) => l.name === day.name);

    if (existing) {
      // 已有记录，切换完成状态
      updateExerciseLog(dateKey, existing.id, { completed: !existing.completed });
    } else {
      // 无记录，创建一条
      const burned = estimateExerciseCalories(day.type, profile?.currentWeightKg || 70, day.durationMinutes);
      addExerciseLog({
        id: generateId(),
        date: dateKey,
        dayOfWeek: day.dayOfWeek,
        type: day.type,
        name: day.name,
        durationMinutes: day.durationMinutes,
        caloriesBurned: burned,
        completed: true,
      });
    }
  }

  // ---- add custom exercise ----
  function handleAddCustom() {
    if (!customEx.name) return;
    const burned = estimateExerciseCalories(customEx.type, profile?.currentWeightKg || 70, customEx.duration);
    addExerciseLog({
      id: generateId(),
      date: customEx.date,
      dayOfWeek: new Date(customEx.date).getDay(),
      type: customEx.type,
      name: customEx.name,
      durationMinutes: customEx.duration,
      caloriesBurned: burned,
      completed: true,
      notes: customEx.notes || undefined,
    });
    setCustomEx({ name: '', duration: 30, type: 'run', notes: '', date: getToday() });
    setShowAddForm(false);
  }

  // ---- edit log ----
  function handleSaveEdit() {
    if (!editingLog) return;
    const { date, log } = editingLog;
    updateExerciseLog(date, log.id, {
      durationMinutes: log.durationMinutes,
      actualDurationMinutes: log.actualDurationMinutes,
      notes: log.notes,
      completed: log.completed,
      imageUrl: log.imageUrl,
    });
    setEditingLog(null);
  }

  // ---- image upload (base64) ----
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (editingLog) {
        setEditingLog({ ...editingLog, log: { ...editingLog.log, imageUrl: dataUrl } });
      }
    };
    reader.readAsDataURL(file);
  }

  // ---- gather all logs in this week for display ----
  const allWeekLogs = useMemo(() => {
    if (!week) return [];
    const result: { dateKey: string; date: Date; day: typeof week.days[0]; logs: ExerciseLog[] }[] = [];
    week.days.forEach((d) => {
      const date = getDateForDayOfWeek(currentWeek, d.dayOfWeek);
      const dateKey = getDateKey(date);
      const logs = exerciseLogs[dateKey] || [];
      result.push({ dateKey, date, day: d, logs });
    });
    return result;
  }, [week, exerciseLogs, currentWeek, today]);

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

      {/* Completion bar */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted)] tracking-wider uppercase">本周完成率</span>
          <span className="text-sm font-bold number-font">{weekStats.pct}% ({weekStats.completed}/{weekStats.total})</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--border)]">
          <div className="h-full bg-[var(--success)] transition-all" style={{ width: `${weekStats.pct}%` }} />
        </div>
        {/* Day-by-day completion dots */}
        <div className="flex gap-1 mt-2">
          {weekStats.dayStats.map((s) => {
            const day = week?.days.find((d) => d.dayOfWeek === s.dayOfWeek);
            const label = day ? getChineseDayName(s.dayOfWeek) : '';
            return (
              <div key={s.dayOfWeek} className="flex-1 text-center">
                <div className={`w-full h-1 ${s.completed ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
                <span className="text-[10px] text-[var(--muted)]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week plan - each day card */}
      {allWeekLogs.map(({ dateKey, date, day, logs }) => {
        const isToday = dateKey === today;
        const isPast = dateKey < today;
        const isCompleted = logs.some((l) => l.name === day.name && l.completed);
        const planLog = logs.find((l) => l.name === day.name);

        return (
          <div key={day.dayOfWeek} className={`bg-[var(--card)] border ${isToday ? 'border-[var(--accent)]' : ''}`}>
            {/* Day header + toggle row */}
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 text-center shrink-0">
                <div className="text-xs text-[var(--muted)]">{getChineseDayName(day.dayOfWeek)}</div>
                <div className="text-sm font-bold number-font">{date.getDate()}</div>
                <div className="text-[10px] text-[var(--muted)]">{`${date.getMonth() + 1}/${date.getDate()}`}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${day.type === 'rest' ? 'text-[var(--muted)]' : ''}`}>
                    {day.type === 'rest' ? '休息' : day.name}
                  </span>
                  {day.suggestedPace && (
                    <span className="text-xs text-[var(--accent)] number-font">{day.suggestedPace}</span>
                  )}
                  {planLog?.actualDurationMinutes && planLog.actualDurationMinutes !== day.durationMinutes && (
                    <span className="text-xs text-[var(--warning)]">实练 {planLog.actualDurationMinutes}min</span>
                  )}
                </div>
                <div className="text-xs text-[var(--muted)]">{day.description}</div>
                {day.type !== 'rest' && (
                  <div className="text-xs text-[var(--muted)] mt-0.5">计划 {day.durationMinutes} 分钟</div>
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
                {planLog?.notes && (
                  <div className="text-xs text-[var(--muted)] mt-1 italic">{planLog.notes}</div>
                )}
                {planLog?.imageUrl && (
                  <div className="mt-1">
                    <img src={planLog.imageUrl} alt="运动照片" className="max-h-24 rounded object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Edit button */}
                {planLog && (
                  <button onClick={() => setEditingLog({ date: dateKey, log: planLog })} className="p-1.5 border border-[var(--border)] hover:border-[var(--accent)]">
                    <Edit3 size={12} />
                  </button>
                )}
                {/* Complete toggle */}
                {day.type !== 'rest' && (
                  <button
                    onClick={() => handleToggle(dateKey, day)}
                    className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                      isCompleted
                        ? 'bg-[var(--success)] border-[var(--success)] text-white'
                        : 'border-[var(--border)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={2.5} /> : <Zap size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Extra logs for this day (expandable) */}
            {logs.length > 0 && (
              <div className="border-t border-[var(--border)]">
                <button
                  onClick={() => setExpandedLogId(expandedLogId === dateKey ? null : dateKey)}
                  className="w-full px-4 py-2 text-xs text-[var(--muted)] flex items-center justify-between hover:text-[var(--foreground)]"
                >
                  <span>额外记录 ({logs.length - (planLog ? 1 : 0)})</span>
                  <span>{expandedLogId === dateKey ? '收起' : '展开'}</span>
                </button>
                {expandedLogId === dateKey && logs.filter((l) => l.id !== planLog?.id).map((log) => (
                  <div key={log.id} className="px-4 py-2 border-t border-[var(--border)] flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Dumbbell size={14} className="text-[var(--muted)]" />
                      <span>{log.name}</span>
                      <span className="text-xs text-[var(--muted)]">{log.durationMinutes}min</span>
                      {log.notes && <span className="text-xs text-[var(--muted)] italic">{log.notes}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--accent)]">{log.caloriesBurned} kcal</span>
                      <button onClick={() => removeExerciseLog(dateKey, log.id)} className="text-[var(--muted)] hover:text-[var(--danger)]"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit log modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">编辑 - {editingLog.log.name}</span>
              <button onClick={() => setEditingLog(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted)]">计划时长（分钟）</label>
                <input type="number" value={editingLog.log.durationMinutes}
                  onChange={(e) => setEditingLog({ ...editingLog, log: { ...editingLog.log, durationMinutes: Number(e.target.value) } })}
                  className="w-full bg-transparent border px-3 py-2 text-sm number-font focus:border-[var(--accent)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">实际时长（分钟）</label>
                <input type="number" value={editingLog.log.actualDurationMinutes ?? editingLog.log.durationMinutes}
                  onChange={(e) => setEditingLog({ ...editingLog, log: { ...editingLog.log, actualDurationMinutes: Number(e.target.value) } })}
                  className="w-full bg-transparent border px-3 py-2 text-sm number-font focus:border-[var(--accent)]" />
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--muted)]">备注</label>
              <textarea value={editingLog.log.notes || ''}
                onChange={(e) => setEditingLog({ ...editingLog, log: { ...editingLog.log, notes: e.target.value } })}
                className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)] resize-none" rows={2}
                placeholder="运动感受、备注..." />
            </div>

            <div>
              <label className="text-xs text-[var(--muted)]">完成状态</label>
              <button
                onClick={() => setEditingLog({ ...editingLog, log: { ...editingLog.log, completed: !editingLog.log.completed } })}
                className={`mt-1 w-full py-2 text-sm border ${
                  editingLog.log.completed
                    ? 'bg-[var(--success)] text-white border-[var(--success)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {editingLog.log.completed ? '已完成 ✓' : '未完成'}
              </button>
            </div>

            {/* Image upload */}
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">上传运动照片</label>
              {editingLog.log.imageUrl ? (
                <div className="relative inline-block">
                  <img src={editingLog.log.imageUrl} alt="运动" className="max-h-32 rounded" />
                  <button
                    onClick={() => setEditingLog({ ...editingLog, log: { ...editingLog.log, imageUrl: undefined } })}
                    className="absolute top-1 right-1 bg-black/60 p-0.5"
                  ><X size={12} /></button>
                </div>
              ) : (
                <label className="flex items-center gap-2 py-2 px-3 border text-sm cursor-pointer hover:border-[var(--accent)]">
                  <Camera size={16} />
                  <span>选择图片</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <button onClick={handleSaveEdit} className="w-full py-2.5 bg-[var(--accent)] text-black text-sm font-semibold flex items-center justify-center gap-2">
              <Save size={16} /> 保存修改
            </button>
          </div>
        </div>
      )}

      {/* Add custom exercise */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs text-[var(--muted)] tracking-wider uppercase">添加自定义运动</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="text-xs text-[var(--accent)] flex items-center gap-1">
            <Plus size={14} /> 添加
          </button>
        </div>

        {showAddForm && (
          <div className="bg-[var(--card)] border p-4 space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={customEx.name} onChange={(e) => setCustomEx({ ...customEx, name: e.target.value })}
                placeholder="运动名称" className="col-span-2 bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)]" />
              <div>
                <label className="text-xs text-[var(--muted)]">日期</label>
                <input type="date" value={customEx.date} onChange={(e) => setCustomEx({ ...customEx, date: e.target.value })}
                  className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">类型</label>
                <select value={customEx.type} onChange={(e) => setCustomEx({ ...customEx, type: e.target.value as 'run' | 'basketball' | 'strength' })}
                  className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)]">
                  <option value="run">跑步</option>
                  <option value="basketball">篮球</option>
                  <option value="strength">力量</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">时长（分钟）</label>
                <input type="number" value={customEx.duration} onChange={(e) => setCustomEx({ ...customEx, duration: Number(e.target.value) })}
                  className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)] number-font" />
              </div>
            </div>
            <textarea value={customEx.notes} onChange={(e) => setCustomEx({ ...customEx, notes: e.target.value })}
              placeholder="备注（可选）" className="w-full bg-transparent border px-3 py-2 text-sm focus:border-[var(--accent)] resize-none" rows={2} />
            <button onClick={handleAddCustom} className="w-full py-2 bg-[var(--accent)] text-black text-sm font-semibold">
              记录运动
            </button>
          </div>
        )}
      </div>

      {/* Summary of all logs this week */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-[var(--accent)]" />
          <span className="text-xs text-[var(--muted)] tracking-wider uppercase">本周运动汇总</span>
        </div>
        {allWeekLogs.some((w) => w.logs.length > 0) ? (
          <div className="space-y-1.5">
            {allWeekLogs.map(({ dateKey, logs }) =>
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--muted)] w-20">{dateKey.slice(5)}</span>
                    <span className={log.completed ? '' : 'text-[var(--muted)] line-through'}>{log.name}</span>
                    <span className="text-xs text-[var(--muted)]">{log.durationMinutes}min</span>
                    {log.actualDurationMinutes && log.actualDurationMinutes !== log.durationMinutes && (
                      <span className="text-xs text-[var(--warning)]">→ {log.actualDurationMinutes}min</span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--accent)]">{log.caloriesBurned} kcal</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--muted)] text-center py-3">本周暂无记录</div>
        )}
      </div>
    </div>
  );
}