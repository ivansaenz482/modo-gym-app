import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { appFont, statFont } from '../../theme/fonts';
import { Exercise } from '../../services/exerciseService';
import { useWeightStore } from '../../store/weightStore';
import { useUserStore } from '../../store/userStore';
import { classifyWeightCategory, recomendarPesoInicial, sugerirProgresion, categoriaLabel } from '../../services/weightService';
import { gymLevelLabel } from '../../utils/calculations';

export function WeightPanel({ exercise }: { exercise: Exercise }) {
  const { profile } = useUserStore();
  const { lastWeightFor, logWeight } = useWeightStore();
  const last = lastWeightFor(exercise.id);
  const pesoCorporal = profile?.weight ?? 0;
  const nivel = profile?.level ?? 'principiante';
  const cat = classifyWeightCategory(exercise);
  const pesoInicial = recomendarPesoInicial(exercise, pesoCorporal, nivel);
  const [peso, setPeso] = useState(last ? String(last.weight) : String(pesoInicial));
  const [reps, setReps] = useState(last ? String(last.reps) : '10');
  const [sets, setSets] = useState(last ? String(last.sets) : '3');

  const esPesoCorporal = cat === 'peso_corporal' || pesoInicial <= 0;
  const esNuevo = !last;

  const guardar = async () => {
    const w = Number(peso) || pesoInicial;
    const r = Number(reps) || 10;
    const s = Number(sets) || 3;
    await logWeight(exercise.id, w, r, s);
  };

  const siguiente = sugerirProgresion(Number(peso) || pesoInicial, Number(reps) || 10, (profile?.goal as any) || 'ganar_musculo');

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={[styles.catBadge, esPesoCorporal ? { backgroundColor: colors.surface3 } : { backgroundColor: colors.primary }]}>
          <Ionicons name={esPesoCorporal ? 'body' : 'barbell'} size={13} color="#fff" />
          <Text style={styles.catTxt}>{categoriaLabel(cat)}</Text>
        </View>
        <Text style={styles.titleCont}>💪 {localeEs() === 'es' ? 'Tu peso' : 'Your weight'}</Text>
      </View>

      {esPesoCorporal ? (
        <Text style={{ color: '#D1D5DB', fontSize: 12, marginTop: 8 }}>Este ejercicio es con tu peso corporal. Domina la técnica antes de añadir carga.</Text>
      ) : (
        <>
          <Text style={styles.hint}>
            {last
              ? `Última vez: ${last.weight} kg · ${last.reps} reps · ${last.sets} series`
              : `Peso ideal para empezar (nivel ${gymLevelLabel(nivel)}): ${pesoInicial} kg`}
          </Text>

          <View style={styles.row}>
            <View style={styles.inputWrap}><Text style={styles.inLbl}>KG</Text><TextInput value={peso} onChangeText={setPeso} keyboardType="numeric" style={styles.input} /></View>
            <View style={styles.inputWrap}><Text style={styles.inLbl}>REPS</Text><TextInput value={reps} onChangeText={setReps} keyboardType="numeric" style={styles.input} /></View>
            <View style={styles.inputWrap}><Text style={styles.inLbl}>SETS</Text><TextInput value={sets} onChangeText={setSets} keyboardType="numeric" style={styles.input} /></View>
          </View>

          <Pressable onPress={guardar} style={styles.saveBtn}>
            <Ionicons name="checkmark-done" size={15} color="#fff" />
            <Text style={styles.saveTxt}>GUARDAR PROGRESO</Text>
          </Pressable>

          <View style={styles.suggest}>
            <Ionicons name="trending-up" size={16} color={colors.primary} />
            <Text style={{ color: '#D1D5DB', fontSize: 12, flex: 1 }}>
              {last ? `Sugerencia: cuando completes ${reps} reps limpio, sube a ${siguiente} kg.` : `Empieza con ${pesoInicial} kg. Sube a ${siguiente} kg cuando completes el rango con buena forma.`}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

function localeEs() {
  try { return require('../../store/localeStore').useLocaleStore.getState().locale; } catch { return 'es'; }
}

const styles = StyleSheet.create({
  panel: { marginTop: 16, backgroundColor: colors.surface2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleCont: { color: '#fff', fontSize: 13, fontWeight: '800', fontFamily: appFont.bold },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  catTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  hint: { color: '#9CA3AF', fontSize: 12, marginTop: 10 },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  inputWrap: { flex: 1 },
  inLbl: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  input: { backgroundColor: colors.surface3, borderRadius: 10, padding: 11, color: '#fff', fontSize: 16, fontFamily: statFont.bold, textAlign: 'center', borderWidth: 1, borderColor: colors.border },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 11, padding: 12, marginTop: 12 },
  saveTxt: { color: '#fff', fontWeight: '900', fontSize: 12 },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(225,6,0,0.08)', borderRadius: 10, padding: 10, marginTop: 10, borderLeftWidth: 3, borderLeftColor: colors.primary },
});
