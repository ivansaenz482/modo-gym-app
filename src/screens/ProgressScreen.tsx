import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useProgressStore } from '../store/progressStore';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { BodyPartChart, buildBodyPartData } from '../components/ui/BodyPartChart';
import { muscleMilestoneMessage } from '../utils/celebration';

export function ProgressScreen() {
  const { history, bodyParts, sessions, load, getMessage } = useProgressStore();
  useEffect(() => { load(); }, []);

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
});
