import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BPEntry = { id: string; date: string; systolic: number; diastolic: number; pulse?: number };

type State = {
  steps: Record<string, number>;      // fecha (YYYY-MM-DD) -> pasos
  restingHR: Record<string, number>;  // fecha -> pulso en reposo (bpm)
  bp: BPEntry[];                      // historial de presión arterial
  source: 'manual' | 'health';
  addSteps: (n: number) => Promise<void>;
  setStepsToday: (n: number) => Promise<void>;
  setRestingHR: (bpm: number) => Promise<void>;
  addBP: (systolic: number, diastolic: number, pulse?: number) => Promise<void>;
  removeBP: (id: string) => Promise<void>;
  load: () => Promise<void>;
};

const KEY = '@modo_health';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useHealthStore = create<State>((set, get) => ({
  steps: {},
  restingHR: {},
  bp: [],
  source: 'manual',
  load: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      set({ steps: d.steps || {}, restingHR: d.restingHR || {}, bp: d.bp || [], source: d.source || 'manual' });
    }
  },
  addSteps: async (n) => {
    if (!n || n <= 0) return;
    const key = todayKey();
    const steps = { ...get().steps, [key]: (get().steps[key] || 0) + n };
    await AsyncStorage.setItem(KEY, JSON.stringify({ steps, restingHR: get().restingHR, bp: get().bp, source: get().source }));
    set({ steps });
  },
  setStepsToday: async (n) => {
    if (n < 0) return;
    const key = todayKey();
    const steps = { ...get().steps, [key]: n };
    await AsyncStorage.setItem(KEY, JSON.stringify({ steps, restingHR: get().restingHR, bp: get().bp, source: get().source }));
    set({ steps });
  },
  setRestingHR: async (bpm) => {
    if (!bpm || bpm <= 0) return;
    const key = todayKey();
    const restingHR = { ...get().restingHR, [key]: bpm };
    await AsyncStorage.setItem(KEY, JSON.stringify({ steps: get().steps, restingHR, bp: get().bp, source: get().source }));
    set({ restingHR });
  },
  addBP: async (systolic, diastolic, pulse) => {
    if (!systolic || !diastolic) return;
    const entry: BPEntry = {
      id: `bp-${Date.now()}`,
      date: new Date().toISOString(),
      systolic,
      diastolic,
      pulse,
    };
    const bp = [entry, ...get().bp].slice(0, 500);
    await AsyncStorage.setItem(KEY, JSON.stringify({ steps: get().steps, restingHR: get().restingHR, bp, source: get().source }));
    set({ bp });
  },
  removeBP: async (id) => {
    const bp = get().bp.filter((b) => b.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify({ steps: get().steps, restingHR: get().restingHR, bp, source: get().source }));
    set({ bp });
  },
}));

export function bpCategory(systolic: number, diastolic: number): { label: string; color: string } {
  if (systolic >= 180 || diastolic >= 120) return { label: 'Crisis', color: '#EF4444' };
  if (systolic >= 140 || diastolic >= 90) return { label: 'Alta (Hipertensión 2)', color: '#EF4444' };
  if (systolic >= 130 || diastolic >= 80) return { label: 'Elevada', color: '#F59E0B' };
  if (systolic >= 120) return { label: 'Normal-alta', color: '#F59E0B' };
  if (systolic < 90 || diastolic < 60) return { label: 'Baja', color: '#0EA5E9' };
  return { label: 'Normal', color: '#10B981' };
}
