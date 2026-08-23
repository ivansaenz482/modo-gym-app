import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MembershipPlan = 'diaria' | 'mensual' | 'trimestral';
export type Membership = {
  id: string;
  gymName: string;
  plan: MembershipPlan;
  startDate: string; // ISO
  endDate: string;
  price: number;
  paid: boolean;
};
export type Expense = {
  id: string;
  concept: string;
  amount: number;
  date: string;
  category: 'suplemento' | 'insumo' | 'ropa' | 'otro';
};

type State = {
  memberships: Membership[];
  expenses: Expense[];
  addMembership: (m: Membership) => Promise<void>;
  addExpense: (e: Expense) => Promise<void>;
  removeMembership: (id: string) => Promise<void>;
  load: () => Promise<void>;
};

const K_MEM = '@modo_memberships';
const K_EXP = '@modo_expenses';

export const useMembershipStore = create<State>((set, get) => ({
  memberships: [],
  expenses: [],
  load: async () => {
    const [m, e] = await Promise.all([AsyncStorage.getItem(K_MEM), AsyncStorage.getItem(K_EXP)]);
    set({ memberships: m ? JSON.parse(m) : [], expenses: e ? JSON.parse(e) : [] });
  },
  addMembership: async (m) => {
    const next = [...get().memberships, m];
    await AsyncStorage.setItem(K_MEM, JSON.stringify(next));
    set({ memberships: next });
  },
  addExpense: async (e) => {
    const next = [...get().expenses, e];
    await AsyncStorage.setItem(K_EXP, JSON.stringify(next));
    set({ expenses: next });
  },
  removeMembership: async (id) => {
    const next = get().memberships.filter((x) => x.id !== id);
    await AsyncStorage.setItem(K_MEM, JSON.stringify(next));
    set({ memberships: next });
  },
}));

export function calcExpiryAlert(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { status: 'vencida' as const, days: diff };
  if (diff <= 3) return { status: 'critico' as const, days: diff };
  if (diff <= 7) return { status: 'pronto' as const, days: diff };
  return { status: 'activa' as const, days: diff };
}

export function nextExpiryDate(start: Date, plan: MembershipPlan) {
  const d = new Date(start);
  if (plan === 'diaria') d.setDate(d.getDate() + 1);
  if (plan === 'mensual') d.setMonth(d.getMonth() + 1);
  if (plan === 'trimestral') d.setMonth(d.getMonth() + 3);
  return d;
}
