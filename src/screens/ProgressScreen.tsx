import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useProgressStore, lastNDays } from '../store/progressStore';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { BodyPartChart, buildBodyPartData } from '../components/ui/BodyPartChart';
import { muscleMilestoneMessage } from '../utils/celebration';
import { heatColor } from '../utils/calories';

const DAY_LABEL = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ProgressScreen() {
  const { history, bodyParts, sessions, calories, exerciseLog, load, getMessage } = useProgressStore();
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  useEffect(() => { load(); }, []);

  const now = new Date();
  const thisMonthKey = now.toISOString().slice(0, 7);
  const thisYearKey = now.toISOString().slice(0, 4);
  const todayKeyStr = dateKey(new Date());

  const todayKcal = calories[todayKeyStr] || 0;

  type Bucket = { key: string; label: string; kcal: number };
  let buckets: Bucket[] = [];
  if (range === 'week') {
    buckets = lastNDays(7).map((k) => ({ key: k, label: DAY_LABEL[new Date(k + 'T00:00:00').getDay()], kcal: calories[k] || 0 }));
  } else if (range === 'month') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({ key, label: MONTH_SHORT[d.getMonth()], kcal: 0 });
    }
    Object.entries(calories).forEach(([k, v]) => { const b = buckets.find((x) => k.startsWith(x.key)); if (b) b.kcal += v; });
  } else {
    for (let i = 4; i >= 0; i--) { const y = now.getFullYear() - i; buckets.push({ key: String(y), label: String(y), kcal: 0 }); }
    Object.entries(calories).forEach(([k, v]) => { const b = buckets.find((x) => k.startsWith(x.key)); if (b) b.kcal += v; });
  }
  const bucketTotal = buckets.reduce((a, b) => a + b.kcal, 0);
  const maxBucket = Math.max(1, ...buckets.map((b) => b.kcal));

  const inPeriod = (iso: string) => {
    if (range === 'week') return new Date(iso).getTime() >= Date.now() - 7 * 24 * 3600 * 1000;
    if (range === 'month') return iso.slice(0, 7) === thisMonthKey;
    return iso.slice(0, 4) === thisYearKey;
  };
  const periodSessions = sessions.filter((s) => inPeriod(s.date));
  const periodMuscleSet = new Set<string>();
  periodSessions.forEach((s) => s.parts.forEach((p) => periodMuscleSet.add(p)));
  const periodKcal = Object.entries(calories).filter(([k]) => inPeriod(k)).reduce((a, [, v]) => a + v, 0);

  const monthKcal = Object.entries(calories).filter(([k]) => k.slice(0, 7) === thisMonthKey).reduce((a, [, v]) => a + v, 0);
  const monthSessions = sessions.filter((s) => s.date.slice(0, 7) === thisMonthKey).length;
  const yearKcal = Object.entries(calories).filter(([k]) => k.slice(0, 4) === thisYearKey).reduce((a, [, v]) => a + v, 0);
  const yearSessions = sessions.filter((s) => s.date.slice(0, 4) === thisYearKey).length;

  const chartData = buildBodyPartData(bodyParts);
  const totalSessions = sessions.length;
  const partsTrained = Object.keys(bodyParts).length;
  const totalReps = Object.values(bodyParts).reduce((a, b) => a + b, 0);

  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const weekly: Record<string, number> = {};
  sessions.forEach((s) => {
    if (new Date(s.date).getTime() >= weekAgo) {
      s.parts.forEach((p) => { weekly[p] = (weekly[p] || 0) + 1; });
    }
  });
  const weeklySorted = Object.entries(weekly).sort((a, b) => b[1] - a[1]);

  const milestoneCongrats = Object.entries(bodyParts)
    .map(([part, count]) => ({ part, count, ms: muscleMilestoneMessage(count) }))
    .filter((x) => x.ms);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <ScreenHeader icon="stats-chart" title="Mi Progreso" subtitle="Avance por parte del cuerpo y tu evolución" />

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.cardTitle}>🔥 Calorías quemadas</Text>
          <View style={styles.rangeRow}>
            {(['week', 'month', 'year'] as const).map((r) => (
              <Pressable key={r} onPress={() => setRange(r)} style={[styles.rangeBtn, range === r && styles.rangeActive]}>
                <Text style={[styles.rangeTxt, range === r && { color: '#fff' }]}>{r === 'week' ? '7D' : r === 'month' ? 'MES' : 'AÑO'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>HOY</Text>
            <Text style={{ color: heatColor(todayKcal / Math.max(1, maxBucket)), fontSize: 34, fontWeight: '900', fontFamily: 'Inter_900Black' }}>
              {Math.round(todayKcal)} <Text style={{ fontSize: 14, color: colors.textSecondary }}>kcal</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
              {range === 'week' ? 'ÚLTIMOS 7 DÍAS' : range === 'month' ? 'ÚLTIMOS 6 MESES' : 'ÚLTIMOS 5 AÑOS'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', fontFamily: 'Inter_900Black' }}>{Math.round(bucketTotal)} kcal</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 14, height: 54 }}>
          {buckets.map((w) => {
            const h = (w.kcal / maxBucket) * 100;
            return (
              <View key={w.key} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#D1D5DB', fontSize: 9, fontWeight: '700', marginBottom: 3 }}>{w.kcal > 0 ? Math.round(w.kcal) : ''}</Text>
                <View style={[{ width: '100%', borderRadius: 6, backgroundColor: h > 0 ? heatColor(w.kcal / maxBucket) : colors.surface3, height: `${Math.max(h, 4)}%` }]} />
                <Text style={{ color: colors.textMuted, fontSize: 9, marginTop: 4 }}>{w.label}</Text>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={styles.miniStat}><Text style={styles.miniVal}>{Math.round(periodKcal)}</Text><Text style={styles.miniLbl}>KCAL · {range === 'week' ? '7 DÍAS' : range === 'month' ? 'ESTE MES' : 'ESTE AÑO'}</Text></View>
          <View style={styles.miniStat}><Text style={styles.miniVal}>{periodSessions.length}</Text><Text style={styles.miniLbl}>SESIONES</Text></View>
          <View style={styles.miniStat}><Text style={styles.miniVal}>{periodMuscleSet.size}</Text><Text style={styles.miniLbl}>MÚSCULOS</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Progreso mensual y anual</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Totales guardados de tu entrenamiento.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={styles.periodCard}>
            <Text style={styles.periodTitle}>ESTE MES</Text>
            <Text style={styles.periodKcal}>{Math.round(monthKcal)} <Text style={styles.periodUnit}>kcal</Text></Text>
            <Text style={styles.periodSub}>{monthSessions} sesiones</Text>
          </View>
          <View style={styles.periodCard}>
            <Text style={styles.periodTitle}>ESTE AÑO</Text>
            <Text style={styles.periodKcal}>{Math.round(yearKcal)} <Text style={styles.periodUnit}>kcal</Text></Text>
            <Text style={styles.periodSub}>{yearSessions} sesiones</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statVal}>{totalSessions}</Text><Text style={styles.statLbl}>SESIONES</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{partsTrained}</Text><Text style={styles.statLbl}>MÚSCULOS</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{totalReps}</Text><Text style={styles.statLbl}>VECES ENTRENADO</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💪 Avance por parte del cuerpo</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Cada vez que registras una sesión, suma al músculo trabajado.</Text>
        <View style={{ marginTop: 12 }}>
          <BodyPartChart data={chartData} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Mejora esta semana</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Músculos que entrenaste en los últimos 7 días.</Text>
        {weeklySorted.length === 0 ? (
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>Aún no entrenas esta semana. Ve a Rutinas y registra tu sesión 💪</Text>
        ) : (
          <View style={{ marginTop: 12, gap: 8 }}>
            {weeklySorted.map(([part, count]) => (
              <View key={part} style={styles.weekRow}>
                <View style={styles.weekIcon}><Ionicons name="trending-up" size={14} color={colors.success} /></View>
                <Text style={{ color: '#fff', fontWeight: '700', flex: 1, textTransform: 'capitalize' }}>{part}</Text>
                <Text style={{ color: '#fff', fontWeight: '900' }}>{count}x</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 10 }}>esta semana</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {milestoneCongrats.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 ¡Tus logros!</Text>
          <View style={{ marginTop: 8, gap: 8 }}>
            {milestoneCongrats.map(({ part, ms }) => (
              <View key={part} style={styles.logro}>
                <Ionicons name="trophy" size={18} color={colors.gold} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '800', textTransform: 'capitalize' }}>{part}</Text>
                  <Text style={{ color: '#D1D5DB', fontSize: 12 }}>{ms!.message}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Tu progreso de peso</Text>
        <Text style={{ color: '#D1D5DB', fontSize: 12, marginTop: 6 }}>{getMessage()}</Text>
        {history.length > 0 ? (
          <View style={{ marginTop: 10, gap: 6 }}>
            {history.slice().reverse().slice(0, 10).map((h, i) => (
              <View key={i} style={styles.row}>
                <View style={styles.rowDot} />
                <Text style={{ color: '#D1D5DB', fontSize: 12, flex: 1 }}>{new Date(h.date).toLocaleDateString()}</Text>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{h.weight} kg</Text>
                {h.daysTrained ? <Text style={{ color: '#9CA3AF', fontSize: 11 }}>· {h.daysTrained} días</Text> : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>Registra tu peso en Inicio &gt; Tu Progreso Semanal para verlo aquí.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗂️ Historial de ejercicios</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Cada ejercicio que registres, incluso fuera de tu rutina.</Text>
        {exerciseLog.length === 0 ? (
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>Aún no registras ejercicios sueltos. En Ejercicios toca “REGISTRAR EJERCICIO”.</Text>
        ) : (
          <View style={{ marginTop: 10, gap: 6 }}>
            {exerciseLog.slice(0, 15).map((e) => (
              <View key={e.id} style={styles.logRow}>
                <View style={styles.rowDot} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }} numberOfLines={1}>{e.name}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 10 }}>
                    {new Date(e.date).toLocaleDateString()} · {String(e.section).toUpperCase()}
                    {e.durationMin ? ` · ${e.durationMin} min` : ''}{e.sets ? ` · ${e.sets}x${e.reps}` : ''}
                  </Text>
                </View>
                <Text style={{ color: colors.gold, fontWeight: '900', fontSize: 12 }}>{Math.round(e.kcal)} kcal</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statVal: { color: '#fff', fontSize: 26, fontWeight: '900' },
  statLbl: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface2, borderRadius: 10, padding: 10 },
  rowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface2, borderRadius: 10, padding: 10 },
  weekIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center' },
  logro: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,214,10,0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,214,10,0.3)' },
  rangeRow: { flexDirection: 'row', gap: 6 },
  rangeBtn: { backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.border },
  rangeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rangeTxt: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  miniStat: { flex: 1, backgroundColor: colors.surface2, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  miniVal: { color: '#fff', fontSize: 20, fontWeight: '900', fontFamily: 'Inter_900Black' },
  miniLbl: { color: colors.textSecondary, fontSize: 8, fontWeight: '700', letterSpacing: 0.5, marginTop: 3, textAlign: 'center' },
  periodCard: { flex: 1, backgroundColor: colors.surface2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  periodTitle: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  periodKcal: { color: '#fff', fontSize: 24, fontWeight: '900', fontFamily: 'Inter_900Black', marginTop: 6 },
  periodUnit: { fontSize: 12, color: colors.textSecondary },
  periodSub: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface2, borderRadius: 10, padding: 10 },
});
