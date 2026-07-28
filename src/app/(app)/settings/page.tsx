'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Sun, Moon, Download, Upload, RotateCcw, User, Activity } from 'lucide-react';
import { getActivityLevelLabel } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const results = useStore((s) => s.results);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const resetPlan = useStore((s) => s.resetPlan);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const setProfile = useStore((s) => s.setProfile);

  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState('');

  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weight-loss-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('数据已导出');
    setTimeout(() => setMessage(''), 2000);
  }

  function handleImport() {
    try {
      importData(importText);
      setMessage('数据已导入');
      setShowImport(false);
      setImportText('');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('导入失败，请检查数据格式');
    }
  }

  function handleReset() {
    resetPlan();
    router.push('/');
  }

  if (!profile || !results) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[var(--muted)]">请先完成数据录入</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-lg font-bold tracking-tight">设置</h1>

      {/* User Profile Summary */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center gap-3 mb-3">
          <User size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="text-xs tracking-wider uppercase font-semibold">个人信息</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-[var(--muted)]">性别</span>
            <div>{profile.gender === 'male' ? '男' : '女'}</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">年龄</span>
            <div>{profile.age} 岁</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">身高</span>
            <div>{profile.heightCm} cm</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">活动水平</span>
            <div>{getActivityLevelLabel(profile.activityLevel)}</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">当前体重</span>
            <div>{profile.currentWeightKg} kg</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">目标体重</span>
            <div>{profile.targetWeightKg} kg</div>
          </div>
        </div>
      </div>

      {/* Computed Results */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Activity size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="text-xs tracking-wider uppercase font-semibold">计算结果</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-xs text-[var(--muted)]">BMI</span>
            <div className="font-bold number-font">{results.bmi}</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">BMR</span>
            <div className="font-bold number-font">{results.bmr}</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">TDEE</span>
            <div className="font-bold number-font">{results.tdee}</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">每日热量</span>
            <div className="font-bold number-font text-[var(--accent)]">{results.dailyCalorieTarget}</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">每周减重</span>
            <div className="font-bold number-font">{results.weeklyWeightLossKg} kg</div>
          </div>
          <div>
            <span className="text-xs text-[var(--muted)]">蛋白质</span>
            <div className="font-bold number-font">{results.proteinMin}-{results.proteinMax}g</div>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            <span className="text-sm">主题模式</span>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 border text-sm hover:border-[var(--accent)] transition-colors"
          >
            {theme === 'dark' ? '浅色模式' : '深色模式'}
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Download size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="text-xs tracking-wider uppercase font-semibold">数据导出</span>
        </div>
        <button onClick={handleExport} className="w-full py-2.5 border text-sm hover:border-[var(--accent)] transition-colors">
          导出为 JSON
        </button>
      </div>

      {/* Import */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Upload size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="text-xs tracking-wider uppercase font-semibold">数据导入</span>
        </div>
        {!showImport ? (
          <button onClick={() => setShowImport(true)} className="w-full py-2.5 border text-sm hover:border-[var(--accent)] transition-colors">
            粘贴备份数据导入
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full bg-transparent border px-3 py-2 text-xs font-mono focus:border-[var(--accent)] h-24 resize-none"
              placeholder="粘贴 JSON 数据..."
            />
            <div className="flex gap-2">
              <button onClick={handleImport} className="flex-1 py-2 bg-[var(--accent)] text-black text-sm font-semibold">
                导入
              </button>
              <button onClick={() => setShowImport(false)} className="px-4 py-2 border text-sm">取消</button>
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="bg-[var(--card)] border p-4">
        <div className="flex items-center gap-3 mb-3">
          <RotateCcw size={18} strokeWidth={1.5} className="text-[var(--danger)]" />
          <span className="text-xs tracking-wider uppercase font-semibold text-[var(--danger)]">重置计划</span>
        </div>
        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)} className="w-full py-2.5 border border-[var(--danger)] text-[var(--danger)] text-sm hover:bg-[var(--danger)]/10 transition-colors">
            清空所有数据并重置
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-[var(--danger)]">确定要清空所有数据吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex-1 py-2 bg-[var(--danger)] text-white text-sm font-semibold">
                确认重置
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 border text-sm">取消</button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {message && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-black px-4 py-2 text-sm font-semibold z-50">
          {message}
        </div>
      )}
    </div>
  );
}
