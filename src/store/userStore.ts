import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '../utils/calculations';

export type UserProfile = {
  name: string;
  age: number;
  sex: 'M' | 'F';
  height: number; // cm
  weight: number; // kg
  goal: Goal;
  daysPerWeek: number; // 2-6
  gymName?: string;
  hasOnboarded: boolean;
};

type State = {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => Promise<void>;
  loadProfile: () => Promise<void>;
  clearProfile: () => Promise<void>;
};

const KEY = '@modo_gym_profile';

export const useUserStore = create<State>((set) => ({
  profile: null,
  setProfile: async (p) => {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
    set({ profile: p });
  },
  loadProfile: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) set({ profile: JSON.parse(raw) });
  },
  clearProfile: async () => {
    await AsyncStorage.removeItem(KEY);
    set({ profile: null });
  },
}));
