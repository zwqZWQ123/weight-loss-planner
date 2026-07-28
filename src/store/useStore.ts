'use client';

import { create } from 'zustand';
import {
  UserProfile,
  ComputedResults,
  FoodEntry,
  ExerciseLog,
  WeightLog,
  WeekPlan,
} from '@/lib/types';
import { computeResults } from '@/lib/calculations';
import { generatePlan } from '@/lib/exercisePlan';
import { getToday } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';

interface AppState {
  profile: UserProfile | null;
  results: ComputedResults | null;
  planStartDate: string;
  weekPlans: WeekPlan[];
  foodEntries: Record<string, FoodEntry[]>;
  exerciseLogs: Record<string, ExerciseLog[]>;
  weightLogs: Record<string, WeightLog>;
  theme: 'dark' | 'light';

  setProfile: (profile: UserProfile) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (date: string, id: string) => void;
  toggleExercise: (date: string, id: string) => void;
  addExerciseLog: (log: ExerciseLog) => void;
  removeExerciseLog: (date: string, id: string) => void;
  updateExerciseLog: (date: string, id: string, updates: Partial<ExerciseLog>) => void;
  recordWeight: (log: WeightLog) => void;
  toggleTheme: () => void;
  resetPlan: () => void;
  exportData: () => string;
  importData: (json: string) => void;
}

/** Get the localStorage key for the current user (synchronous, called at module init) */
function getKey(): string | null {
  try {
    const user = getCurrentUser();
    return user ? `wlp-data-${user}` : null;
  } catch { return null; }
}

/** Read persisted state from localStorage (synchronous) */
function readState() {
  const key = getKey();
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Write state to localStorage */
function writeState(state: AppState) {
  const key = getKey();
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
}

// ---- Initialize store synchronously from persisted data ----
const persisted = readState();

export const useStore = create<AppState>()((set, get) => ({
  profile: persisted?.profile ?? null,
  results: persisted?.results ?? null,
  planStartDate: persisted?.planStartDate ?? '',
  weekPlans: persisted?.weekPlans ?? [],
  foodEntries: persisted?.foodEntries ?? {},
  exerciseLogs: persisted?.exerciseLogs ?? {},
  weightLogs: persisted?.weightLogs ?? {},
  theme: persisted?.theme ?? 'dark',

  setProfile: (profile: UserProfile) => {
    const results = computeResults(profile);
    const weekPlans = generatePlan(profile.planDurationWeeks);
    set({ profile, results, planStartDate: getToday(), weekPlans });
    writeState(get());
  },

  addFoodEntry: (entry: FoodEntry) => {
    const { foodEntries } = get();
    const date = entry.date;
    set({ foodEntries: { ...foodEntries, [date]: [...(foodEntries[date] || []), entry] } });
    writeState(get());
  },

  removeFoodEntry: (date: string, id: string) => {
    const { foodEntries } = get();
    set({ foodEntries: { ...foodEntries, [date]: (foodEntries[date] || []).filter((e) => e.id !== id) } });
    writeState(get());
  },

  toggleExercise: (date: string, id: string) => {
    const { exerciseLogs } = get();
    set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).map((l) => l.id === id ? { ...l, completed: !l.completed } : l) } });
    writeState(get());
  },

  addExerciseLog: (log: ExerciseLog) => {
    const { exerciseLogs } = get();
    const date = log.date;
    set({ exerciseLogs: { ...exerciseLogs, [date]: [...(exerciseLogs[date] || []), log] } });
    writeState(get());
  },

  removeExerciseLog: (date: string, id: string) => {
    const { exerciseLogs } = get();
    set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).filter((e) => e.id !== id) } });
    writeState(get());
  },

  updateExerciseLog: (date: string, id: string, updates: Partial<ExerciseLog>) => {
    const { exerciseLogs } = get();
    set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).map((l) => l.id === id ? { ...l, ...updates } : l) } });
    writeState(get());
  },

  recordWeight: (log: WeightLog) => {
    const { weightLogs } = get();
    set({ weightLogs: { ...weightLogs, [log.date]: log } });
    writeState(get());
  },

  toggleTheme: () => {
    set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
    writeState(get());
  },

  resetPlan: () => {
    set({ profile: null, results: null, planStartDate: '', weekPlans: [], foodEntries: {}, exerciseLogs: {}, weightLogs: {} });
    writeState(get());
  },

  exportData: () => {
    const s = get();
    return JSON.stringify({ profile: s.profile, results: s.results, planStartDate: s.planStartDate, weekPlans: s.weekPlans, foodEntries: s.foodEntries, exerciseLogs: s.exerciseLogs, weightLogs: s.weightLogs }, null, 2);
  },

  importData: (json: string) => {
    try {
      const data = JSON.parse(json);
      set({ ...data, theme: get().theme });
      writeState(get());
    } catch { throw new Error('导入数据格式不正确'); }
  },
}));
