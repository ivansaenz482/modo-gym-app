import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { GlobalTimer } from '../components/ui/GlobalTimer';
import { RestTimer, RestTimerHandle } from '../components/ui/RestTimer';
import { Exercise } from '../services/exerciseService';
import { useProgressStore } from '../store/progressStore';
import { randomPraise } from '../utils/celebration';

const CARDIO_OPTIONS: { key: string; label: string; icon: any; minutes: number; color: string }[] = [
  { key: 'correr', label: 'Correr', icon: 'walk', minutes: 25, color: '#0EA5E9' },
  { key: 'bici', label: 'Bicicleta', icon: 'bicycle', minutes: 20, color: '#10B981' },
  { key: 'caminar', label: 'Caminar', icon: 'footsteps', minutes: 30, color: '#F59E0B' },
  { key: 'cinta', label: 'Cinta', icon: 'speedometer', minutes: 25, color: '#8B5CF6' },
  { key: 'eliptica', label: 'Elíptica', icon: 'sync', minutes: 20, color: '#EC4899' },
  { key: 'cuerda', label: 'Saltar cuerda', icon: 'ellipse-outline', minutes: 15, color: '#22D3EE' },
];

function makeCardio(name: string, minutes: number): Exercise {
  return {
    id: `cardio-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    bodyPart: 'cardio',
    equipment: 'cardio',
    target: 'cardio',
    targetEs: 'cardio',
    section: 'cardio',
    secondaryMuscles: [],
    difficulty: 'intermedio',
    category: 'cardio',
    instructions: ['Mantén un ritmo constante y controla tu respiración.', 'Ajusta la intensidad según tu objetivo.'],
    gifUrl: '',
    image: '',
    isTimed: true,
    suggestedDurationMin: minutes,
  };
}

export function WorkoutScreen() {
  const logBodyParts = useProgressStore((s) => s.logBodyParts);
  const [active, setActive] = useState<Exercise | null>(null);
  const [praise, setPraise] = useState<string | null>(null);
  const timerRef = useRef<RestTimerHandle>(null);

  const finishCardio = async () => {
    if (!active) return;
    timerRef.current?.commit();
    await logBodyParts(['cardio']);
    setPraise(randomPraise());
    setTimeout(() => setPraise(null), 4000);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <ScreenHeader icon="flame" title="Entrenar" subtitle="Controlemos tu tiempo total en el gym y tu cardio" />

      <GlobalTimer />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏃 Cardio rápido por tiempo</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Elige y arranca el cronómetro. Al terminar, registra tu progreso.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {CARDIO_OPTIONS.map((c) => (
            <Pressable key={c.key} onPress={() => setActive(makeCardio(c.label, c.minutes))} style={styles.cardioBtn}>
              <View style={[styles.cardioIcon, { backgroundColor: c.color }]}>
                <Ionicons name={c.icon as any} size={20} color="#fff" />
              </View>
              <Text style={styles.cardioTxt}>{c.label}</Text>
              <Text style={styles.cardioMin}>{c.minutes} min</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {praise && (
        <View style={styles.praise}>
          <Ionicons name="trophy" size={20} color={colors.gold} />
          <Text style={styles.praiseTxt}>{praise}</Text>
        </View>
      )}

      <Modal visible={!!active} animationType="slide" onRequestClose={() => setActive(null)}>
        {active && (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20 }}>{active.name}</Text>
                <Pressable onPress={() => setActive(null)} style={styles.close}><Ionicons name="close" size={20} color="#fff" /></Pressable>
              </View>
              <RestTimer ref={timerRef} exercise={active} onFinish={finishCardio} />
              <Pressable onPress={finishCardio} style={styles.doneBtn}>
                <Ionicons name="checkmark-done" size={16} color="#fff" />
                <Text style={styles.doneTxt}>TERMINÉ · REGISTRAR PROGRESO</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  cardioBtn: { width: '31%', backgroundColor: colors.surface2, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cardioIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardioTxt: { color: '#fff', fontWeight: '800', fontSize: 12, marginTop: 8, textAlign: 'center' },
  cardioMin: { color: '#9CA3AF', fontSize: 10, marginTop: 2 },
  praise: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,214,10,0.12)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.gold },
  praiseTxt: { color: '#fff', fontSize: 12, fontWeight: '700', flex: 1 },
  close: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, borderRadius: 12, padding: 14, marginTop: 16 },
  doneTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
});
