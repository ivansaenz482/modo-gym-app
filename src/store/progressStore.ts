import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProgressEntry = { date: string; weight: number; height: number; daysTrained?: number };
export type BodyPartSession = { date: string; parts: string[] };
type State = {
  history: ProgressEntry[];
  bodyParts: Record<string, number>;
  sessions: BodyPartSession[];
  addEntry: (e: ProgressEntry) => Promise<void>;
  logBodyParts: (parts: string[]) => Promise<void>;
  load: () => Promise<void>;
  getLatest: () => ProgressEntry | null;
  getMessage: () => string;
};

const K = '@modo_progress';
const K_BP = '@modo_bodyparts';

export const useProgressStore = create<State>((set, get) => ({
  history: [],
  bodyParts: {},
  sessions: [],
  load: async () => {
    const [raw, bp] = await Promise.all([AsyncStorage.getItem(K), AsyncStorage.getItem(K_BP)]);
    if (raw) set({ history: JSON.parse(raw) });
    if (bp) {
      const d = JSON.parse(bp);
      set({ bodyParts: d.counts || {}, sessions: d.sessions || [] });
    }
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
