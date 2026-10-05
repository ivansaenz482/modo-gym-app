export type Goal = 'perder_peso' | 'ganar_musculo' | 'definir' | 'resistencia' | 'mantener';
export type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
export type GymLevel = 'principiante' | 'intermedio' | 'pro';

export const GYM_LEVELS: { id: GymLevel; label: string; emoji: string; desc: string }[] = [
  { id: 'principiante', label: 'Principiante', emoji: '🌱', desc: 'Menos de 6 meses' },
  { id: 'intermedio', label: 'Intermedio', emoji: '💪', desc: '6 meses a 2 años' },
  { id: 'pro', label: 'Modo Pro', emoji: '🔥', desc: 'Más de 2 años' },
];

// Cantidad de ejercicios por día según el nivel
export function exercisesPerDay(level: GymLevel): number {
  if (level === 'pro') return 9;
  if (level === 'intermedio') return 7;
  return 5;
}

export function gymLevelLabel(level?: GymLevel): string {
  return GYM_LEVELS.find((l) => l.id === level)?.label ?? 'Principiante';
}

export function calculateBMI(weight: number, heightCm: number) {
  const h = heightCm / 100;
  return +(weight / (h * h)).toFixed(1);
}
export function bmiCategory(bmi: number) {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}
export function calculateBMR(weight: number, heightCm: number, age: number, sex: 'M' | 'F') {
  if (sex === 'M') return 88.362 + 13.397 * weight + 4.799 * heightCm - 5.677 * age;
  return 447.593 + 9.247 * weight + 3.098 * heightCm - 4.33 * age;
}
export function calculateTDEE(bmr: number, level: ActivityLevel) {
  const map: Record<ActivityLevel, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9,
  };
  return Math.round(bmr * map[level]);
}
export function caloriesForGoal(tdee: number, goal: Goal) {
  switch (goal) {
    case 'perder_peso': return tdee - 500;
    case 'ganar_musculo': return tdee + 350;
    case 'definir': return tdee - 250;
    case 'resistencia': return tdee + 150;
    default: return tdee;
  }
}
