import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUserStore } from '../store/userStore';
import { useMembershipStore, calcExpiryAlert } from '../store/membershipStore';
import { calculateBMI, bmiCategory } from '../utils/calculations';
import { generateRoutineRecommendation } from '../services/aiService';

export function HomeScreen({ nav }: { nav: (s: string) => void }) {
  const { profile } = useUserStore();
  const { memberships, load } = useMembershipStore();
  useEffect(() => { load(); }, []);
  if (!profile) return null;
  const bmi = calculateBMI(profile.weight, profile.height);
  const rec = generateRoutineRecommendation(profile.daysPerWeek, profile.goal);
  const alert = memberships[0] ? calcExpiryAlert(memberships[0].endDate) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, '#FF6B35']} style={styles.hero}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>HOLA, {profile.name.toUpperCase()} 👋</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>{profile.gymName}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>{profile.daysPerWeek} días/semana · Objetivo: {profile.goal.replace('_', ' ')}</Text>
          </View>
          <View style={styles.avatar}><Text style={{ fontSize: 24 }}>🏋️</Text></View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statVal}>{profile.weight} kg</Text><Text style={styles.statLbl}>PESO</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{profile.height} cm</Text><Text style={styles.statLbl}>ALTURA</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{bmi}</Text><Text style={styles.statLbl}>{bmiCategory(bmi)}</Text></View>
        </View>
      </LinearGradient>

      {/* Alerta membresía */}
      {memberships[0] ? (
        <Pressable onPress={() => nav('membership')} style={[styles.alertCard, alert?.status === 'critico' && { borderColor: colors.error }, alert?.status === 'vencida' && { backgroundColor: '#2A0A0A' }]}>
          <Ionicons name={alert?.status === 'vencida' ? 'alert-circle' : 'card'} size={22} color={alert?.status === 'activa' ? colors.success : colors.error} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{memberships[0].gymName} · {memberships[0].plan.toUpperCase()}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{alert?.status === 'vencida' ? `Vencida hace ${Math.abs(alert.days)} días` : `Vence en ${alert?.days} días · ${new Date(memberships[0].endDate).toLocaleDateString()}`}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </Pressable>
      ) : (
        <Pressable onPress={() => nav('membership')} style={styles.alertCard}>
          <Ionicons name="add-circle" size={22} color={colors.primary} />
          <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 12, flex: 1 }}>Configura tu membresía para alertas de pago</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </Pressable>
      )}

      {/* Recomendación IA */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.cardTitle}>🧠 Tu Rutina Recomendada IA</Text>
          <View style={styles.badge}><Text style={styles.badgeTxt}>{profile.daysPerWeek} DÍAS</Text></View>
        </View>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 6 }}>{rec.focus}</Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {rec.split.map((s, i) => (
            <View key={i} style={styles.splitRow}>
              <View style={styles.splitNum}><Text style={{ color: '#fff', fontWeight: '900' }}>{i + 1}</Text></View>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{s}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 14, backgroundColor: colors.surface2, borderRadius: 12, padding: 12 }}>
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 12 }}>🔥 CALENTAMIENTO (8-10 MIN)</Text>
          {rec.warmup.map((w, i) => (
            <Text key={i} style={{ color: '#D1D5DB', fontSize: 12, marginTop: 4 }}>• {w}</Text>
          ))}
        </View>
        <Pressable onPress={() => nav('exercises')} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnTxt}>EXPLORAR EJERCICIOS →</Text>
        </Pressable>
      </View>

      {/* Accesos rápidos */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        {[
          { icon: 'restaurant', label: 'Dieta Semanal', sub: 'Personalizada', nav: 'diet' },
          { icon: 'chatbubbles', label: 'MODO IA', sub: ' Gratis 24/7', nav: 'ai' },
          { icon: 'barbell', label: 'Mis Rutinas', sub: `${profile.daysPerWeek} días`, nav: 'routines' },
        ].map((c) => (
          <Pressable key={c.label} onPress={() => nav(c.nav)} style={styles.quick}>
            <Ionicons name={c.icon as any} size={22} color={colors.primary} />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, marginTop: 8, textAlign: 'center' }}>{c.label}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{c.sub}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 24 }}>Creado por Ing. Ivan Teneta · MODO-GYM</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, padding: 18 },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  stat: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: 12, alignItems: 'center' },
  statVal: { color: '#fff', fontWeight: '900', fontSize: 16 },
  statLbl: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  badge: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '900' },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface2, borderRadius: 10, padding: 10 },
  splitNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 14 },
  primaryBtnTxt: { color: '#fff', fontWeight: '900', letterSpacing: 0.5 },
  quick: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
});
