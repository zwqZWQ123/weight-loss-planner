'use client';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  color?: string;
}

export function ProgressBar({ current, target, label, color }: ProgressBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-bold number-font">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--border)]">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: color || 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
