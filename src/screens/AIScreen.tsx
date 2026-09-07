import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { askAI, ChatMessage } from '../services/aiService';
import { useUserStore } from '../store/userStore';
import { ScreenHeader } from '../components/ui/ScreenHeader';

export function AIScreen() {
  const { profile } = useUserStore();
  const hasProfile = profile && profile.weight && profile.height;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: hasProfile
      ? `¡Hola ${profile?.name ?? ''}! Soy MODO Coach 🧠❤️ — IA 100% gratis. Ya tengo tus datos: ${profile?.weight}kg, ${profile?.height}cm, objetivo ${profile?.goal?.replace('_',' ')}, ${profile?.daysPerWeek} días/semana. Puedo armarte rutina personalizada o dieta. Prueba: "armame rutina 4 días con mi peso" o "dieta para definir".`
      : `¡Hola ${profile?.name ?? ''}! Soy MODO Coach 🧠❤️ — IA 100% gratis. Para armarte rutina personalizada necesito: peso, altura, edad, objetivo y días/semana. Ya tengo ${profile?.goal ? `objetivo ${profile.goal}` : 'sin objetivo'} — dime tu peso/altura y te armo todo.` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const lower = input.toLowerCase();
    const isCreateRoutine = (lower.includes('crea') || lower.includes('hazme') || lower.includes('armame') || lower.includes('genera')) && (lower.includes('rutina') || lower.includes('semana'));
    const isCreateDiet = (lower.includes('crea') || lower.includes('hazme') || lower.includes('genera')) && lower.includes('dieta');
    const muscles = ['biceps','triceps','pecho','espalda','piernas','hombros','hombro','abdomen','abdominal','gluteo','glúteos','core','brazo','brazos','femoral','cuadricep','cuádriceps'];
    const hasMuscle = muscles.find(m => lower.includes(m));
    const isBestMuscle = (lower.includes('mejor') || lower.includes('mejores') || lower.includes('dame') || lower.includes('quiero') || lower.includes('ejercicios') || lower.includes('rutina para')) && hasMuscle;
    const next = [...messages, { role: 'user' as const, content: input }];
    setMessages(next);
    setInput('');
    setTyping(true);
    if (isBestMuscle && hasMuscle) {
      const { addBestExercisesForMuscle } = await import('../services/aiService');
      const res = await addBestExercisesForMuscle(hasMuscle, profile);
      setMessages([...next, { role: 'assistant', content: res }]);
      setTyping(false);
      return;
    }
    if (isCreateRoutine && profile) {
      const { createWeeklyRoutineFromAI } = await import('../services/aiService');
      const res = await createWeeklyRoutineFromAI(profile, input);
      setMessages([...next, { role: 'assistant', content: res.message + ' Ve a Rutinas para verla.' }]);
      setTyping(false);
      return;
    }
    if (isCreateDiet && profile) {
      const { createWeeklyDietFromAI } = await import('../services/aiService');
      const msg = await createWeeklyDietFromAI(profile);
      setMessages([...next, { role: 'assistant', content: msg }]);
      setTyping(false);
      return;
    }
    const reply = await askAI(next, profile?.goal, profile);
    setMessages([...next, { role: 'assistant', content: reply }]);
    setTyping(false);
  };

  const quicks = hasProfile ? ['Mejores biceps', 'Mejores pecho', 'Crea mi rutina semanal', 'Crea mi dieta', 'Suplementos'] : ['Mejores biceps', 'Rutina 4 días', 'Poner peso/altura', 'Calentamiento', 'Suplementos'];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <ScreenHeader icon="sparkles" title="MODO IA" subtitle="Tu coach mental · Gratis 24/7 · Sin API key" />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.bot]}>
            <Text style={{ color: item.role === 'user' ? '#fff' : '#E5E7EB', fontSize: 13, lineHeight: 18 }}>{item.content}</Text>
          </View>
        )}
        ListFooterComponent={typing ? <Text style={{ color: '#6B7280', fontSize: 12 }}>MODO Coach escribiendo...</Text> : null}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {quicks.map((q) => (
            <Pressable key={q} onPress={() => setInput(q)} style={styles.quick}><Text style={styles.quickTxt}>{q}</Text></Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputRow}>
        <TextInput value={input} onChangeText={setInput} placeholder="Pregunta a tu coach..." placeholderTextColor="#6B7280" style={styles.input} onSubmitEditing={send} />
        <Pressable onPress={send} style={styles.send}><Ionicons name="send" size={18} color="#fff" /></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  quick: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  quickTxt: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, color: '#fff', borderWidth: 1, borderColor: colors.border },
  send: { backgroundColor: colors.primary, borderRadius: 12, width: 48, alignItems: 'center', justifyContent: 'center' },
});
