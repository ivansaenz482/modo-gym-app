import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExerciseWeight = {
  exerciseId: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
};

type State = {
  weights: Record<string, ExerciseWeight>; // clave: exerciseId -> último registro
  lastWeightFor: (exerciseId: string) => ExerciseWeight | undefined;
  logWeight: (exerciseId: string, weight: number, reps: number, sets: number) => Promise<void>;
  load: () => Promise<void>;
};

const KEY = '@modo_exercise_weights';

export const useWeightStore = create<State>((set, get) => ({
  weights: {},
  lastWeightFor: (id) => get().weights[id],
  logWeight: async (exerciseId, weight, reps, sets) => {
    const entry: ExerciseWeight = { exerciseId, weight, reps, sets, date: new Date().toISOString() };
    const next = { ...get().weights, [exerciseId]: entry };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    set({ weights: next });
  },
  load: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) set({ weights: JSON.parse(raw) });
  },
}));
