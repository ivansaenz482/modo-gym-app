import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useRoutineStore } from '../store/routineStore';
import { useUserStore } from '../store/userStore';
import { generateRoutineRecommendation } from '../services/aiService';

export function RoutinesScreen({ nav }: { nav: (s: string) => void }) {
  const { routines, load, removeRoutine } = useRoutineStore();
  const { profile } = useUserStore();
  useEffect(() => { load(); }, []);
  const rec = profile ? generateRoutineRecommendation(profile.daysPerWeek, profile.goal) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.hero}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>📋 Mis Rutinas Diarias</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Agrega ejercicios por secciones desde el catálogo</Text>
      </View>

      {rec && (
        <View style={styles.card}>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>RECOMENDACIÓN IA · {profile?.daysPerWeek} DÍAS</Text>
          {rec.split.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <View style={styles.num}><Text style={{ color: '#fff', fontWeight: '900' }}>{i + 1}</Text></View>
              <Text style={{ color: '#fff', fontWeight: '700', flex: 1 }}>{s}</Text>
            </View>
          ))}
          <Pressable onPress={() => nav('exercises')} style={styles.cta}><Text style={styles.ctaTxt}>+ AÑADIR EJERCICIOS A RUTINA</Text></Pressable>
        </View>
      )}

      {routines.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={40} color="#6B7280" />
          <Text style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>Aún no tienes rutinas. Explora ejercicios y toca "+ RUTINA" para crear tu rutina diaria.</Text>
          <Pressable onPress={() => nav('exercises')} style={[styles.cta, { marginTop: 16 }]}><Text style={styles.ctaTxt}>EXPLORAR EJERCICIOS</Text></Pressable>
        </View>
      ) : (
        routines.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{r.name}</Text>
              <Pressable onPress={() => removeRoutine(r.id)}><Ionicons name="trash-outline" size={18} color={colors.error} /></Pressable>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{new Date(r.date).toLocaleString()}</Text>
            {r.exercises.map((e) => (
              <View key={e.id} style={styles.exRow}>
                <Text style={{ color: '#fff', fontWeight: '700', flex: 1 }}>{e.name}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{e.target}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  num: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  cta: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12 },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 12 },
  empty: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  exRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, backgroundColor: colors.surface2, borderRadius: 10, padding: 10 },
});
