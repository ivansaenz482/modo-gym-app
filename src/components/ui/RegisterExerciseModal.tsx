import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { appFont, statFont } from '../../theme/fonts';
import { Exercise, isTimedExercise, getSuggestedDurationMin } from '../../services/exerciseService';
import { estimateMET, caloriesBurned, heatColor } from '../../utils/calories';
import { useUserStore } from '../../store/userStore';
import { useWeightStore } from '../../store/weightStore';
import { useProgressStore } from '../../store/progressStore';

type Props = { exercise: Exercise | null; visible: boolean; onClose: () => void };

export function RegisterExerciseModal({ exercise, visible, onClose }: Props) {
  const weightKg = useUserStore((s) => s.profile?.weight ?? 70);
  const lastWeightFor = useWeightStore((s) => s.lastWeightFor);
  const addCalories = useProgressStore((s) => s.addCalories);
  const logBodyParts = useProgressStore((s) => s.logBodyParts);
  const logExercise = useProgressStore((s) => s.logExercise);

  const timed = exercise ? isTimedExercise(exercise) : false;
  const [minutes, setMinutes] = useState('20');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    if (!exercise) return;
    if (isTimedExercise(exercise)) {
      setMinutes(String(getSuggestedDurationMin(exercise)));
    } else {
      const last = lastWeightFor(exercise.id);
      setSets(last ? String(last.sets) : '3');
      setReps(last ? String(last.reps) : '10');
      setWeight(last ? String(last.weight) : '');
    }
  }, [exercise?.id]);

  const section = exercise ? ((exercise as any).section || exercise.targetEs || exercise.target || exercise.bodyPart || 'full body') : '';
  const met = exercise ? estimateMET(exercise) : 0;
  const secs = timed ? (Number(minutes) || 0) * 60 : (Number(sets) || 0) * (Number(reps) || 0) * 3;
  const kcal = caloriesBurned(met, weightKg, secs);
  const kcalColor = heatColor(Math.min(1, kcal / 400));

  const save = async () => {
    if (!exercise) return;
    await addCalories(kcal);
    await logBodyParts([section]);
    await logExercise({
      exerciseId: exercise.id,
      name: exercise.name,
      section,
      category: exercise.category,
      kcal,
      durationMin: timed ? Number(minutes) || 0 : undefined,
      sets: timed ? undefined : Number(sets) || 0,
      reps: timed ? undefined : Number(reps) || 0,
      weightKg: timed ? undefined : (Number(weight) || undefined),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Registrar ejercicio</Text>
              <Text style={styles.sub} numberOfLines={1}>{exercise?.name}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.close}><Ionicons name="close" size={20} color="#fff" /></Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagTxt}>{timed ? 'POR TIEMPO' : 'POR SERIES'}</Text></View>
              <View style={styles.tag}><Text style={styles.tagTxt}>{String(section).toUpperCase()}</Text></View>
            </View>

            {timed ? (
              <View style={styles.inputWrap}>
                <Text style={styles.inLbl}>MINUTOS</Text>
                <TextInput value={minutes} onChangeText={setMinutes} keyboardType="numeric" style={styles.input} />
              </View>
            ) : (
              <View style={styles.row}>
                <View style={styles.inputWrap}><Text style={styles.inLbl}>SERIES</Text><TextInput value={sets} onChangeText={setSets} keyboardType="numeric" style={styles.input} /></View>
                <View style={styles.inputWrap}><Text style={styles.inLbl}>REPS</Text><TextInput value={reps} onChangeText={setReps} keyboardType="numeric" style={styles.input} /></View>
                <View style={styles.inputWrap}><Text style={styles.inLbl}>KG (opc.)</Text><TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="—" placeholderTextColor="#6B7280" style={styles.input} /></View>
              </View>
            )}

            <View style={styles.kcalBox}>
              <Ionicons name="flame" size={18} color={kcalColor} />
              <Text style={styles.kcalLbl}>CALORÍAS QUE SUMARÁS</Text>
              <Text style={[styles.kcalNum, { color: kcalColor }]}>{kcal.toFixed(0)} kcal</Text>
            </View>

            <Text style={styles.hint}>
              {timed
                ? 'Se sumará al total de hoy y quedará en tu historial de ejercicios.'
                : 'Estimado por series y repeticiones. Se sumará a tus calorías y a tu progreso de músculo.'}
            </Text>

            <Pressable onPress={save} style={styles.saveBtn}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.saveTxt}>GUARDAR EN MI PROGRESO</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '900', fontSize: 18, fontFamily: appFont.black },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  close: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tag: { backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  tagTxt: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 8, marginTop: 14 },
  inputWrap: { flex: 1, marginTop: 14 },
  inLbl: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  input: { backgroundColor: colors.surface3, borderRadius: 10, padding: 12, color: '#fff', fontSize: 18, fontFamily: statFont.bold, textAlign: 'center', borderWidth: 1, borderColor: colors.border },
  kcalBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, marginTop: 16, borderWidth: 1, borderColor: colors.border },
  kcalLbl: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, flex: 1 },
  kcalNum: { fontSize: 20, fontWeight: '900', fontFamily: statFont.black },
  hint: { color: colors.textMuted, fontSize: 11, marginTop: 10, lineHeight: 16 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, borderRadius: 12, padding: 15, marginTop: 16 },
  saveTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
});
