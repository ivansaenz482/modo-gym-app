import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProgressEntry = { date: string; weight: number; height: number; daysTrained?: number };
type State = {
  history: ProgressEntry[];
  addEntry: (e: ProgressEntry) => Promise<void>;
  load: () => Promise<void>;
  getLatest: () => ProgressEntry | null;
  getMessage: () => string;
};

const K = '@modo_progress';

export const useProgressStore = create<State>((set, get) => ({
  history: [],
  load: async () => {
    const raw = await AsyncStorage.getItem(K);
    if (raw) set({ history: JSON.parse(raw) });
  },
  addEntry: async (e) => {
    const next = [...get().history, e];
    await AsyncStorage.setItem(K, JSON.stringify(next));
    set({ history: next });
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
