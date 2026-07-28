import { UserProfile, ComputedResults } from './types';

const ACTIVITY_FACTORS: Record<UserProfile['activityLevel'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateBMR(
  gender: 'male' | 'female',
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel]);
}

export function calculateDailyCalorieTarget(
  tdee: number,
  totalDeficit: number,
  planDurationWeeks: number
): number {
  const totalDays = planDurationWeeks * 7;
  const dailyDeficit = Math.round(totalDeficit / totalDays);
  const clampedDeficit = Math.max(400, Math.min(1000, dailyDeficit));
  return Math.round(tdee - clampedDeficit);
}

export function calculateProteinTarget(weightKg: number): { min: number; max: number } {
  return {
    min: Math.round(weightKg * 1.6),
    max: Math.round(weightKg * 2.0),
  };
}

export function computeResults(profile: UserProfile): ComputedResults {
  const bmi = calculateBMI(profile.currentWeightKg, profile.heightCm);
  const bmr = calculateBMR(profile.gender, profile.currentWeightKg, profile.heightCm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const totalWeightLossKg = Math.round((profile.currentWeightKg - profile.targetWeightKg) * 10) / 10;
  const weeklyWeightLossKg = Math.round((totalWeightLossKg / profile.planDurationWeeks) * 100) / 100;
  const totalDeficit = totalWeightLossKg * 7700;
  const dailyCalorieTarget = calculateDailyCalorieTarget(tdee, totalDeficit, profile.planDurationWeeks);
  const protein = calculateProteinTarget(profile.currentWeightKg);

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + profile.planDurationWeeks * 7);

  return {
    bmi,
    bmr,
    tdee,
    dailyCalorieTarget,
    weeklyWeightLossKg,
    totalWeightLossKg,
    estimatedEndDate: endDate.toISOString().split('T')[0],
    proteinMin: protein.min,
    proteinMax: protein.max,
  };
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return '偏瘦';
  if (bmi < 24) return '正常';
  if (bmi < 28) return '超重';
  return '肥胖';
}

export function estimateExerciseCalories(
  type: string,
  weightKg: number,
  durationMinutes: number
): number {
  // MET values for different exercises
  const METS: Record<string, number> = {
    run: 8.0,       // running 8 km/h
    basketball: 6.5,
    strength: 5.0,
    walk: 3.5,
  };

  const met = METS[type] || 4.0;
  return Math.round((met * 3.5 * weightKg * durationMinutes) / 200);
}
