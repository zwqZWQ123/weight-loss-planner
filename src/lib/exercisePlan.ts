import { WeekPlan, DayPlan, StrengthExercise } from './types';

const STRENGTH_ROUTINE_A: StrengthExercise[] = [
  { name: '深蹲', sets: 3, reps: 12 },
  { name: '俯卧撑', sets: 3, reps: 10 },
  { name: '弓步蹲', sets: 3, reps: 10, notes: '每侧' },
  { name: '平板支撑', sets: 3, reps: 1, notes: '30-45秒' },
];

const STRENGTH_ROUTINE_B: StrengthExercise[] = [
  { name: '哑铃推举', sets: 3, reps: 12 },
  { name: '引体向上/划船', sets: 3, reps: 8 },
  { name: '臀桥', sets: 3, reps: 12 },
  { name: '哑铃弯举', sets: 3, reps: 12 },
  { name: '侧平板支撑', sets: 3, reps: 1, notes: '每侧30秒' },
];

function getWeekPlan(weekNumber: number): DayPlan[] {
  const baseDuration = 30 + Math.min(weekNumber, 6) * 3;
  const runDuration = Math.min(baseDuration, 50);

  return [
    {
      dayOfWeek: 1,
      type: 'run',
      name: '跑步',
      description: '轻松跑',
      durationMinutes: runDuration,
      suggestedPace: "6'30\" /km",
    },
    {
      dayOfWeek: 2,
      type: 'strength',
      name: '力量训练 A',
      description: '复合动作日',
      durationMinutes: 40,
      exercises: STRENGTH_ROUTINE_A,
    },
    {
      dayOfWeek: 3,
      type: 'run',
      name: '跑步',
      description: '间歇或配速跑',
      durationMinutes: runDuration - 5,
      suggestedPace: "6'00\" /km",
    },
    {
      dayOfWeek: 4,
      type: 'basketball',
      name: '篮球',
      description: '实战或投篮训练',
      durationMinutes: 60,
    },
    {
      dayOfWeek: 5,
      type: 'strength',
      name: '力量训练 B',
      description: '上肢与核心',
      durationMinutes: 40,
      exercises: STRENGTH_ROUTINE_B,
    },
    {
      dayOfWeek: 6,
      type: 'run',
      name: '跑步',
      description: '长距离慢跑',
      durationMinutes: runDuration + 10,
      suggestedPace: "7'00\" /km",
    },
    {
      dayOfWeek: 0,
      type: 'rest',
      name: '休息',
      description: '主动恢复日 - 拉伸或散步',
      durationMinutes: 0,
    },
  ];
}

export function generatePlan(weeks: number): WeekPlan[] {
  return Array.from({ length: weeks }, (_, i) => ({
    weekNumber: i + 1,
    days: getWeekPlan(i + 1),
  }));
}

export function getCurrentWeekIndex(startDate: Date, weekOffset: number = 0): number {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const week = Math.floor(diffDays / 7) + weekOffset;
  return Math.max(0, Math.min(week, 15));
}
