import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { askAI, ChatMessage } from '../services/aiService';
import { useUserStore } from '../store/userStore';

export function AIScreen() {
  const { profile } = useUserStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `¡Hola ${profile?.name ?? ''}! Soy MODO Coach 🧠❤️ — IA 100% gratis. Puedo armarte rutinas, dieta, calentamiento y resolver dudas. Prueba: "armame rutina 4 días" o "dieta para bajar peso".` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user' as const, content: input }];
    setMessages(next);
    setInput('');
    setTyping(true);
    const reply = await askAI(next, profile?.goal);
    setMessages([...next, { role: 'assistant', content: reply }]);
    setTyping(false);
  };

  const quicks = ['Rutina 4 días', 'Dieta definir', 'Calentamiento', 'CrossFit WOD', 'Suplementos'];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={{ color: '#fff', fontWeight: '900' }}>MODO IA · Gratis 24/7</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Sin API key · Offline + online</Text>
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
  header: { backgroundColor: colors.surface, padding: 14, borderBottomWidth: 1, borderColor: colors.border, alignItems: 'center' },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  quick: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  quickTxt: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, color: '#fff', borderWidth: 1, borderColor: colors.border },
  send: { backgroundColor: colors.primary, borderRadius: 12, width: 48, alignItems: 'center', justifyContent: 'center' },
});
