import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { appFont, statFont } from '../../theme/fonts';
import { Exercise, getRestSeconds, isTimedExercise, getSuggestedDurationMin } from '../../services/exerciseService';
import { useUserStore } from '../../store/userStore';
import { useProgressStore } from '../../store/progressStore';
import { estimateMET, caloriesBurned, heatColor } from '../../utils/calories';
import { scheduleTimerDoneNotification, cancelTimerDoneNotification } from '../../services/notificationService';

export type RestTimerHandle = { commit: () => void };

type Props = { exercise: Exercise; onFinish?: () => void };

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export const RestTimer = forwardRef<RestTimerHandle, Props>(function RestTimer({ exercise, onFinish }, ref) {
  const timed = isTimedExercise(exercise);
  const initialSecs = timed ? getSuggestedDurationMin(exercise) * 60 : getRestSeconds(exercise);
  const [total, setTotal] = useState(initialSecs);
  const [remaining, setRemaining] = useState(initialSecs);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const committedRef = useRef(false);
  const finishedRef = useRef(false);
  const endsAtRef = useRef<number | null>(null);
  const notifIdRef = useRef<string | null>(null);
  const remainingRef = useRef(initialSecs);
  remainingRef.current = remaining;
  const addCalories = useProgressStore((s) => s.addCalories);

  const weightKg = useUserStore((s) => s.profile?.weight ?? 70);
  const met = estimateMET(exercise);
  const elapsed = total - remaining;
  const calories = caloriesBurned(met, weightKg, elapsed);
  const maxCalories = Math.max(1, caloriesBurned(met, weightKg, total));
  const kcalRatio = total > 0 ? Math.min(1, calories / maxCalories) : 0;
  const kcalColor = timed ? heatColor(kcalRatio) : colors.surface3;

  const cancelNotif = () => {
    cancelTimerDoneNotification(notifIdRef.current);
    notifIdRef.current = null;
  };

  useEffect(() => {
    committedRef.current = false;
    finishedRef.current = false;
    endsAtRef.current = null;
    cancelNotif();
    setTotal(initialSecs);
    setRemaining(initialSecs);
    setRunning(false);
    setDone(false);
  }, [exercise.id, initialSecs]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    endsAtRef.current = null;
    cancelNotif();
    setRunning(false);
    setDone(true);
    if (!committedRef.current) {
      committedRef.current = true;
      addCalories(maxCalories);
    }
    onFinishRef.current?.();
  };

  const commit = () => {
    if (!timed) return;
    if (!committedRef.current) {
      committedRef.current = true;
      addCalories(calories);
    }
    finishedRef.current = true;
    endsAtRef.current = null;
    cancelNotif();
    setRunning(false);
    setDone(true);
  };
  useImperativeHandle(ref, () => ({ commit }));

  // El conteo se calcula con la hora real (Date.now), así sigue avanzando aunque
  // el usuario salga de la app y Android pause los temporizadores en segundo plano.
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (endsAtRef.current == null) return;
      const left = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) finish();
    };
    tick();
    const id = setInterval(tick, 500);
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') tick(); });
    return () => { clearInterval(id); sub.remove(); };
  }, [running]);

  const startTimer = () => {
    const secs = Math.max(1, remainingRef.current);
    finishedRef.current = false;
    endsAtRef.current = Date.now() + secs * 1000;
    setRunning(true);
    scheduleTimerDoneNotification(
      secs,
      timed ? '¡Tiempo completado! ⏱' : '¡Descanso terminado! 💪',
      timed ? `Terminaste ${exercise.name}. Registra tu progreso.` : 'Vuelve a la siguiente serie.',
    ).then((id) => { notifIdRef.current = id; });
  };

  const pauseTimer = () => {
    if (endsAtRef.current != null) {
      const left = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
      setRemaining(left);
    }
    endsAtRef.current = null;
    cancelNotif();
    setRunning(false);
  };

  const reset = (secs: number) => {
    finishedRef.current = false;
    endsAtRef.current = null;
    cancelNotif();
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
          {timed && (
            <Text style={{ color: kcalColor, fontWeight: '800', fontSize: 16, marginTop: 8 }}>
              🔥 {maxCalories.toFixed(1)} kcal quemadas
            </Text>
          )}
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

          {timed && (
            <View style={styles.kcalPanel}>
              <View style={styles.kcalHeader}>
                <View style={styles.kcalTitleGroup}>
                  <Ionicons name="flame" size={16} color={kcalColor} />
                  <Text style={styles.kcalLbl}>CALORÍAS QUEMADAS</Text>
                </View>
                <Text style={[styles.kcalNum, { color: kcalColor }]}>{calories.toFixed(1)} kcal</Text>
              </View>
              <View style={styles.kcalTrack}>
                <View style={[styles.kcalFill, { width: `${kcalRatio * 100}%`, backgroundColor: kcalColor }]} />
              </View>
            </View>
          )}

          <View style={styles.controls}>
            <Pressable onPress={running ? pauseTimer : startTimer} style={[styles.mainBtn, { backgroundColor: timed ? '#0EA5E9' : colors.primary }]}>
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
});

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
  kcalPanel: { marginTop: 14, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  kcalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kcalTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kcalLbl: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  kcalNum: { fontSize: 18, fontWeight: '900', fontFamily: statFont.black },
  kcalTrack: { height: 8, borderRadius: 6, backgroundColor: colors.surface3, marginTop: 10, overflow: 'hidden' },
  kcalFill: { height: 8, borderRadius: 6 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, justifyContent: 'center' },
  stepBtn: { backgroundColor: colors.surface3, borderRadius: 10, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  stepLbl: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  doneWrap: { alignItems: 'center', paddingVertical: 18 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface3, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, marginTop: 14, borderWidth: 1, borderColor: colors.border },
  resetTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
