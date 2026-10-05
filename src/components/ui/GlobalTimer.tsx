import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { appFont, statFont } from '../../theme/fonts';
import { useWorkoutStore } from '../../store/workoutStore';
import { useUserStore } from '../../store/userStore';
import { timeMilestoneMessage } from '../../utils/celebration';
import { caloriesBurned, heatColor } from '../../utils/calories';

const SESSION_MET = 6;
const SESSION_TARGET_SECONDS = 3600;

function fmt(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function GlobalTimer() {
  const { running, start, pause, stop, getElapsed } = useWorkoutStore();
  const [elapsed, setElapsed] = useState(getElapsed());
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const lastMilestone = useRef(0);
  const weightKg = useUserStore((s) => s.profile?.weight ?? 70);
  const calories = caloriesBurned(SESSION_MET, weightKg, elapsed);
  const ratio = Math.min(1, elapsed / SESSION_TARGET_SECONDS);
  const kcalColor = heatColor(ratio);

  useEffect(() => {
    const id = setInterval(() => {
      const e = getElapsed();
      setElapsed(e);
      const ms = timeMilestoneMessage(e);
      if (ms && ms.minutes > lastMilestone.current) {
        lastMilestone.current = ms.minutes;
        setCelebrate(ms.message);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [getElapsed]);

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(null), 4000);
    return () => clearTimeout(t);
  }, [celebrate]);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Ionicons name="timer" size={18} color={colors.primary} />
        <Text style={styles.title}>⏱ TIEMPO EN EL GYM</Text>
        {running && <View style={styles.liveDot}><Text style={styles.liveTxt}>EN VIVO</Text></View>}
      </View>

      <Text style={styles.time}>{fmt(elapsed)}</Text>
      <Text style={styles.sub}>{running ? 'Entrenando... ¡Sigue así!' : 'Inicia cuando empieces tu sesión'}</Text>

      <View style={styles.kcalPanel}>
        <View style={styles.kcalHeader}>
          <View style={styles.kcalTitleGroup}>
            <Ionicons name="flame" size={16} color={kcalColor} />
            <Text style={styles.kcalLbl}>CALORÍAS QUEMADAS</Text>
          </View>
          <Text style={[styles.kcalNum, { color: kcalColor }]}>{calories.toFixed(0)} kcal</Text>
        </View>
        <View style={styles.kcalTrack}>
          <View style={[styles.kcalFill, { width: `${ratio * 100}%`, backgroundColor: kcalColor }]} />
        </View>
        <Text style={styles.kcalHint}>Meta: {Math.round(caloriesBurned(SESSION_MET, weightKg, SESSION_TARGET_SECONDS))} kcal / 1 h</Text>
      </View>

      <View style={styles.controls}>
        {running ? (
          <Pressable onPress={pause} style={[styles.btn, { backgroundColor: colors.warning }]}>
            <Ionicons name="pause" size={18} color="#fff" />
            <Text style={styles.btnTxt}>PAUSAR</Text>
          </Pressable>
        ) : (
          <Pressable onPress={start} style={[styles.btn, { backgroundColor: colors.success }]}>
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.btnTxt}>INICIAR</Text>
          </Pressable>
        )}
        <Pressable onPress={stop} style={[styles.btn, { backgroundColor: colors.surface3 }]}>
          <Ionicons name="stop" size={18} color="#fff" />
          <Text style={styles.btnTxt}>REINICIAR</Text>
        </Pressable>
      </View>

      {celebrate && (
        <View style={styles.celebrate}>
          <Ionicons name="trophy" size={20} color={colors.gold} />
          <Text style={styles.celebrateTxt}>{celebrate}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#fff', fontWeight: '800', fontSize: 14, flex: 1, fontFamily: appFont.bold },
  liveDot: { backgroundColor: colors.success, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  liveTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  time: { color: '#fff', fontSize: 52, fontWeight: '900', fontFamily: statFont.black, textAlign: 'center', marginTop: 12, letterSpacing: 1 },
  sub: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 2 },
  controls: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 12 },
  btnTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  celebrate: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,214,10,0.12)', borderRadius: 12, padding: 12, marginTop: 14, borderWidth: 1, borderColor: colors.gold },
  celebrateTxt: { color: '#fff', fontSize: 12, fontWeight: '700', flex: 1 },
  kcalPanel: { marginTop: 14, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  kcalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kcalTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kcalLbl: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  kcalNum: { fontSize: 20, fontWeight: '900', fontFamily: statFont.black },
  kcalTrack: { height: 8, borderRadius: 6, backgroundColor: colors.surface3, marginTop: 10, overflow: 'hidden' },
  kcalFill: { height: 8, borderRadius: 6 },
  kcalHint: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
});
