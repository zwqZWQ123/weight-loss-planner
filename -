'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { UserProfile } from '@/lib/types';
import { getActivityLevelLabel } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const setProfile = useStore((s) => s.setProfile);
  const profile = useStore((s) => s.profile);

  const [form, setForm] = useState<Partial<UserProfile>>(
    profile || {
      gender: 'male',
      age: 28,
      heightCm: 175,
      currentWeightKg: 80,
      targetWeightKg: 70,
      planDurationWeeks: 8,
      activityLevel: 'moderate',
      exerciseHabits: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.age || form.age < 10 || form.age > 100) errs.age = '请输入有效年龄 (10-100)';
    if (!form.heightCm || form.heightCm < 100 || form.heightCm > 250) errs.heightCm = '请输入有效身高 (100-250cm)';
    if (!form.currentWeightKg || form.currentWeightKg < 30 || form.currentWeightKg > 300) errs.currentWeightKg = '请输入有效体重 (30-300kg)';
    if (!form.targetWeightKg || form.targetWeightKg < 20 || form.targetWeightKg >= (form.currentWeightKg || 0)) errs.targetWeightKg = '目标体重需小于当前体重';
    if (!form.planDurationWeeks || form.planDurationWeeks < 4 || form.planDurationWeeks > 16) errs.planDurationWeeks = '计划时长 4-16 周';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const p: UserProfile = {
      gender: form.gender as 'male' | 'female',
      age: form.age!,
      heightCm: form.heightCm!,
      currentWeightKg: form.currentWeightKg!,
      targetWeightKg: form.targetWeightKg!,
      planDurationWeeks: form.planDurationWeeks!,
      activityLevel: form.activityLevel as UserProfile['activityLevel'],
      exerciseHabits: form.exerciseHabits || '',
    };

    setProfile(p);
    router.push('/dashboard');
  };

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const inputClass = "w-full bg-transparent border px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] transition-colors number-font";
  const labelClass = "text-xs tracking-wider text-[var(--muted)] uppercase";
  const errorClass = "text-xs text-[var(--danger)] mt-1";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-[var(--accent)] mx-auto mb-4 flex items-center justify-center">
            <span className="text-black font-bold text-lg">W</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">减重计划</h1>
          <p className="text-sm text-[var(--muted)] mt-1">输入身体数据，生成个性化方案</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>性别</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {(['male', 'female'] as const).map((g) => (
                <button key={g} type="button" onClick={() => update('gender', g)}
                  className={`py-2.5 text-sm border transition-colors ${
                    form.gender === g
                      ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-semibold'
                      : 'bg-transparent text-[var(--foreground)] border-[var(--border)] hover:border-[var(--muted)]'
                  }`}>
                  {g === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>年龄</label>
              <input type="number" value={form.age || ''} onChange={(e) => update('age', Number(e.target.value))} className={inputClass} placeholder="岁" />
              {errors.age && <p className={errorClass}>{errors.age}</p>}
            </div>
            <div>
              <label className={labelClass}>身高 (cm)</label>
              <input type="number" step="0.1" value={form.heightCm || ''} onChange={(e) => update('heightCm', Number(e.target.value))} className={inputClass} placeholder="cm" />
              {errors.heightCm && <p className={errorClass}>{errors.heightCm}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>当前体重 (kg)</label>
              <input type="number" step="0.1" value={form.currentWeightKg || ''} onChange={(e) => update('currentWeightKg', Number(e.target.value))} className={inputClass} placeholder="kg" />
              {errors.currentWeightKg && <p className={errorClass}>{errors.currentWeightKg}</p>}
            </div>
            <div>
              <label className={labelClass}>目标体重 (kg)</label>
              <input type="number" step="0.1" value={form.targetWeightKg || ''} onChange={(e) => update('targetWeightKg', Number(e.target.value))} className={inputClass} placeholder="kg" />
              {errors.targetWeightKg && <p className={errorClass}>{errors.targetWeightKg}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>计划时长: <span className="text-[var(--accent)] font-bold">{form.planDurationWeeks}</span> 周</label>
            <input type="range" min={4} max={16} value={form.planDurationWeeks || 8} onChange={(e) => update('planDurationWeeks', Number(e.target.value))} className="w-full mt-1.5 accent-[var(--accent)]" />
            <div className="flex justify-between text-xs text-[var(--muted)] mt-1"><span>4 周</span><span>16 周</span></div>
          </div>

          <div>
            <label className={labelClass}>活动水平</label>
            <select value={form.activityLevel} onChange={(e) => update('activityLevel', e.target.value as UserProfile['activityLevel'])} className={inputClass}>
              {(['sedentary', 'light', 'moderate', 'active'] as const).map((l) => (
                <option key={l} value={l}>{getActivityLevelLabel(l)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>运动习惯（可选）</label>
            <textarea value={form.exerciseHabits || ''} onChange={(e) => update('exerciseHabits', e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="如：每周跑步3次 + 篮球1-2次" />
          </div>

          <button type="submit" className="w-full py-3 bg-[var(--accent)] text-black font-semibold text-sm hover:brightness-110 transition-all tracking-wider">
            生成我的计划
          </button>
        </form>
      </div>
    </div>
  );
}
