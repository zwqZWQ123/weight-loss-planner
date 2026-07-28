'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { CaloriesCard } from '@/components/CaloriesCard';
import { ProgressBar } from '@/components/ProgressBar';
import { getToday } from '@/lib/utils';
import { estimateExerciseCalories } from '@/lib/calculations';
import { Dumbbell, Apple, Weight, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const results = useStore((s) => s.results);
  const foodEntries = useStore((s) => s.foodEntries);
  const exerciseLogs = useStore((s) => s.exerciseLogs);
  const weightLogs = useStore((s) => s.weightLogs);
  const planStartDate = useStore((s) => s.planStartDate);

  const today = getToday();
  const todayFoods = foodEntries[today] || [];
  const todayExercise = exerciseLogs[today] || [];

  const todayCalories = todayFoods.reduce((s, f) => s + f.calories, 0);
  const todayProtein = todayFoods.reduce((s, f) => s + f.protein, 0);
  const todayBurned = todayExercise.reduce((s, e) => s + e.caloriesBurned, 0);

  // Weight progress
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

  // Time progress
  const startDate = planStartDate ? new Date(planStartDate) : new Date();
  const totalDays = (profile?.planDurationWeeks || 8) * 7;
  const elapsedDays = Math.floor(
    (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const timePct = Math.min((elapsedDays / totalDays) * 100, 100);
  const daysLeft = Math.max(totalDays - elapsedDays, 0);

  // Milestones
  const milestones = useMemo(() => {
    const milestones = [];
    const startW = profile?.currentWeightKg || 0;
    for (let i = 2; i <= 20; i += 2) {
      if (weightLost >= i) {
        milestones.push({ kg: i, reached: true });
      } else {
        milestones.push({ kg: i, reached: false });
        break;
      }
    }
    return milestones;
  }, [weightLost, profile]);

  const MacroDisplay = ({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) => (
    <div className="bg-[var(--card)] border p-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-lg font-bold number-font">{Math.round(value)}</span>
        <span className="text-xs text-[var(--muted)]">/ {target}{unit}</span>
      </div>
      <div className="w-full h-1 bg-[var(--border)] mt-2">
        <div
          className={`h-full ${value > target ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`}
          style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-1">当前体重</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold number-font">{latestWeight.toFixed(1)}</span>
            <span className="text-xs text-[var(--muted)]">kg</span>
          </div>
        </div>
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-1">目标体重</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold number-font text-[var(--accent)]">{(profile?.targetWeightKg || 0).toFixed(1)}</span>
            <span className="text-xs text-[var(--muted)]">kg</span>
          </div>
        </div>
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-1">已减</div>
          <div className={`flex items-baseline gap-1 ${weightLost > 0 ? 'text-[var(--success)]' : ''}`}>
            <span className="text-2xl font-bold number-font">{weightLost > 0 ? weightLost.toFixed(1) : '0.0'}</span>
            <span className="text-xs text-[var(--muted)]">kg</span>
          </div>
        </div>
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-1">BMI</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold number-font">{results?.bmi.toFixed(1)}</span>
            <span className="text-xs text-[var(--muted)]">{results ? (results.bmi < 24 ? '正常' : '偏重') : ''}</span>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-[var(--card)] border p-4 space-y-3">
        <ProgressBar
          current={weightLost}
          target={profile?.currentWeightKg ? profile.currentWeightKg - profile.targetWeightKg : 1}
          label="体重进度"
          color="var(--accent)"
        />
        <ProgressBar
          current={elapsedDays}
          target={totalDays}
          label="时间进度"
          color="var(--warning)"
        />
        <div className="text-xs text-[var(--muted)] text-right">
          剩余 {daysLeft} 天 · 预计 {results?.estimatedEndDate || ''} 完成
        </div>
      </div>

      {/* Calories + Macros */}
      <CaloriesCard consumed={todayCalories} target={results?.dailyCalorieTarget || 2000} burned={todayBurned} />

      <div className="grid grid-cols-3 gap-3">
        <MacroDisplay label="蛋白质" value={todayProtein} target={results?.proteinMax || 120} unit="g" />
        <MacroDisplay label="碳水" value={todayFoods.reduce((s, f) => s + f.carbs, 0)} target={Math.round((results?.dailyCalorieTarget || 2000) * 0.45 / 4)} unit="g" />
        <MacroDisplay label="脂肪" value={todayFoods.reduce((s, f) => s + f.fat, 0)} target={Math.round((results?.dailyCalorieTarget || 2000) * 0.25 / 9)} unit="g" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => router.push('/nutrition')}
          className="bg-[var(--card)] border p-4 flex flex-col items-center gap-2 hover:border-[var(--accent)] transition-colors"
        >
          <Apple size={22} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="text-xs">添加食物</span>
        </button>
        <button
          onClick={() => router.push('/exercise')}
          className="bg-[var(--card)] border p-4 flex flex-col items-center gap-2 hover:border-[var(--accent)] transition-colors"
        >
          <Dumbbell size={22} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="text-xs">记录运动</span>
        </button>
        <button
          onClick={() => router.push('/progress')}
          className="bg-[var(--card)] border p-4 flex flex-col items-center gap-2 hover:border-[var(--accent)] transition-colors"
        >
          <Weight size={22} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="text-xs">记录体重</span>
        </button>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="bg-[var(--card)] border p-4">
          <div className="text-xs text-[var(--muted)] tracking-wider uppercase mb-3">里程碑</div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {milestones.map((m) => (
              <div
                key={m.kg}
                className={`text-center py-2 border text-xs ${
                  m.reached
                    ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {m.kg}kg
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty states */}
      {todayFoods.length === 0 && todayExercise.length === 0 && (
        <div className="bg-[var(--card)] border p-8 text-center">
          <TrendingUp size={32} strokeWidth={1.5} className="mx-auto mb-3 text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">今天还没有记录</p>
          <p className="text-xs text-[var(--muted)] mt-1">开始添加饮食和运动吧</p>
        </div>
      )}
    </div>
  );
}
