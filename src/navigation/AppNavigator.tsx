import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUserStore } from '../store/userStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { DietScreen } from '../screens/DietScreen';
import { AIScreen } from '../screens/AIScreen';
import { MembershipScreen } from '../screens/MembershipScreen';
import { RoutinesScreen } from '../screens/RoutinesScreen';

type Tab = 'home' | 'exercises' | 'routines' | 'diet' | 'ai' | 'membership';

export function AppNavigator() {
  const { profile, loadProfile } = useUserStore();
  const [tab, setTab] = useState<Tab>('home');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadProfile().then(() => setReady(true));
  }, []);

  if (!ready) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  if (!profile?.hasOnboarded) return <OnboardingScreen onDone={() => setTab('home')} />;

  const screens: Record<Tab, React.ReactNode> = {
    home: <HomeScreen nav={(s) => setTab(s as Tab)} />,
    exercises: <ExercisesScreen />,
    routines: <RoutinesScreen nav={(s) => setTab(s as Tab)} />,
    diet: <DietScreen />,
    ai: <AIScreen />,
    membership: <MembershipScreen />,
  };

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: 'home', label: 'Inicio' },
    { id: 'exercises', icon: 'barbell', label: 'Ejercicios' },
    { id: 'routines', icon: 'list', label: 'Rutinas' },
    { id: 'diet', icon: 'restaurant', label: 'Dieta' },
    { id: 'ai', icon: 'sparkles', label: 'IA' },
    { id: 'membership', icon: 'card', label: 'Pagos' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>{screens[tab]}</View>
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={styles.tab}>
            <View style={[styles.tabIcon, tab === t.id && styles.tabActive]}>
              <Ionicons name={t.icon} size={20} color={tab === t.id ? '#fff' : '#6B7280'} />
            </View>
            <Text style={[styles.tabLbl, tab === t.id && { color: colors.primary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, paddingVertical: 6, paddingHorizontal: 4 },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabLbl: { color: '#6B7280', fontSize: 9, fontWeight: '700' },
});
