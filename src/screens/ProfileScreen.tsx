import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useUserStore } from '../store/userStore';
import { Goal } from '../utils/calculations';
import { SelectField } from '../components/ui/SelectField';
import { ScreenHeader } from '../components/ui/ScreenHeader';

export function ProfileScreen({ onDone }: { onDone?: () => void }) {
  const { profile, setProfile } = useUserStore();
  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(String(profile?.age ?? 25));
  const [sex, setSex] = useState<'M'|'F'|'O'>(profile?.sex ?? 'M');
  const [height, setHeight] = useState(String(profile?.height ?? 175));
  const [weight, setWeight] = useState(String(profile?.weight ?? 75));
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'mantener');
  const [days, setDays] = useState(String(profile?.daysPerWeek ?? 4));
  const [gym, setGym] = useState(profile?.gymName ?? 'MODO-GYM Central');

  useEffect(() => {
    if (profile) {
      setName(profile.name); setAge(String(profile.age)); setSex(profile.sex);
      setHeight(String(profile.height)); setWeight(String(profile.weight));
      setGoal(profile.goal); setDays(String(profile.daysPerWeek)); setGym(profile.gymName || '');
    }
  }, [profile]);

  const save = async () => {
    if (!name || !height || !weight) return Alert.alert('Completa nombre, altura y peso');
    await setProfile({ name, age: Number(age) || 25, sex, height: Number(height), weight: Number(weight), goal, daysPerWeek: Number(days) || 4, gymName: gym, hasOnboarded: true });
    Alert.alert('✓ Datos actualizados', 'Tu perfil se ha guardado. La IA y dieta usarán los nuevos datos.');
    onDone?.();
  };

  const goals: {id:Goal,label:string}[] = [
    {id:'perder_peso',label:'Bajar peso'}, {id:'ganar_musculo',label:'Músculo'}, {id:'definir',label:'Definir'}, {id:'resistencia',label:'Resistencia'}, {id:'mantener',label:'Mantener'}
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20 }}>👤 Mis Datos Personales</Text>
      <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Edita tu perfil cuando quieras. Se usa para rutina, dieta e IA.</Text>
      <ScreenHeader icon="person" title="Perfil" subtitle="Rutina, dieta e IA se adaptan a estos datos" />
      <View style={styles.card}>
        <Text style={styles.label}>NOMBRE</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#6B7280" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><Text style={styles.label}>EDAD</Text><TextInput value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} /></View>
          <View style={{ flex: 1 }}><SelectField label="SEXO" value={sex} onChange={(v) => setSex(v as any)} options={[{ value: 'M', label: 'Hombre', emoji: '👨' }, { value: 'F', label: 'Mujer', emoji: '👩' }, { value: 'O', label: 'No especificar', emoji: '🌈' }]} /></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <View style={{ flex: 1 }}><Text style={styles.label}>ESTATURA CM</Text><TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.input} /></View>
          <View style={{ flex: 1 }}><Text style={styles.label}>PESO KG</Text><TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} /></View>
        </View>
        <Text style={[styles.label, {marginTop: 12}]}>OBJETIVO</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {goals.map(g=> <Pressable key={g.id} onPress={()=>setGoal(g.id)} style={[styles.chip, goal===g.id && styles.chipActive]}><Text style={[styles.chipTxt, goal===g.id && {color:'#fff'}]}>{g.label}</Text></Pressable>)}
        </View>
        <Text style={[styles.label, {marginTop: 12}]}>DÍAS/SEMANA</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>{[2,3,4,5,6].map(d=> <Pressable key={d} onPress={()=>setDays(String(d))} style={[styles.day, days===String(d) && styles.dayActive]}><Text style={[styles.dayTxt, days===String(d) && {color:'#fff'}]}>{d}</Text></Pressable>)}</View>
        <Text style={[styles.label, {marginTop: 12}]}>GYM</Text>
        <TextInput value={gym} onChangeText={setGym} style={styles.input} />
        <Pressable onPress={save} style={styles.save}><Text style={styles.saveTxt}>GUARDAR CAMBIOS</Text></Pressable>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  label: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  sexBtn: { flex: 1, backgroundColor: colors.surface2, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  sexActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sexTxt: { color: '#9CA3AF', fontWeight: '700' },
  chip: { backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { color: '#9CA3AF', fontWeight: '700', fontSize: 12 },
  day: { flex: 1, backgroundColor: colors.surface2, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayTxt: { color: '#9CA3AF', fontWeight: '800' },
  save: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  saveTxt: { color: '#fff', fontWeight: '900' },
});
