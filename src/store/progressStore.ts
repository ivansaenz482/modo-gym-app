import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProgressEntry = { date: string; weight: number; height: number; daysTrained?: number };
export type BodyPartSession = { date: string; parts: string[] };
export type ExerciseLogEntry = {
  id: string;
  date: string;
  exerciseId: string;
  name: string;
  section: string;
  category: string;
  kcal: number;
  durationMin?: number;
  sets?: number;
  reps?: number;
  weightKg?: number;
};
type State = {
  history: ProgressEntry[];
  bodyParts: Record<string, number>;
  sessions: BodyPartSession[];
  calories: Record<string, number>;
  exerciseLog: ExerciseLogEntry[];
  addEntry: (e: ProgressEntry) => Promise<void>;
  logBodyParts: (parts: string[]) => Promise<void>;
  addCalories: (kcal: number) => Promise<void>;
  logExercise: (e: Omit<ExerciseLogEntry, 'id' | 'date'>) => Promise<void>;
  load: () => Promise<void>;
  getLatest: () => ProgressEntry | null;
  getMessage: () => string;
};

const K = '@modo_progress';
const K_BP = '@modo_bodyparts';
const K_CAL = '@modo_calories';
const K_LOG = '@modo_exercise_log';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export const useProgressStore = create<State>((set, get) => ({
  history: [],
  bodyParts: {},
  sessions: [],
  calories: {},
  exerciseLog: [],
  load: async () => {
    const [raw, bp, cal, log] = await Promise.all([AsyncStorage.getItem(K), AsyncStorage.getItem(K_BP), AsyncStorage.getItem(K_CAL), AsyncStorage.getItem(K_LOG)]);
    if (raw) set({ history: JSON.parse(raw) });
    if (bp) {
      const d = JSON.parse(bp);
      set({ bodyParts: d.counts || {}, sessions: d.sessions || [] });
    }
    if (cal) set({ calories: JSON.parse(cal) });
    if (log) set({ exerciseLog: JSON.parse(log) });
  },
  addEntry: async (e) => {
    const next = [...get().history, e];
    await AsyncStorage.setItem(K, JSON.stringify(next));
    set({ history: next });
  },
  logBodyParts: async (parts) => {
    const unique = Array.from(new Set(parts.map((p) => p.toLowerCase().trim()).filter(Boolean)));
    if (unique.length === 0) return;
    const counts = { ...get().bodyParts };
    unique.forEach((p) => { counts[p] = (counts[p] || 0) + 1; });
    const sessions = [...get().sessions, { date: new Date().toISOString(), parts: unique }];
    await AsyncStorage.setItem(K_BP, JSON.stringify({ counts, sessions }));
    set({ bodyParts: counts, sessions });
  },
  addCalories: async (kcal) => {
    if (!kcal || kcal <= 0) return;
    const key = todayKey();
    const next = { ...get().calories, [key]: (get().calories[key] || 0) + kcal };
    await AsyncStorage.setItem(K_CAL, JSON.stringify(next));
    set({ calories: next });
  },
  logExercise: async (e) => {
    const entry: ExerciseLogEntry = {
      ...e,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
    };
    const next = [entry, ...get().exerciseLog].slice(0, 1000);
    await AsyncStorage.setItem(K_LOG, JSON.stringify(next));
    set({ exerciseLog: next });
  },
  getLatest: () => {
    const h = get().history;
    return h.length ? h[h.length - 1] : null;
  },
  getMessage: () => {
    const h = get().history;
    if (h.length < 2) return '¡Registra tu peso cada semana para ver tu progreso! 💪';
    const diff = h[h.length - 1].weight - h[0].weight;
    if (diff < -1) return `¡Increíble! Has bajado ${Math.abs(diff).toFixed(1)} kg 🎉 Sigue así, tu mente y corazón están ganando.`;
    if (diff > 1) return `Has subido ${diff.toFixed(1)} kg. Si tu objetivo es volumen, ¡vas bien! Si es definición, ajustemos dieta y cardio.`;
    if (Math.abs(diff) < 0.3) return 'Peso estable. ¡No te desanimes! Ajusta 100 kcal y aumenta esfuerzo esta semana. MODO-GYM te respalda.';
    return `Progreso: ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg desde el inicio. ¡Sigue fuerte!`;
  },
}));
