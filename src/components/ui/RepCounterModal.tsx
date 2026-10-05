import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { appFont, statFont } from '../../theme/fonts';
import { Exercise, suggestedSetsReps } from '../../services/exerciseService';
import { estimateMET, caloriesBurned } from '../../utils/calories';
import { useUserStore } from '../../store/userStore';
import { useProgressStore } from '../../store/progressStore';

type Props = { exercise: Exercise | null; visible: boolean; onClose: () => void };

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function RepCounterModal({ exercise, visible, onClose }: Props) {
  const weightKg = useUserStore((s) => s.profile?.weight ?? 70);
  const addCalories = useProgressStore((s) => s.addCalories);
  const logBodyParts = useProgressStore((s) => s.logBodyParts);
  const logExercise = useProgressStore((s) => s.logExercise);

  const plan = exercise ? suggestedSetsReps(exercise) : { sets: 3, reps: '12-15', rest: 60, timed: false };
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [auto, setAuto] = useState(false);
  const [rest, setRest] = useState(0);
  const endsAt = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setSets(0); setReps(0); setDone([]); setRest(0); endsAt.current = null;
  }, [exercise?.id, visible]);

  // AUTO (beta): detecta repeticiones con el acelerómetro
  useEffect(() => {
    if (!auto || !visible || !exercise || plan.timed) return;
    let sub: any = null;
    let mounted = true;
    (async () => {
      try {
        const { Accelerometer } = require('expo-sensors');
        const ok = await Accelerometer.isAvailableAsync();
        if (!ok || !mounted) return;
        Accelerometer.setUpdateInterval(100);
        let armed = true;
        let last = 0;
        sub = Accelerometer.addListener(({ x, y, z }: any) => {
          const mag = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();
          if (mag > 1.55 && armed && now - last > 350) {
            armed = false; last = now;
            setReps((r) => r + 1);
          } else if (mag < 0.95) {
            armed = true;
          }
        });
      } catch {}
    })();
    return () => { mounted = false; sub?.remove?.(); };
  }, [auto, visible, exercise?.id, plan.timed]);

  // Descanso con hora real (sigue aunque salgas de la app)
  useEffect(() => {
    if (rest <= 0) return;
    if (endsAt.current == null) endsAt.current = Date.now() + rest * 1000;
    const tick = () => {
      if (endsAt.current == null) return;
      const left = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setRest(left);
      if (left <= 0) { endsAt.current = null; }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [rest > 0]);

  const finishSet = () => {
    if (reps <= 0) return;
    setDone((d) => [...d, reps]);
    setSets((s) => s + 1);
    setReps(0);
    if (plan.rest > 0) { endsAt.current = null; setRest(plan.rest); }
  };

  const totalReps = done.reduce((a, b) => a + b, 0) + reps;

  const save = async () => {
    if (!exercise) return;
    const allReps = [...done, reps].filter((r) => r > 0);
    const total = allReps.reduce((a, b) => a + b, 0);
    const kcal = caloriesBurned(estimateMET(exercise), weightKg, total * 3); // ~3s por rep
    const section = (exercise as any).section || exercise.targetEs || exercise.target || exercise.bodyPart || 'full body';
    await addCalories(kcal);
    await logBodyParts([section]);
    await logExercise({
      exerciseId: exercise.id,
      name: exercise.name,
      section,
      category: exercise.category,
      kcal,
      sets: allReps.length || sets,
      reps: total,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Contar repeticiones</Text>
              <Text style={styles.sub} numberOfLines={1}>{exercise?.name}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.close}><Ionicons name="close" size={20} color="#fff" /></Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.planRow}>
              <View style={styles.planChip}><Text style={styles.planTxt}>Objetivo: {plan.sets} × {plan.reps}</Text></View>
              <View style={styles.planChip}><Text style={styles.planTxt}>Descanso {plan.rest}s</Text></View>
              {!plan.timed && (
                <Pressable onPress={() => setAuto((v) => !v)} style={[styles.planChip, auto && { backgroundColor: colors.success, borderColor: colors.success }]}>
                  <Text style={[styles.planTxt, auto && { color: '#fff' }]}>AUTO β {auto ? 'ON' : 'OFF'}</Text>
                </Pressable>
              )}
            </View>

            {rest > 0 ? (
              <View style={styles.restBox}>
                <Ionicons name="hourglass" size={34} color={colors.warning} />
                <Text style={styles.restTime}>{fmt(rest)}</Text>
                <Text style={styles.restLbl}>DESCANSO — preparate para la serie {sets + 1}</Text>
                <Pressable onPress={() => { endsAt.current = null; setRest(0); }} style={styles.skipBtn}>
                  <Text style={styles.skipTxt}>SALTAR DESCANSO</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.setsLbl}>Serie {sets + 1} de {plan.sets} · completadas: {sets}</Text>
                <View style={styles.countRow}>
                  <Pressable onPress={() => setReps((r) => Math.max(0, r - 1))} style={styles.stepBtn}><Ionicons name="remove" size={26} color="#fff" /></Pressable>
                  <View style={styles.countBox}>
                    <Text style={styles.count}>{reps}</Text>
                    <Text style={styles.countLbl}>REPS</Text>
                  </View>
                  <Pressable onPress={() => setReps((r) => r + 1)} style={[styles.stepBtn, { backgroundColor: colors.primary }]}><Ionicons name="add" size={26} color="#fff" /></Pressable>
                </View>
                <Pressable onPress={finishSet} style={styles.setBtn}>
                  <Ionicons name="checkmark-done" size={18} color="#fff" />
                  <Text style={styles.setTxt}>SERIE LISTA ({reps} reps)</Text>
                </Pressable>
              </>
            )}

            <View style={styles.summary}>
              <Text style={styles.summaryTxt}>Series: <Text style={{ color: '#fff' }}>{sets}</Text> · Reps totales: <Text style={{ color: '#fff' }}>{totalReps}</Text></Text>
            </View>

            <Pressable onPress={save} style={styles.saveBtn}>
              <Ionicons name="save" size={16} color="#fff" />
              <Text style={styles.saveTxt}>GUARDAR EN MI PROGRESO</Text>
            </Pressable>
            <Pressable onPress={onClose} style={{ marginTop: 8, alignItems: 'center', padding: 8 }}><Text style={{ color: '#9CA3AF', fontWeight: '700' }}>Cancelar</Text></Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '900', fontSize: 18, fontFamily: appFont.black },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  close: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  planRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  planChip: { backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  planTxt: { color: colors.textSecondary, fontSize: 11, fontWeight: '800' },
  setsLbl: { color: colors.textSecondary, fontSize: 12, marginTop: 18, textAlign: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 8 },
  stepBtn: { width: 62, height: 62, borderRadius: 18, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  countBox: { alignItems: 'center', minWidth: 120 },
  count: { color: '#fff', fontSize: 66, fontWeight: '900', fontFamily: statFont.black },
  countLbl: { color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  setBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, borderRadius: 12, padding: 15, marginTop: 18 },
  setTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  restBox: { alignItems: 'center', paddingVertical: 20 },
  restTime: { color: '#fff', fontSize: 48, fontWeight: '900', fontFamily: statFont.black, marginTop: 8 },
  restLbl: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  skipBtn: { marginTop: 14, backgroundColor: colors.surface3, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  skipTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
  summary: { backgroundColor: colors.surface2, borderRadius: 10, padding: 12, marginTop: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  summaryTxt: { color: colors.textSecondary, fontSize: 12 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 12, padding: 15, marginTop: 14 },
  saveTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
});
