'use client';

export function CaloriesCard({
  consumed,
  target,
  burned = 0,
}: {
  consumed: number;
  target: number;
  burned?: number;
}) {
  const remaining = target - consumed + burned;
  const progress = Math.min((consumed / target) * 100, 100);
  const isOver = consumed > target;

  return (
    <div className="bg-[var(--card)] border p-4">
      <div className="text-xs text-[var(--muted)] mb-2 tracking-wider uppercase">今日热量</div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-bold number-font">{consumed}</span>
        <span className="text-sm text-[var(--muted)]">/ {target} kcal</span>
      </div>

      <div className="w-full h-1.5 bg-[var(--border)] mb-3">
        <div
          className={`h-full transition-all duration-500 ${
            isOver ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>
          剩余{' '}
          <span className={`font-bold number-font ${remaining < 0 ? 'text-[var(--danger)]' : ''}`}>
            {remaining}
          </span>{' '}
          kcal
        </span>
        <span>
          运动 <span className="font-bold number-font">{burned}</span> kcal
        </span>
      </div>
    </div>
  );
}
