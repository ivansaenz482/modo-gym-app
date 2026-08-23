import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type Locale = 'es' | 'en';
export type Country = string; // ISO 3166-1 alpha-2

type State = {
  locale: Locale;
  country: Country;
  setLocale: (l: Locale) => Promise<void>;
  setCountry: (c: string) => Promise<void>;
  load: () => Promise<void>;
};

const K_LOCALE = '@modo_locale';
const K_COUNTRY = '@modo_country';

export const useLocaleStore = create<State>((set, get) => ({
  locale: (Localization.getLocales()?.[0]?.languageCode as Locale) === 'en' ? 'en' : 'es',
  country: Localization.getLocales()?.[0]?.regionCode ?? 'EC',
  setLocale: async (l) => {
    await AsyncStorage.setItem(K_LOCALE, l);
    set({ locale: l });
  },
  setCountry: async (c) => {
    await AsyncStorage.setItem(K_COUNTRY, c);
    set({ country: c });
  },
  load: async () => {
    const [l, c] = await Promise.all([AsyncStorage.getItem(K_LOCALE), AsyncStorage.getItem(K_COUNTRY)]);
    const deviceLocale = (Localization.getLocales()?.[0]?.languageCode as Locale) === 'en' ? 'en' : 'es';
    const deviceCountry = Localization.getLocales()?.[0]?.regionCode ?? 'EC';
    set({
      locale: (l as Locale) ?? deviceLocale ?? 'es',
      country: c ?? deviceCountry,
    });
  },
}));
