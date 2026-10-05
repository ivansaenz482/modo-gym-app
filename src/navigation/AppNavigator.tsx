import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { appFont } from '../theme/fonts';
import { useUserStore } from '../store/userStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { DietScreen } from '../screens/DietScreen';
import { AIScreen } from '../screens/AIScreen';
import { MembershipScreen } from '../screens/MembershipScreen';
import { RoutinesScreen } from '../screens/RoutinesScreen';
import { ShareScreen } from '../screens/ShareScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { StoreScreen } from '../screens/StoreScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { WorkoutScreen } from '../screens/WorkoutScreen';
import { HealthScreen } from '../screens/HealthScreen';
import { SideDrawer } from '../components/ui/SideDrawer';
import { useUiStore } from '../store/uiStore';
import { useSeasonStore } from '../store/seasonStore';
import { useSeasonPalette } from '../theme/season';

type Tab = 'home' | 'exercises' | 'routines' | 'diet' | 'ai' | 'membership' | 'store' | 'share' | 'profile' | 'progress' | 'workout' | 'health';

export function AppNavigator() {
  const { profile, loadProfile } = useUserStore();
  const [tab, setTab] = useState<Tab>('home');
  const [ready, setReady] = useState(false);
  const drawerOpen = useUiStore((s) => s.drawerOpen);
  const closeDrawer = useUiStore((s) => s.closeDrawer);
  const loadSeason = useSeasonStore((s) => s.load);
  const { palette } = useSeasonPalette();

  useEffect(() => {
    loadProfile().then(() => setReady(true));
    loadSeason();
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      const onBack = () => closeDrawer();
      // Cierra el drawer al presionar atrás en Android
      const sub = require('react-native').BackHandler?.addEventListener('hardwareBackPress', () => { onBack(); return true; });
      return () => sub?.remove();
    }
  }, [drawerOpen, closeDrawer]);

  if (!ready) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  if (!profile?.hasOnboarded) return <OnboardingScreen onDone={() => setTab('home')} />;

  const screens: Record<Tab, React.ReactNode> = {
    home: <HomeScreen nav={(s) => setTab(s as Tab)} />,
    exercises: <ExercisesScreen />,
    routines: <RoutinesScreen nav={(s) => setTab(s as Tab)} />,
    diet: <DietScreen />,
    ai: <AIScreen />,
    membership: <MembershipScreen />,
    store: <StoreScreen />,
    share: <ShareScreen />,
    profile: <ProfileScreen onDone={() => setTab('home')} />,
    progress: <ProgressScreen />,
    workout: <WorkoutScreen />,
    health: <HealthScreen />,
  };

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: 'home', label: 'Inicio' },
    { id: 'exercises', icon: 'barbell', label: 'Ejercicios' },
    { id: 'routines', icon: 'list', label: 'Rutinas' },
    { id: 'diet', icon: 'restaurant', label: 'Dieta' },
    { id: 'ai', icon: 'sparkles', label: 'IA' },
  ];

  const drawerItems: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: 'home', label: 'Inicio' },
    { id: 'workout', icon: 'flame', label: 'Entrenar' },
    { id: 'progress', icon: 'stats-chart', label: 'Mi Progreso' },
    { id: 'health', icon: 'heart', label: 'Salud' },
    { id: 'membership', icon: 'card', label: 'Membresía & Pagos' },
    { id: 'store', icon: 'bag-handle', label: 'Tienda' },
    { id: 'share', icon: 'qr-code', label: 'Compartir' },
    { id: 'profile', icon: 'person', label: 'Perfil' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ flex: 1 }}>{screens[tab]}</View>
      <View style={[styles.tabBar, { backgroundColor: palette.tabBar, borderColor: palette.border }]}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <Pressable key={t.id} onPress={() => setTab(t.id)} style={({ pressed }) => [styles.tab, pressed && { opacity: 0.8 }]}>
              <View style={[styles.iconWrap, active && { backgroundColor: palette.primary }]}>
                <Ionicons name={t.icon} size={20} color={active ? '#fff' : '#6B7280'} />
                {active && <View style={[styles.indicator, { backgroundColor: palette.primary }]} />}
              </View>
              <Text style={[styles.tabLbl, active && { color: palette.primary }]} numberOfLines={1}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <SideDrawer items={drawerItems} active={tab} onNavigate={(id) => setTab(id as Tab)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBar: { backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, paddingTop: 7, paddingBottom: 5, flexDirection: 'row', minHeight: 62 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 32, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.primary },
  indicator: { position: 'absolute', bottom: -6, width: 16, height: 3, borderRadius: 2, backgroundColor: colors.primary },
  tabLbl: { color: '#6B7280', fontSize: 8, fontWeight: '800', fontFamily: appFont.bold },
});
