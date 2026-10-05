import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors } from '../theme/colors';
import { fetchExercises, categories, Exercise } from '../services/exerciseService';
import { useRoutineStore } from '../store/routineStore';
import { useLocaleStore } from '../store/localeStore';
import { translateInstructions, translateDifficulty, translateEquipment } from '../services/translationService';
import { MenuButton } from '../components/ui/MenuButton';
import { RestTimer } from '../components/ui/RestTimer';
import { RegisterExerciseModal } from '../components/ui/RegisterExerciseModal';

function VideoPreview({ uri, thumb }: { uri?: string; thumb?: string }) {
  const isGif = uri?.endsWith('.gif');
  const isMp4 = uri?.endsWith('.mp4');
  const player = useVideoPlayer(uri && isMp4 ? uri : '', (p) => {
    if (isMp4) {
      p.loop = true;
      p.muted = true;
      p.play();
    }
  });
  if (!uri) return <Image source={{ uri: thumb }} style={styles.img} resizeMode="cover" />;
  if (isGif) return <Image source={{ uri }} style={styles.img} resizeMode="cover" />;
  if (isMp4) return <VideoView player={player} style={styles.img} contentFit="cover" nativeControls={false} />;
  return <Image source={{ uri: thumb || uri }} style={styles.img} resizeMode="cover" />;
}

function DetailVideo({ uri, thumb }: { uri?: string; thumb?: string }) {
  const isGif = uri?.endsWith('.gif');
  const isMp4 = uri?.endsWith('.mp4');
  const player = useVideoPlayer(uri && isMp4 ? uri : '', (p) => {
    if (isMp4) {
      p.loop = true;
      p.play();
    }
  });
  if (!uri) return <Image source={{ uri: thumb }} style={{ width: '100%', height: 260 }} resizeMode="cover" />;
  if (isGif) return <Image source={{ uri }} style={{ width: '100%', height: 260 }} resizeMode="contain" />;
  if (isMp4) return <VideoView player={player} style={{ width: '100%', height: 260 }} contentFit="contain" nativeControls allowsFullscreen />;
  return <Image source={{ uri: thumb }} style={{ width: '100%', height: 260 }} resizeMode="cover" />;
}

export function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState('todos');
  const [pendingEx, setPendingEx] = useState<Exercise | null>(null);
  const [registerEx, setRegisterEx] = useState<Exercise | null>(null);
  const { favorites, toggleFav, addExerciseToDay } = useRoutineStore();
  const { locale, setLocale, country, setCountry, load } = useLocaleStore();
  const { profile } = require('../store/userStore').useUserStore();
  const days = profile?.daysPerWeek ?? 4;
  useEffect(() => { load(); }, []);

  const muscleGroups = ['todos', 'cardio', 'pecho', 'espalda', 'bíceps', 'tríceps', 'piernas', 'hombros', 'abdomen', 'glúteos', 'full body'];

  useEffect(() => {
    fetchExercises().then((d) => { setExercises(d); setLoading(false); });
  }, []);

  const filtered = exercises.filter((e) => {
    const matchQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || (e as any).section?.toLowerCase().includes(q.toLowerCase());
    const matchCat = cat === 'all' || e.category === cat;
    const m = selectedMuscle.toLowerCase();
    const section = ((e as any).section || e.targetEs || e.target || '').toLowerCase();
    const matchMuscle = m === 'todos' || (m === 'cardio' ? e.category === 'cardio' : section === m || section.includes(m) || m.includes(section));
    return matchQ && matchCat && matchMuscle;
  });

  const toggleRoutine = async (ex: Exercise) => {
    setPendingEx(ex);
  };
  const confirmAddToDay = async (day: number) => {
    if (!pendingEx) return;
    await addExerciseToDay(pendingEx, day);
    setPendingEx(null);
    alert(`✓ Agregado a Día ${day}`);
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} size="large" /><Text style={{ color: '#9CA3AF', marginTop: 12 }}>Cargando 800+ ejercicios con vídeo...</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput value={q} onChangeText={setQ} placeholder={locale === 'es' ? "Buscar press banca, sentadilla..." : "Search bench press, squat..."} placeholderTextColor="#6B7280" style={styles.search} />
        </View>
        <Pressable style={styles.searchBtn}><Ionicons name="options" size={18} color="#fff" /></Pressable>
        <MenuButton />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ color: '#6B7280', fontSize: 11 }}>{country} · {locale === 'es' ? 'Idioma:' : 'Language:'}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(['es', 'en'] as const).map((l) => (
            <Pressable key={l} onPress={() => setLocale(l)} style={[styles.langBtn, locale === l && styles.langActive]}>
              <Text style={[styles.langTxt, locale === l && { color: '#fff' }]}>{l.toUpperCase()}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setCountry(country === 'EC' ? 'US' : country === 'US' ? 'ES' : 'EC')} style={styles.langBtn}>
            <Text style={styles.langTxt}>{country} 🌐</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {muscleGroups.map((m) => (
            <Pressable key={m} onPress={() => setSelectedMuscle(m)} style={[styles.chip, selectedMuscle === m && { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' }]}>
              <Text style={[styles.chipTxt, selectedMuscle === m && { color: '#fff' }]}>{m.toUpperCase()}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 8 }}>{filtered.length} ejercicios · {selectedMuscle !== 'todos' ? `Sección ${selectedMuscle.toUpperCase()} · ` : ''}Clasificados por músculo</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)} style={styles.card}>
            <VideoPreview uri={item.videoUrl} thumb={item.image} />
            {item.category !== 'calentamiento' && <View style={styles.badgeCat}><Text style={styles.badgeCatTxt}>{(item as any).section?.toUpperCase() || item.category.toUpperCase()}</Text></View>}
            <View style={styles.playBadge}><Ionicons name="play" size={10} color="#fff" /><Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}> VÍDEO</Text></View>
            <Pressable onPress={() => toggleFav(item.id)} style={styles.heart}>
              <Ionicons name={favorites.includes(item.id) ? 'heart' : 'heart-outline'} size={16} color={favorites.includes(item.id) ? colors.primary : '#fff'} />
            </Pressable>
            <View style={{ padding: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }} numberOfLines={2}>{item.name}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 4 }}>{(item as any).section || (item as any).targetEs || item.target} · {translateEquipment(item.equipment, locale)}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <Pressable onPress={() => setSelected(item)} style={styles.miniBtn}><Text style={styles.miniTxt}>VER VÍDEO</Text></Pressable>
                <Pressable onPress={() => toggleRoutine(item)} style={[styles.miniBtn, { backgroundColor: colors.primary }]}><Ionicons name="add" size={12} color="#fff" /><Text style={styles.miniTxt}>RUTINA</Text></Pressable>
              </View>
            </View>
          </Pressable>
        )}
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
              <DetailVideo uri={selected.videoUrl} thumb={selected.image} />
              <Pressable onPress={() => setSelected(null)} style={styles.close}><Ionicons name="close" size={22} color="#fff" /></Pressable>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  <View style={styles.tag}><Text style={styles.tagTxt}>{selected.category}</Text></View>
                  <View style={styles.tag}><Text style={styles.tagTxt}>{translateDifficulty(selected.difficulty, locale)}</Text></View>
                  <View style={styles.tag}><Text style={styles.tagTxt}>{translateEquipment(selected.equipment, locale)}</Text></View>
                </View>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{selected.name}</Text>
                <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 4 }}>{locale === 'es' ? 'Objetivo' : 'Target'}: {(selected as any).targetEs || selected.target} · {locale === 'es' ? 'Secundarios' : 'Secondary'}: {selected.secondaryMuscles.join(', ')}</Text>
                <View style={{ marginTop: 12, backgroundColor: colors.surface2, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="videocam" size={16} color={colors.primary} />
                  <Text style={{ color: '#D1D5DB', fontSize: 12, flex: 1 }}>Vídeo/GIF en loop + imagen HD. Si no carga, revisa conexión. 1.300+ vídeos.</Text>
                </View>
                <RestTimer exercise={selected} />
                <Text style={{ color: '#fff', fontWeight: '800', marginTop: 16 }}>{locale === 'es' ? 'Cómo se realiza:' : 'How to perform:'}</Text>
                {translateInstructions(selected.instructions, locale).map((s, i) => (
                  <View key={i} style={styles.step}><View style={styles.stepNum}><Text style={{ color: '#fff', fontWeight: '800' }}>{i + 1}</Text></View><Text style={{ color: '#D1D5DB', flex: 1, fontSize: 13 }}>{s}</Text></View>
                ))}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <Pressable onPress={() => toggleRoutine(selected)} style={[styles.cta, { flex: 1, backgroundColor: colors.primary }]}><Text style={styles.ctaTxt}>+ AGREGAR A DÍA</Text></Pressable>
                  <Pressable onPress={() => toggleFav(selected.id)} style={[styles.cta, { backgroundColor: colors.surface2 }]}><Ionicons name={favorites.includes(selected.id) ? 'heart' : 'heart-outline'} size={18} color={favorites.includes(selected.id) ? colors.primary : '#fff'} /></Pressable>
                </View>
                <Pressable onPress={() => setRegisterEx(selected)} style={[styles.cta, { backgroundColor: colors.success, marginTop: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="checkmark-done" size={16} color="#fff" />
                    <Text style={styles.ctaTxt}>REGISTRAR EJERCICIO · SUMAR CALORÍAS</Text>
                  </View>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal visible={!!pendingEx} transparent animationType="fade" onRequestClose={() => setPendingEx(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, width: '100%', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16, textAlign: 'center' }}>¿A qué día lo agregas?</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 4 }}>{pendingEx?.name}</Text>
            <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Haces {days} días/semana — elige 1…{days}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, justifyContent: 'center' }}>
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                <Pressable key={d} onPress={() => confirmAddToDay(d)} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, minWidth: 80, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '900' }}>DÍA {d}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setPendingEx(null)} style={{ marginTop: 12, alignItems: 'center', padding: 10 }}><Text style={{ color: '#9CA3AF', fontWeight: '700' }}>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>

      <RegisterExerciseModal exercise={registerEx} visible={!!registerEx} onClose={() => setRegisterEx(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', padding: 16, gap: 8 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, gap: 8 },
  search: { flex: 1, paddingVertical: 12, color: '#fff' },
  searchBtn: { backgroundColor: colors.primary, borderRadius: 12, width: 48, alignItems: 'center', justifyContent: 'center' },
  chip: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { color: '#9CA3AF', fontWeight: '700', fontSize: 12 },
  langBtn: { backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  langActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langTxt: { color: '#9CA3AF', fontSize: 11, fontWeight: '800' },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  img: { width: '100%', height: 120, backgroundColor: colors.surface2 },
  badgeCat: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  badgeCatTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  playBadge: { position: 'absolute', top: 32, left: 8, backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' },
  heart: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  miniBtn: { flexDirection: 'row', gap: 4, backgroundColor: colors.surface2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  miniTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  close: { position: 'absolute', top: 40, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tag: { backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  tagTxt: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  step: { flexDirection: 'row', gap: 10, marginTop: 10, backgroundColor: colors.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border },
  stepNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  cta: { borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center' },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 12 },
});
