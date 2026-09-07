import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { appFont, statFont } from '../../theme/fonts';
import { Exercise, getRestSeconds, isTimedExercise, getSuggestedDurationMin } from '../../services/exerciseService';

type Props = { exercise: Exercise; onFinish?: () => void };

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function RestTimer({ exercise, onFinish }: Props) {
  const timed = isTimedExercise(exercise);
  const initialSecs = timed ? getSuggestedDurationMin(exercise) * 60 : getRestSeconds(exercise);
  const [total, setTotal] = useState(initialSecs);
  const [remaining, setRemaining] = useState(initialSecs);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const interval = useRef<any>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    setTotal(initialSecs);
    setRemaining(initialSecs);
    setRunning(false);
    setDone(false);
  }, [exercise.id, initialSecs]);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval.current);
          setRunning(false);
          setDone(true);
          onFinishRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval.current);
  }, [running]);

  const reset = (secs: number) => {
    setTotal(secs);
    setRemaining(secs);
    setRunning(false);
    setDone(false);
  };
  const stepRest = (delta: number) => {
    if (running) return;
    const v = Math.max(0, remaining + delta);
    setRemaining(v);
    setTotal(v);
  };
  const stepDuration = (deltaMin: number) => {
    if (running) return;
    const v = Math.max(1, remaining + deltaMin * 60);
    setRemaining(v);
    setTotal(v);
  };

  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={[styles.modeBadge, timed ? { backgroundColor: '#0EA5E9' } : { backgroundColor: colors.primary }]}>
          <Ionicons name={timed ? 'timer' : 'hourglass'} size={13} color="#fff" />
          <Text style={styles.modeTxt}>{timed ? 'CARDIO · POR TIEMPO' : 'DESCANSO ENTRE SERIES'}</Text>
        </View>
        <Text style={styles.title}>{timed ? '⏱ Controla tu duración' : '💤 Descansa y vuelve con todo'}</Text>
      </View>

      {done ? (
        <View style={styles.doneWrap}>
          <Ionicons name="checkmark-circle" size={46} color={colors.success} />
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, marginTop: 8 }}>¡Listo! 💪</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{timed ? '¡Tiempo completado!' : 'Descanso terminado. ¡A la siguiente serie!'}</Text>
          <Pressable onPress={() => reset(initialSecs)} style={styles.resetBtn}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.resetTxt}>REINICIAR</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.ringWrap}>
            <Svg width={160} height={160}>
              <Circle cx={80} cy={80} r={radius} stroke={colors.surface3} strokeWidth={12} fill="none" />
              <Circle
                cx={80} cy={80} r={radius} stroke={timed ? '#0EA5E9' : colors.primary}
                strokeWidth={12} fill="none" strokeLinecap="round"
                strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset}
                transform="rotate(-90 80 80)"
              />
            </Svg>
            <View style={styles.timeOverlay}>
              <Text style={styles.timeTxt}>{fmt(remaining)}</Text>
              <Text style={styles.timeLbl}>{timed ? 'DURACIÓN' : 'DESCANSO'}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable onPress={() => setRunning((v) => !v)} style={[styles.mainBtn, { backgroundColor: timed ? '#0EA5E9' : colors.primary }]}>
              <Ionicons name={running ? 'pause' : 'play'} size={18} color="#fff" />
              <Text style={styles.mainTxt}>{running ? 'PAUSAR' : 'INICIAR'}</Text>
            </Pressable>
            <Pressable onPress={() => reset(initialSecs)} style={[styles.icoBtn, { backgroundColor: colors.surface3 }]}>
              <Ionicons name="refresh" size={18} color="#fff" />
            </Pressable>
          </View>

          {timed ? (
            <View style={styles.stepperRow}>
              <Pressable onPress={() => stepDuration(-1)} style={styles.stepBtn}><Ionicons name="remove" size={18} color="#fff" /></Pressable>
              <Text style={styles.stepLbl}>AJUSTAR MINUTOS</Text>
              <Pressable onPress={() => stepDuration(1)} style={styles.stepBtn}><Ionicons name="add" size={18} color="#fff" /></Pressable>
            </View>
          ) : (
            <>
              <View style={styles.presets}>
                {[30, 60, 90, 120].map((s) => (
                  <Pressable key={s} onPress={() => reset(s)} style={[styles.presetBtn, remaining === s && styles.presetActive]}>
                    <Text style={styles.presetTxt}>{s}s</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.stepperRow}>
                <Pressable onPress={() => stepRest(-15)} style={styles.stepBtn}><Ionicons name="remove" size={18} color="#fff" /></Pressable>
                <Text style={styles.stepLbl}>AJUSTAR SEGUNDOS</Text>
                <Pressable onPress={() => stepRest(15)} style={styles.stepBtn}><Ionicons name="add" size={18} color="#fff" /></Pressable>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: 16, backgroundColor: colors.surface2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  header: { alignItems: 'center' },
  modeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  modeTxt: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  title: { color: '#fff', fontWeight: '800', fontSize: 13, marginTop: 8, fontFamily: appFont.bold },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 14, width: 160, height: 160, alignSelf: 'center' },
  timeOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  timeTxt: { color: '#fff', fontSize: 40, fontFamily: statFont.black },
  timeLbl: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  controls: { flexDirection: 'row', gap: 10, marginTop: 14, justifyContent: 'center' },
  mainBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  mainTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  icoBtn: { borderRadius: 12, width: 46, alignItems: 'center', justifyContent: 'center' },
  presets: { flexDirection: 'row', gap: 8, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' },
  presetBtn: { backgroundColor: colors.surface3, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
  presetActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, justifyContent: 'center' },
  stepBtn: { backgroundColor: colors.surface3, borderRadius: 10, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  stepLbl: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  doneWrap: { alignItems: 'center', paddingVertical: 18 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface3, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, marginTop: 14, borderWidth: 1, borderColor: colors.border },
  resetTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
