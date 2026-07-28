import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekNumber(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startDate.getDay() + 1) / 7);
}

export function getChineseDayName(dayOfWeek: number): string {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return days[dayOfWeek] || '';
}

export function getMealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  return labels[type] || type;
}

export function getExerciseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    run: '跑步',
    basketball: '篮球',
    strength: '力量训练',
    rest: '休息',
  };
  return labels[type] || type;
}

export function getActivityLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    sedentary: '久坐',
    light: '轻度运动',
    moderate: '中度运动',
    active: '高度运动',
  };
  return labels[level] || level;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
