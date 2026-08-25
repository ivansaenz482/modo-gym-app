import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors } from '../theme/colors';
import { useRoutineStore } from '../store/routineStore';
import { useUserStore } from '../store/userStore';
import { generateRoutineRecommendation } from '../services/aiService';
import { Exercise } from '../services/exerciseService';

function RoutineVideo({ ex }: { ex: Exercise }) {
  const isGif = ex.videoUrl?.endsWith('.gif');
  const isMp4 = ex.videoUrl?.endsWith('.mp4');
  const player = useVideoPlayer(isMp4 ? ex.videoUrl! : '', (p) => { if (isMp4) { p.loop = true; p.play(); } });
  if (isGif) return <Image source={{ uri: ex.videoUrl }} style={{ width: '100%', height: 220 }} resizeMode="contain" />;
  if (isMp4) return <VideoView player={player} style={{ width: '100%', height: 220 }} contentFit="contain" nativeControls allowsFullscreen />;
  return <Image source={{ uri: ex.image }} style={{ width: '100%', height: 220 }} resizeMode="cover" />;
}

export function RoutinesScreen({ nav }: { nav: (s: string) => void }) {
  const { routines, load, removeRoutine } = useRoutineStore();
  const { profile } = useUserStore();
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  useEffect(() => { load(); }, []);
  const rec = profile ? generateRoutineRecommendation(profile.daysPerWeek, profile.goal) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.hero}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>📋 Mis Rutinas Diarias</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Toca un ejercicio para ver su vídeo</Text>
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
          <Text style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>Aún no tienes rutinas. Explora ejercicios por secciones y toca "+ RUTINA".</Text>
          <Pressable onPress={() => nav('exercises')} style={[styles.cta, { marginTop: 16 }]}><Text style={styles.ctaTxt}>EXPLORAR POR SECCIONES</Text></Pressable>
        </View>
      ) : (
        routines.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{r.name}</Text>
              <Pressable onPress={() => removeRoutine(r.id)}><Ionicons name="trash-outline" size={18} color={colors.error} /></Pressable>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>{new Date(r.date).toLocaleString()} · Toca el vídeo ▶</Text>
            {r.exercises.map((e) => (
              <Pressable key={e.id} onPress={() => setSelectedEx(e as Exercise)} style={styles.exRow}>
                <Image source={{ uri: e.image }} style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.surface3 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{e.name}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{e.target} · {e.equipment}</Text>
                </View>
                <View style={styles.playBtn}><Ionicons name="play" size={14} color="#fff" /></View>
              </Pressable>
            ))}
          </View>
        ))
      )}

      <Modal visible={!!selectedEx} animationType="slide" onRequestClose={() => setSelectedEx(null)}>
        {selectedEx && (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <RoutineVideo ex={selectedEx} />
            <Pressable onPress={() => setSelectedEx(null)} style={styles.close}><Ionicons name="close" size={22} color="#fff" /></Pressable>
            <View style={{ padding: 16 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{selectedEx.name}</Text>
              <Text style={{ color: colors.primary, marginTop: 4 }}>{selectedEx.target} · Ver vídeo en loop + pasos en detalle</Text>
            </View>
          </View>
        )}
      </Modal>
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
  exRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: colors.surface2, borderRadius: 12, padding: 10, gap: 8 },
  playBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  close: { position: 'absolute', top: 40, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
