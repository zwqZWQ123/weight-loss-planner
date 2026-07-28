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
import { getCurrentUser, getUserDataKey } from '@/lib/auth';

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

export const useStore = create<AppState>()((set, get) => ({
  profile: null,
  results: null,
  planStartDate: '',
  weekPlans: [],
  foodEntries: {},
  exerciseLogs: {},
  weightLogs: {},
  theme: 'dark',

  setProfile: (profile: UserProfile) => {
    const results = computeResults(profile);
    const weekPlans = generatePlan(profile.planDurationWeeks);
    set({ profile, results, planStartDate: getToday(), weekPlans });
    autoSave(get());
  },

  addFoodEntry: (entry: FoodEntry) => {
    const { foodEntries } = get();
    const date = entry.date;
    set({ foodEntries: { ...foodEntries, [date]: [...(foodEntries[date] || []), entry] } });
    autoSave(get());
  },

  removeFoodEntry: (date: string, id: string) => {
    const { foodEntries } = get();
    set({ foodEntries: { ...foodEntries, [date]: (foodEntries[date] || []).filter((e) => e.id !== id) } });
    autoSave(get());
  },

  toggleExercise: (date: string, id: string) => {
    const { exerciseLogs } = get();
    set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).map((l) => l.id === id ? { ...l, completed: !l.completed } : l) } });
    autoSave(get());
  },

  addExerciseLog: (log: ExerciseLog) => {
    const { exerciseLogs } = get();
    const date = log.date;
    set({ exerciseLogs: { ...exerciseLogs, [date]: [...(exerciseLogs[date] || []), log] } });
    autoSave(get());
  },

  removeExerciseLog: (date: string, id: string) => {
    const { exerciseLogs } = get();
    set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).filter((e) => e.id !== id) } });
    autoSave(get());
  },

  updateExerciseLog: (date: string, id: string, updates: Partial<ExerciseLog>) => {
    const { exerciseLogs } = get();
    set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).map((l) => l.id === id ? { ...l, ...updates } : l) } });
    autoSave(get());
  },

  recordWeight: (log: WeightLog) => {
    const { weightLogs } = get();
    set({ weightLogs: { ...weightLogs, [log.date]: log } });
    autoSave(get());
  },

  toggleTheme: () => {
    set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
    autoSave(get());
  },

  resetPlan: () => {
    set({ profile: null, results: null, planStartDate: '', weekPlans: [], foodEntries: {}, exerciseLogs: {}, weightLogs: {} });
    autoSave(get());
  },

  exportData: () => {
    const s = get();
    return JSON.stringify({ profile: s.profile, results: s.results, planStartDate: s.planStartDate, weekPlans: s.weekPlans, foodEntries: s.foodEntries, exerciseLogs: s.exerciseLogs, weightLogs: s.weightLogs }, null, 2);
  },

  importData: (json: string) => {
    try {
      const data = JSON.parse(json);
      set({ ...data, theme: get().theme });
      autoSave(get());
    } catch { throw new Error('导入数据格式不正确'); }
  },
}));

// ---- Persistence bridge ----
// No zustand persist (race condition with user scoping).
// Instead: every mutation calls autoSave() which writes to user-scoped localStorage key.

function getPersistenceKey() {
  const user = getCurrentUser();
  return user ? `wlp-data-${user}` : null;
}

function autoSave(state: AppState) {
  const key = getPersistenceKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch { /* quota exceeded, silent */ }
}

/** Load persisted data for the current user into the store */
export function loadUserData() {
  useStore.setState({ theme: 'dark', profile: null, results: null, planStartDate: '', weekPlans: [], foodEntries: {}, exerciseLogs: {}, weightLogs: {} });
  const user = getCurrentUser();
  if (!user) return;
  try {
    const raw = localStorage.getItem(`wlp-data-${user}`);
    if (raw) {
      const data = JSON.parse(raw);
      useStore.setState({
        profile: data.profile ?? null,
        results: data.results ?? null,
        planStartDate: data.planStartDate ?? '',
        weekPlans: data.weekPlans ?? [],
        foodEntries: data.foodEntries ?? {},
        exerciseLogs: data.exerciseLogs ?? {},
        weightLogs: data.weightLogs ?? {},
        theme: data.theme ?? 'dark',
      });
    }
  } catch { /* corrupted data, start fresh */ }
}
