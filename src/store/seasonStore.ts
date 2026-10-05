import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Season = 'default' | 'halloween';

type State = {
  season: Season;
  setSeason: (s: Season) => Promise<void>;
  toggleHalloween: () => Promise<void>;
  load: () => Promise<void>;
};

const KEY = '@modo_season';

export const useSeasonStore = create<State>((set, get) => ({
  season: 'default',
  setSeason: async (s) => {
    await AsyncStorage.setItem(KEY, s);
    set({ season: s });
  },
  toggleHalloween: async () => {
    const next: Season = get().season === 'halloween' ? 'default' : 'halloween';
    await AsyncStorage.setItem(KEY, next);
    set({ season: next });
  },
  load: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === 'halloween' || raw === 'default') set({ season: raw });
  },
}));
