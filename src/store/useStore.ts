'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

function getPersistKey() {
  const user = getCurrentUser();
  return user ? getUserDataKey(user) : 'weight-loss-planner-storage';
}

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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      },

      addFoodEntry: (entry: FoodEntry) => {
        const { foodEntries } = get();
        const date = entry.date;
        set({ foodEntries: { ...foodEntries, [date]: [...(foodEntries[date] || []), entry] } });
      },

      removeFoodEntry: (date: string, id: string) => {
        const { foodEntries } = get();
        set({ foodEntries: { ...foodEntries, [date]: (foodEntries[date] || []).filter((e) => e.id !== id) } });
      },

      toggleExercise: (date: string, id: string) => {
        const { exerciseLogs } = get();
        set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).map((l) => l.id === id ? { ...l, completed: !l.completed } : l) } });
      },

      addExerciseLog: (log: ExerciseLog) => {
        const { exerciseLogs } = get();
        const date = log.date;
        set({ exerciseLogs: { ...exerciseLogs, [date]: [...(exerciseLogs[date] || []), log] } });
      },

      removeExerciseLog: (date: string, id: string) => {
        const { exerciseLogs } = get();
        set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).filter((e) => e.id !== id) } });
      },

      updateExerciseLog: (date: string, id: string, updates: Partial<ExerciseLog>) => {
        const { exerciseLogs } = get();
        set({ exerciseLogs: { ...exerciseLogs, [date]: (exerciseLogs[date] || []).map((l) => l.id === id ? { ...l, ...updates } : l) } });
      },

      recordWeight: (log: WeightLog) => {
        const { weightLogs } = get();
        set({ weightLogs: { ...weightLogs, [log.date]: log } });
      },

      toggleTheme: () => {
        set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
      },

      resetPlan: () => {
        set({ profile: null, results: null, planStartDate: '', weekPlans: [], foodEntries: {}, exerciseLogs: {}, weightLogs: {} });
      },

      exportData: () => {
        const s = get();
        return JSON.stringify({ profile: s.profile, results: s.results, planStartDate: s.planStartDate, weekPlans: s.weekPlans, foodEntries: s.foodEntries, exerciseLogs: s.exerciseLogs, weightLogs: s.weightLogs }, null, 2);
      },

      importData: (json: string) => {
        try {
          const data = JSON.parse(json);
          set({ ...data, theme: get().theme });
        } catch { throw new Error('导入数据格式不正确'); }
      },
    }),
    {
      name: 'wlp-store-v2',
      partialize: (state) => ({
        profile: state.profile,
        results: state.results,
        planStartDate: state.planStartDate,
        weekPlans: state.weekPlans,
        foodEntries: state.foodEntries,
        exerciseLogs: state.exerciseLogs,
        weightLogs: state.weightLogs,
        theme: state.theme,
      }),
    }
  )
);

// ---- User-scoped storage bridge ----
// Instead of using persist name per user (which doesn't work because name is frozen at module init),
// we use a fixed persist key and manually swap data on login/logout.

function getScopedState() {
  try {
    const raw = localStorage.getItem(getPersistKey());
    return raw ? JSON.parse(raw).state : null;
  } catch { return null; }
}

function persistScopedState(state: unknown) {
  try {
    const key = getPersistKey();
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing.state = state;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}
}

/** Call after login: migrate user-scoped data into the store */
export function loadUserData() {
  const scoped = getScopedState();
  if (scoped) {
    useStore.setState({ ...scoped, theme: useStore.getState().theme });
  } else {
    useStore.setState({ profile: null, results: null, planStartDate: '', weekPlans: [], foodEntries: {}, exerciseLogs: {}, weightLogs: {} });
  }
}

/** Call before logout: persist current store state to user-scoped key */
export function saveUserData() {
  const state = useStore.getState();
  persistScopedState({
    profile: state.profile,
    results: state.results,
    planStartDate: state.planStartDate,
    weekPlans: state.weekPlans,
    foodEntries: state.foodEntries,
    exerciseLogs: state.exerciseLogs,
    weightLogs: state.weightLogs,
    theme: state.theme,
  });
}
