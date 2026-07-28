export interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  planDurationWeeks: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  exerciseHabits?: string;
}

export interface ComputedResults {
  bmi: number;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  weeklyWeightLossKg: number;
  totalWeightLossKg: number;
  estimatedEndDate: string;
  proteinMin: number;
  proteinMax: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  timestamp: string;
  date: string;
}

export type ExerciseType = 'run' | 'basketball' | 'strength' | 'rest';

export interface ExerciseLog {
  id: string;
  date: string;
  dayOfWeek: number;
  type: ExerciseType;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
  completed: boolean;
  notes?: string;
}

export interface WeightLog {
  date: string;
  weightKg: number;
  waistCm?: number;
}

export interface StrengthExercise {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
}

export interface DayPlan {
  dayOfWeek: number;
  type: ExerciseType;
  name: string;
  description: string;
  durationMinutes: number;
  suggestedPace?: string;
  exercises?: StrengthExercise[];
}

export interface WeekPlan {
  weekNumber: number;
  days: DayPlan[];
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  category: string;
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealBreakdown: Record<MealType, { calories: number; protein: number; carbs: number; fat: number }>;
}
