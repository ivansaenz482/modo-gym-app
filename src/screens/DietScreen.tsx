import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { useUserStore } from '../store/userStore';
import { getDietForGoal } from '../services/dietService';

export function DietScreen() {
  const { profile } = useUserStore();
  const goal = profile?.goal ?? 'mantener';
  const diet = getDietForGoal(goal);
  const [dayIdx, setDayIdx] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const day = diet[dayIdx];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>🥗 Dieta Semanal Variada</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>Objetivo: {goal.replace('_', ' ').toUpperCase()} · {profile?.weight}kg · {profile?.height}cm</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6 }}>Cambia de objetivo en perfil para recalcular calorías. Dieta orientativa, consulta nutricionista.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        {diet.map((d, i) => (
          <Pressable key={d.day} onPress={() => setDayIdx(i)} style={[styles.dayChip, dayIdx === i && styles.dayActive]}>
            <Text style={[styles.dayTxt, dayIdx === i && { color: '#fff' }]}>{d.day.slice(0, 3).toUpperCase()}</Text>
            <Text style={[styles.daySub, dayIdx === i && { color: 'rgba(255,255,255,0.9)' }]}>{d.totalKcal} kcal</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{day.day}</Text>
          <View style={styles.kcalBadge}><Text style={{ color: '#fff', fontWeight: '900' }}>{day.totalKcal} kcal</Text></View>
        </View>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 6 }}>{day.tip}</Text>
        {day.meals.map((m, i) => (
          <View key={i} style={styles.meal}>
            <View style={styles.mealNum}><Text style={{ color: '#fff', fontWeight: '900' }}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{m.name}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>{m.desc}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.primary, fontWeight: '800' }}>{m.kcal} kcal</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{m.protein}g prot.</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.card, { marginTop: 12, backgroundColor: '#15151C' }]}>
        <Text style={{ color: colors.gold, fontWeight: '800' }}>💧 Hábitos MODO-GYM</Text>
        <Text style={{ color: '#D1D5DB', fontSize: 12, marginTop: 8 }}>• 2.5L agua/día • 7-8h sueño • 80% alimentos reales • Proteína en cada comida</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  dayChip: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border, minWidth: 64 },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayTxt: { color: '#9CA3AF', fontWeight: '900', fontSize: 12 },
  daySub: { color: '#6B7280', fontSize: 10, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  kcalBadge: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  meal: { flexDirection: 'row', gap: 10, marginTop: 12, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, alignItems: 'center' },
  mealNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
});
