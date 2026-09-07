import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors } from '../theme/colors';
import { useRoutineStore } from '../store/routineStore';
import { useUserStore } from '../store/userStore';
import { generateRoutineRecommendation } from '../services/aiService';
import { translateInstructions, translateDifficulty, translateEquipment } from '../services/translationService';
import { Exercise } from '../services/exerciseService';
import { useLocaleStore } from '../store/localeStore';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { WeightPanel } from '../components/ui/WeightPanel';
import { useWeightStore } from '../store/weightStore';
import { classifyWeightCategory, recomendarPesoInicial, sugerirProgresion, mensajePeso, categoriaLabel } from '../services/weightService';
import { RestTimer } from '../components/ui/RestTimer';
import { useProgressStore } from '../store/progressStore';

function RoutineVideo({ ex }: { ex: Exercise }) {
  const isGif = ex.videoUrl?.endsWith('.gif');
  const isMp4 = ex.videoUrl?.endsWith('.mp4');
  const player = useVideoPlayer(isMp4 ? ex.videoUrl! : '', (p) => { if (isMp4) { p.loop = true; p.play(); } });
  if (isGif) return <Image source={{ uri: ex.videoUrl }} style={{ width: '100%', height: 220 }} resizeMode="contain" />;
  if (isMp4) return <VideoView player={player} style={{ width: '100%', height: 220 }} contentFit="contain" nativeControls allowsFullscreen />;
  return <Image source={{ uri: ex.image }} style={{ width: '100%', height: 220 }} resizeMode="cover" />;
}

export function RoutinesScreen({ nav }: { nav: (s: string) => void }) {
  const { routines, load, removeRoutine, removeExerciseFromDay } = useRoutineStore();
  const { profile } = useUserStore();
  const { locale } = useLocaleStore();
  const { weights, lastWeightFor, logWeight } = useWeightStore();
  const logBodyParts = useProgressStore((s) => s.logBodyParts);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  useEffect(() => { load(); useWeightStore.getState().load(); }, []);

  const registrarSesion = async (r: { dayNumber: number; exercises: Exercise[] }) => {
    const parts = r.exercises.map((e) => (e as any).section || e.bodyPart || e.target).filter(Boolean);
    if (parts.length === 0) { alert('Este día no tiene ejercicios aún. Añade 1-3 ejercicios para registrar la sesión.'); return; }
    await logBodyParts(parts);
    alert(`✓ Sesión del Día ${r.dayNumber} registrada. El progreso de tus músculos se actualizó en Mi Progreso.`);
  };
  const rec = profile ? generateRoutineRecommendation(profile.daysPerWeek, profile.goal) : null;

  const applyIARoutine = async () => {
    if (!rec || !profile) return;
    // Crea un día vacío por cada día recomendado, si no existe
    const { addRoutine } = useRoutineStore.getState();
    for (let i = 0; i < rec.split.length; i++) {
      const dayNum = i + 1;
      const exists = routines.find((r) => r.dayNumber === dayNum);
      if (!exists) {
        await addRoutine({ id: `ia-day-${dayNum}-${Date.now()}`, name: `Día ${dayNum} - ${rec.split[i]}`, dayNumber: dayNum, exercises: [], warmup: rec.warmup, date: new Date().toISOString() });
      }
    }
    alert(`✓ Rutina IA creada por días (${rec.split.length} días). Ahora añade 1-3 ejercicios a cada día desde Ejercicios.`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <ScreenHeader icon="list" title="Mis Rutinas Diarias" subtitle="Toca un ejercicio para ver su vídeo y ejecución" />

      {rec && (
        <View style={styles.card}>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>RECOMENDACIÓN IA · {profile?.daysPerWeek} DÍAS</Text>
          {rec.split.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <View style={styles.num}><Text style={{ color: '#fff', fontWeight: '900' }}>{i + 1}</Text></View>
              <Text style={{ color: '#fff', fontWeight: '700', flex: 1 }}>{s}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <PrimaryButton label="APLICAR POR DÍAS" onPress={applyIARoutine} variant="success" />
            <PrimaryButton label="+ AÑADIR" onPress={() => nav('exercises')} />
          </View>
          <Text style={{ color: '#6B7280', fontSize: 10, marginTop: 6, textAlign: 'center' }}>Crea Día 1, Día 2... y luego asigna 1-3 ejercicios a cada día. La IA ya te da la división por días.</Text>
        </View>
      )}

      {routines.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={40} color="#6B7280" />
          <Text style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>Aún no tienes rutinas por días. Toca APLICAR POR DÍAS de la IA o añade 1-3 ejercicios a cada día.</Text>
          <Pressable onPress={() => nav('exercises')} style={[styles.cta, { marginTop: 16 }]}><Text style={styles.ctaTxt}>EXPLORAR POR SECCIONES</Text></Pressable>        </View>
      ) : (
        routines
          .slice().sort((a,b)=>a.dayNumber-b.dayNumber)
          .map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={[styles.num, { backgroundColor: colors.primary }]}><Text style={{ color: '#fff', fontWeight: '900' }}>{r.dayNumber}</Text></View>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{r.name}</Text>
                <View style={{ backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ color: '#9CA3AF', fontSize: 11 }}>{r.exercises.length} ej.</Text></View>
              </View>
              <Pressable onPress={() => removeRoutine(r.id)}><Ionicons name="trash-outline" size={18} color={colors.error} /></Pressable>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>{new Date(r.date).toLocaleDateString()} · Día {r.dayNumber} · Toca vídeo ▶</Text>
            {r.exercises.length === 0 ? (
              <Pressable onPress={() => nav('exercises')} style={{ marginTop: 10, backgroundColor: colors.surface2, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }}>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>+ Añadir 1-3 ejercicios a este día</Text>
              </Pressable>
            ) : r.exercises.map((e) => (
              <Pressable key={e.id} onPress={() => setSelectedEx(e as Exercise)} style={styles.exRow}>
                <Image source={{ uri: e.image }} style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.surface3 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{e.name}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{(e as any).targetEs || e.target} · {e.equipment}</Text>
                </View>
                {lastWeightFor(e.id) ? (
                  <View style={styles.weightBadge}>
                    <Ionicons name="barbell" size={11} color="#fff" />
                    <Text style={styles.weightTxt}>{lastWeightFor(e.id)!.weight} kg</Text>
                  </View>
                ) : null}
                <Pressable onPress={() => removeExerciseFromDay(r.id, e.id)} style={{ padding: 6 }}><Ionicons name="close-circle" size={20} color={colors.error} /></Pressable>
                <View style={styles.playBtn}><Ionicons name="play" size={14} color="#fff" /></View>
              </Pressable>
            ))}
            {r.exercises.length > 0 && (
              <Pressable onPress={() => registrarSesion(r)} style={styles.sessionBtn}>
                <Ionicons name="checkmark-done" size={15} color="#fff" />
                <Text style={styles.sessionTxt}>REGISTRAR SESIÓN · ACTUALIZAR PROGRESO</Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <Modal visible={!!selectedEx} animationType="slide" onRequestClose={() => setSelectedEx(null)}>
        {selectedEx && (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
              <RoutineVideo ex={selectedEx} />
              <Pressable onPress={() => setSelectedEx(null)} style={styles.close}><Ionicons name="close" size={22} color="#fff" /></Pressable>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  <View style={styles.tag}><Text style={styles.tagTxt}>{selectedEx.category}</Text></View>
                  <View style={styles.tag}><Text style={styles.tagTxt}>{translateDifficulty(selectedEx.difficulty, locale)}</Text></View>
                  <View style={styles.tag}><Text style={styles.tagTxt}>{translateEquipment(selectedEx.equipment, locale)}</Text></View>
                </View>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{selectedEx.name}</Text>
                <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 4 }}>{locale === 'es' ? 'Objetivo' : 'Target'}: {(selectedEx as any).targetEs || selectedEx.target} · {locale === 'es' ? 'Secundarios' : 'Secondary'}: {selectedEx.secondaryMuscles?.join(', ')}</Text>
                <WeightPanel exercise={selectedEx} />
                <RestTimer exercise={selectedEx} />
                {selectedEx.instructions?.length > 0 && (
                  <>
                    <Text style={{ color: '#fff', fontWeight: '800', marginTop: 16 }}>{locale === 'es' ? 'Cómo se realiza:' : 'How to perform:'}</Text>
                    {translateInstructions(selectedEx.instructions, locale).map((s, i) => (
                      <View key={i} style={styles.step}><View style={styles.stepNum}><Text style={{ color: '#fff', fontWeight: '800' }}>{i + 1}</Text></View><Text style={{ color: '#D1D5DB', flex: 1, fontSize: 13 }}>{s}</Text></View>
                    ))}
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  num: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  cta: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12 },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 12 },
  empty: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  exRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: colors.surface2, borderRadius: 12, padding: 10, gap: 8 },
  playBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  weightBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.surface3, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  weightTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  sessionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, borderRadius: 11, padding: 11, marginTop: 12 },
  sessionTxt: { color: '#fff', fontWeight: '900', fontSize: 11 },
  close: { position: 'absolute', top: 40, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tag: { backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  tagTxt: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  step: { flexDirection: 'row', gap: 10, marginTop: 10, backgroundColor: colors.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border },
  stepNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
