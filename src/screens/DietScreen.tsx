import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { colors } from '../theme/colors';
import { useUserStore } from '../store/userStore';
import { getDietForGoal } from '../services/dietService';
import { getMealImage } from '../services/nutritionService';
import { useProgressStore } from '../store/progressStore';
import { ScreenHeader } from '../components/ui/ScreenHeader';

export function DietScreen() {
  const { profile } = useUserStore();
  const goal = profile?.goal ?? 'mantener';
  const dietRaw = getDietForGoal(goal);
  const { history, load } = useProgressStore();
  const [dayIdx, setDayIdx] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [mealImgs, setMealImgs] = useState<Record<string, string>>({});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    (async () => {
      const day = dietRaw[dayIdx];
      const imgs: Record<string, string> = {};
      for (const m of day.meals) imgs[m.name] = await getMealImage(m.name);
      setMealImgs(imgs);
    })();
  }, [dayIdx, goal]);
  // El total del día SIEMPRE es la suma exacta de los platos mostrados
  const diet = dietRaw.map((d) => ({ ...d, totalKcal: d.meals.reduce((s, m) => s + (m.kcal || 0), 0) }));
  const day = diet[dayIdx];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <ScreenHeader icon="restaurant" title="Dieta Semanal" subtitle={`Objetivo: ${goal.replace('_', ' ').toUpperCase()} · ${profile?.weight}kg · Consulta nutriólogo`} />

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
        {day.meals.map((m: any, i: number) => (
          <View key={i} style={[styles.meal, { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' }}>
              <Image source={{ uri: mealImgs[m.name] }} style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: colors.surface3 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{m.name}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>{m.desc}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>{m.kcal} kcal</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{m.protein}g prot.</Text>
              </View>
            </View>
            <View style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 8, width: '100%' }}>
              <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '800' }}>👨‍🍳 Receta:</Text>
              {m.recipe?.map((s: string, idx: number) => (
                <Text key={idx} style={{ color: '#D1D5DB', fontSize: 11, marginTop: 2 }}>{idx + 1}. {s}</Text>
              ))}
            </View>
          </View>
        ))}
        {history.length > 0 && (
          <View style={{ marginTop: 12, backgroundColor: colors.surface2, borderRadius: 12, padding: 12 }}>
            <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 12 }}>📈 Dieta adaptada a tu avance: {history.length} registros · Último peso {history[history.length - 1].weight} kg</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, { marginTop: 12, backgroundColor: '#15151C' }]}>
        <Text style={{ color: colors.gold, fontWeight: '800' }}>💧 Hábitos MODO-GYM</Text>
        <Text style={{ color: '#D1D5DB', fontSize: 12, marginTop: 8 }}>• 2.5L agua/día • 7-8h sueño • 80% alimentos reales • Proteína en cada comida</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  dayChip: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border, minWidth: 64 },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayTxt: { color: '#9CA3AF', fontWeight: '900', fontSize: 12 },
  daySub: { color: '#6B7280', fontSize: 10, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  kcalBadge: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  meal: { flexDirection: 'row', gap: 10, marginTop: 12, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, alignItems: 'center' },
  mealNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
});
