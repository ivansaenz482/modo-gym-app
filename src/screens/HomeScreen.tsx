import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { appFont, statFont } from '../theme/fonts';
import { useUserStore } from '../store/userStore';
import { useMembershipStore, calcExpiryAlert } from '../store/membershipStore';
import { useProgressStore } from '../store/progressStore';
import { calculateBMI, bmiCategory, gymLevelLabel } from '../utils/calculations';
import { generateRoutineRecommendation } from '../services/aiService';
import { MenuButton } from '../components/ui/MenuButton';
import { useSeasonPalette } from '../theme/season';
import { HalloweenOverlay } from '../components/ui/HalloweenOverlay';

export function HomeScreen({ nav }: { nav: (s: string) => void }) {
  const { profile, setProfile } = useUserStore();
  const { memberships, load } = useMembershipStore();
  const { history, load: loadProgress, addEntry, getMessage } = useProgressStore();
  const { isHalloween, palette } = useSeasonPalette();
  const [editMode, setEditMode] = useState(false);
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editDays, setEditDays] = useState('');
  useEffect(() => { load(); loadProgress(); }, []);
  if (!profile) return null;
  const bmi = calculateBMI(profile.weight, profile.height);
  const rec = generateRoutineRecommendation(profile.daysPerWeek, profile.goal, profile.level ?? 'principiante');
  const alert = memberships[0] ? calcExpiryAlert(memberships[0].endDate) : null;
  const progressMsg = getMessage();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      {/* Header con logo y fondo impactante */}
      <View style={[styles.hero, { overflow: 'hidden', padding: 0 }, isHalloween && { borderWidth: 1, borderColor: palette.primary }]}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' }} style={StyleSheet.absoluteFillObject} />
        <LinearGradient colors={palette.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
          <HalloweenOverlay />
          {isHalloween && (
            <View style={styles.halloweenBadge}>
              <Text style={styles.halloweenBadgeTxt}>🎃 MODO HALLOWEEN · MENTE + CORAZÓN + FUERZA 🦇</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <View style={styles.logoRow}>
                <Image source={require('../../assets/icon.png')} style={styles.logoImg} />
                <View>
              <Text style={[styles.logoTxt, { fontFamily: appFont.black }]}>MODO GYM</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 1, fontFamily: appFont.semibold }}>EL PODER ESTÁ EN TU INTERIOR</Text>
              </View>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 14, fontFamily: appFont.bold }}>HOLA, {profile.name.toUpperCase()} 👋</Text>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 2, letterSpacing: 0.3, fontFamily: appFont.black }}>{profile.gymName}</Text>
              <View style={styles.objRow}>
                <View style={styles.objDot} />
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{profile.daysPerWeek} días/semana · Nivel: {gymLevelLabel(profile.level)} · {profile.goal.replace('_', ' ')}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.avatar}><Text style={{ fontSize: 24 }}>🏋️</Text></View>
              <MenuButton />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text numberOfLines={1} style={styles.statVal}>{profile.weight} kg</Text><Text style={styles.statLbl}>PESO</Text></View>
            <View style={styles.stat}><Text numberOfLines={1} style={styles.statVal}>{profile.height} cm</Text><Text style={styles.statLbl}>ALTURA</Text></View>
            <View style={styles.stat}><Text numberOfLines={1} style={styles.statVal}>{bmi}</Text><Text style={styles.statLbl}>{bmiCategory(bmi)}</Text></View>
          </View>
        </LinearGradient>
      </View>

      {/* Entrenar - contador de tiempo en gym */}
      <Pressable onPress={() => nav('workout')} style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <View style={styles.trainIcon}><Ionicons name="flame" size={22} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>🔥 ENTRENAR</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Cronómetro de tiempo en gym + cardio por tiempo</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      </Pressable>

      {/* Modelos gym - API gratuita Unsplash */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, marginBottom: 8 }}>🔥 Modelos MODO-GYM</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {[
            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1594381898411-58a962c6f3a8?auto=format&fit=crop&w=300&q=80',
            'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=300&q=80',
          ].map((uri, i) => (
            <Image key={i} source={{ uri }} style={{ width: 140, height: 90, borderRadius: 12 }} />
          ))}
        </ScrollView>
      </View>

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

      {/* Progreso semanal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Tu Progreso Semanal</Text>
        <Text style={{ color: '#D1D5DB', fontSize: 12, marginTop: 6 }}>{progressMsg}</Text>
        {history.length > 0 && (
          <View style={{ marginTop: 8, gap: 4 }}>
            {history.slice(-3).map((h: any, i: number) => (
              <Text key={i} style={{ color: '#9CA3AF', fontSize: 11 }}>{new Date(h.date).toLocaleDateString()} — {h.weight}kg / {h.height}cm {h.daysTrained ? `· ${h.daysTrained} días` : ''}</Text>
            ))}
          </View>
        )}
        <Pressable onPress={() => { setEditWeight(String(profile.weight)); setEditHeight(String(profile.height)); setEditDays(String(profile.daysPerWeek)); setEditMode(!editMode); }} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnTxt}>{editMode ? 'CANCELAR' : '✏️ EDITAR PESO / ALTURA / DÍAS'}</Text>
        </Pressable>
        {editMode && (
          <View style={{ marginTop: 12, gap: 8 }}>
            <TextInput value={editWeight} onChangeText={setEditWeight} placeholder={`${profile.weight} kg`} placeholderTextColor="#6B7280" keyboardType="numeric" style={styles.input} />
            <TextInput value={editHeight} onChangeText={setEditHeight} placeholder={`${profile.height} cm`} placeholderTextColor="#6B7280" keyboardType="numeric" style={styles.input} />
            <TextInput value={editDays} onChangeText={setEditDays} placeholder={`${profile.daysPerWeek} días/semana`} placeholderTextColor="#6B7280" keyboardType="numeric" style={styles.input} />
            <Pressable onPress={async () => {
              const w = Number(editWeight) || profile.weight;
              const h = Number(editHeight) || profile.height;
              const d = Number(editDays) || profile.daysPerWeek;
              await setProfile({ ...profile, weight: w, height: h, daysPerWeek: d });
              await addEntry({ date: new Date().toISOString(), weight: w, height: h, daysTrained: d });
              setEditMode(false);
              setTimeout(() => Alert.alert('¡Actualizado! 🎉', getMessage()), 300);
            }} style={[styles.primaryBtn, { backgroundColor: colors.success }]}>
              <Text style={styles.primaryBtnTxt}>GUARDAR PROGRESO</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Recomendación IA */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.cardTitle}>🧠 Tu Rutina Recomendada IA</Text>
          <View style={styles.badge}><Text style={styles.badgeTxt}>{profile.daysPerWeek} DÍAS · {gymLevelLabel(profile.level).toUpperCase()}</Text></View>
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
          { icon: 'restaurant', label: 'Dieta Semanal', sub: 'Personalizada', nav: 'diet', color: '#10B981' },
          { icon: 'sparkles', label: 'MODO IA', sub: 'Gratis 24/7', nav: 'ai', color: '#8B5CF6' },
          { icon: 'barbell', label: 'Mis Rutinas', sub: `${profile.daysPerWeek} días`, nav: 'routines', color: '#0EA5E9' },
        ].map((c) => (
          <Pressable key={c.label} onPress={() => nav(c.nav)} style={({ pressed }) => [styles.quick, pressed && { transform: [{ scale: 0.98 }] }]}>
            <View style={[styles.quickIcon, { backgroundColor: c.color }]}>
              <Ionicons name={c.icon as any} size={20} color="#fff" />
            </View>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, marginTop: 10, textAlign: 'center' }}>{c.label}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{c.sub}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 24 }}>MODO-GYM · El poder está en tu interior</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, padding: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)' },
  logoTxt: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  objRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  objDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD60A' },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  stat: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 24, fontFamily: statFont.bold, letterSpacing: 0 },
  statLbl: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2, fontFamily: appFont.bold },
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
  quickIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },  input: { backgroundColor: colors.surface2, borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: colors.border },
  trainIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  halloweenBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,122,24,0.22)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,122,24,0.6)' },
  halloweenBadgeTxt: { color: '#FFB067', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
});
