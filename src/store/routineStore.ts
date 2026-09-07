import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '../services/exerciseService';

export type RoutineDay = {
  id: string;
  name: string; // Ej: "Día 1 - Pecho"
  dayNumber: number; // 1..6
  exercises: Exercise[];
  warmup: string[];
  date: string;
};

type State = {
  routines: RoutineDay[];
  favorites: string[];
  addExerciseToDay: (ex: Exercise, dayNumber: number) => Promise<void>;
  addRoutine: (r: RoutineDay) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
  removeExerciseFromDay: (dayId: string, exId: string) => Promise<void>;
  toggleFav: (id: string) => Promise<void>;
  load: () => Promise<void>;
};

const K_R = '@modo_routines';
const K_F = '@modo_favs';

export const useRoutineStore = create<State>((set, get) => ({
  routines: [],
  favorites: [],
  load: async () => {
    const [r, f] = await Promise.all([AsyncStorage.getItem(K_R), AsyncStorage.getItem(K_F)]);
    set({ routines: r ? JSON.parse(r) : [], favorites: f ? JSON.parse(f) : [] });
  },
  addExerciseToDay: async (ex, dayNumber) => {
    const existing = get().routines.find((r) => r.dayNumber === dayNumber);
    if (existing) {
      const next = get().routines.map((r) => r.dayNumber === dayNumber ? { ...r, exercises: [...r.exercises, ex] } : r);
      await AsyncStorage.setItem(K_R, JSON.stringify(next));
      set({ routines: next });
    } else {
      const newDay: RoutineDay = {
        id: `day-${dayNumber}-${Date.now()}`,
        name: `Día ${dayNumber}`,
        dayNumber,
        exercises: [ex],
        warmup: [],
        date: new Date().toISOString(),
      };
      const next = [...get().routines, newDay].sort((a,b)=>a.dayNumber-b.dayNumber);
      await AsyncStorage.setItem(K_R, JSON.stringify(next));
      set({ routines: next });
    }
  },
  addRoutine: async (r) => {
    const next = [...get().routines, r].sort((a,b)=>a.dayNumber-b.dayNumber);
    await AsyncStorage.setItem(K_R, JSON.stringify(next));
    set({ routines: next });
  },
  removeRoutine: async (id) => {
    const next = get().routines.filter((x) => x.id !== id);
    await AsyncStorage.setItem(K_R, JSON.stringify(next));
    set({ routines: next });
  },
  removeExerciseFromDay: async (dayId, exId) => {
    const next = get().routines.map((r) => r.id === dayId ? { ...r, exercises: r.exercises.filter((e) => e.id !== exId) } : r).filter((r) => r.exercises.length > 0);
    await AsyncStorage.setItem(K_R, JSON.stringify(next));
    set({ routines: next });
  },
  toggleFav: async (id) => {
    const favs = get().favorites;
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    await AsyncStorage.setItem(K_F, JSON.stringify(next));
    set({ favorites: next });
  },
}));
