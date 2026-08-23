import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '../services/exerciseService';

export type RoutineDay = {
  id: string;
  name: string;
  exercises: Exercise[];
  warmup: string[];
  date: string;
};

type State = {
  routines: RoutineDay[];
  favorites: string[];
  addRoutine: (r: RoutineDay) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
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
  addRoutine: async (r) => {
    const next = [...get().routines, r];
    await AsyncStorage.setItem(K_R, JSON.stringify(next));
    set({ routines: next });
  },
  removeRoutine: async (id) => {
    const next = get().routines.filter((x) => x.id !== id);
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
