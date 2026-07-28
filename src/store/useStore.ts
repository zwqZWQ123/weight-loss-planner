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
import { getToday, getStartOfWeek } from '@/lib/utils';

interface AppState {
  // User profile
  profile: UserProfile | null;
  results: ComputedResults | null;

  // Start date of plan
  planStartDate: string;

  // Exercise plan
  weekPlans: WeekPlan[];

  // Daily logs
  foodEntries: Record<string, FoodEntry[]>;
  exerciseLogs: Record<string, ExerciseLog[]>;

  // Weight tracking
  weightLogs: Record<string, WeightLog>;

  // Theme
  theme: 'dark' | 'light';

  // Actions
  setProfile: (profile: UserProfile) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (date: string, id: string) => void;
  toggleExercise: (date: string, id: string) => void;
  addExerciseLog: (log: ExerciseLog) => void;
  removeExerciseLog: (date: string, id: string) => void;
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
        set({
          profile,
          results,
          planStartDate: getToday(),
          weekPlans,
        });
      },

      addFoodEntry: (entry: FoodEntry) => {
        const { foodEntries } = get();
        const date = entry.date;
        const existing = foodEntries[date] || [];
        set({
          foodEntries: {
            ...foodEntries,
            [date]: [...existing, entry],
          },
        });
      },

      removeFoodEntry: (date: string, id: string) => {
        const { foodEntries } = get();
        const entries = (foodEntries[date] || []).filter((e) => e.id !== id);
        set({
          foodEntries: {
            ...foodEntries,
            [date]: entries,
          },
        });
      },

      toggleExercise: (date: string, id: string) => {
        const { exerciseLogs } = get();
        const logs = (exerciseLogs[date] || []).map((log) =>
          log.id === id ? { ...log, completed: !log.completed } : log
        );
        set({
          exerciseLogs: {
            ...exerciseLogs,
            [date]: logs,
          },
        });
      },

      addExerciseLog: (log: ExerciseLog) => {
        const { exerciseLogs } = get();
        const date = log.date;
        const existing = exerciseLogs[date] || [];
        set({
          exerciseLogs: {
            ...exerciseLogs,
            [date]: [...existing, log],
          },
        });
      },

      removeExerciseLog: (date: string, id: string) => {
        const { exerciseLogs } = get();
        const logs = (exerciseLogs[date] || []).filter((e) => e.id !== id);
        set({
          exerciseLogs: {
            ...exerciseLogs,
            [date]: logs,
          },
        });
      },

      recordWeight: (log: WeightLog) => {
        const { weightLogs } = get();
        set({
          weightLogs: {
            ...weightLogs,
            [log.date]: log,
          },
        });
      },

      toggleTheme: () => {
        const { theme } = get();
        const next = theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
      },

      resetPlan: () => {
        set({
          profile: null,
          results: null,
          planStartDate: '',
          weekPlans: [],
          foodEntries: {},
          exerciseLogs: {},
          weightLogs: {},
        });
      },

      exportData: () => {
        const state = get();
        const exportObj = {
          profile: state.profile,
          results: state.results,
          planStartDate: state.planStartDate,
          weekPlans: state.weekPlans,
          foodEntries: state.foodEntries,
          exerciseLogs: state.exerciseLogs,
          weightLogs: state.weightLogs,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (json: string) => {
        try {
          const data = JSON.parse(json);
          set({
            ...data,
            theme: get().theme,
          });
        } catch {
          throw new Error('导入数据格式不正确');
        }
      },
    }),
    {
      name: 'weight-loss-planner-storage',
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
