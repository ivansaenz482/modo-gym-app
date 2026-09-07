import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useUserStore } from '../store/userStore';
import { calculateBMI, bmiCategory, Goal } from '../utils/calculations';
import { Logo } from '../components/ui/Logo';
import { SelectField } from '../components/ui/SelectField';

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('24');
  const [sex, setSex] = useState<'M' | 'F' | 'O'>('M');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [goal, setGoal] = useState<Goal>('ganar_musculo');
  const [days, setDays] = useState(4);
  const [gym, setGym] = useState('MODO-GYM Central');
  const { setProfile } = useUserStore();

  const bmi = height && weight ? calculateBMI(Number(weight), Number(height)) : 0;

  const submit = async () => {
    if (!name || !height || !weight) return Alert.alert('Completa tus datos');
    await setProfile({
      name, age: Number(age), sex, height: Number(height), weight: Number(weight), goal, daysPerWeek: days, gymName: gym, hasOnboarded: true,
    });
    onDone();
  };

  const goals: { id: Goal; label: string; emoji: string }[] = [
    { id: 'perder_peso', label: 'Bajar peso', emoji: '🔥' },
    { id: 'ganar_musculo', label: 'Ganar músculo', emoji: '💪' },
    { id: 'definir', label: 'Definir', emoji: '✨' },
    { id: 'resistencia', label: 'Resistencia', emoji: '🏃' },
    { id: 'mantener', label: 'Mantener', emoji: '⚖️' },
  ];

  return (
    <LinearGradient colors={['#0A0A0F', '#1A0A0A', '#0A0A0F']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
          <Logo size={72} />
          <Text style={styles.hello}>Bienvenido a tu transformación</Text>
          <Text style={styles.sub}>Cuéntanos sobre ti para personalizar todo</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>NOMBRE</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor="#6B7280" style={styles.input} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>EDAD</Text>
              <TextInput value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <SelectField
                label="SEXO"
                value={sex}
                onChange={(v) => setSex(v as any)}
                options={[
                  { value: 'M', label: 'Hombre', emoji: '👨' },
                  { value: 'F', label: 'Mujer', emoji: '👩' },
                  { value: 'O', label: 'Prefiero no decir', emoji: '🌈' },
                ]}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>ESTATURA (CM)</Text>
              <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.input} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>PESO (KG)</Text>
              <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} />
            </View>
          </View>

          {bmi > 0 && (
            <View style={styles.bmi}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>IMC: {bmi}</Text>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{bmiCategory(bmi)}</Text>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>OBJETIVO PRINCIPAL</Text>
          <View style={styles.goals}>
            {goals.map((g) => (
              <Pressable key={g.id} onPress={() => setGoal(g.id)} style={[styles.goal, goal === g.id && styles.goalActive]}>
                <Text style={{ fontSize: 20 }}>{g.emoji}</Text>
                <Text style={[styles.goalTxt, goal === g.id && { color: '#fff' }]}>{g.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>DÍAS POR SEMANA EN EL GYM</Text>
          <View style={styles.days}>
            {[2, 3, 4, 5, 6].map((d) => (
              <Pressable key={d} onPress={() => setDays(d)} style={[styles.day, days === d && styles.dayActive]}>
                <Text style={[styles.dayTxt, days === d && { color: '#fff' }]}>{d}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>GYM DONDE ENTRENAS</Text>
          <TextInput value={gym} onChangeText={setGym} placeholder="MODO-GYM" placeholderTextColor="#6B7280" style={styles.input} />

          <Pressable onPress={submit} style={styles.cta}>
            <LinearGradient colors={[colors.primary, '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
              <Text style={styles.ctaTxt}>COMENZAR MI TRANSFORMACIÓN →</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.footer}>MODO-GYM · El poder está en tu interior</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  hello: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 16 },
  sub: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  label: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderRadius: 12, padding: 14, color: '#fff', borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  row: { flexDirection: 'row' },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexBtn: { flex: 1, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  sexActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sexTxt: { color: '#9CA3AF', fontWeight: '700' },
  bmi: { backgroundColor: '#1F1F2A', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goal: { width: '48%', backgroundColor: colors.surface2, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 8 },
  goalActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  goalTxt: { color: '#9CA3AF', fontWeight: '700', fontSize: 12 },
  days: { flexDirection: 'row', gap: 8 },
  day: { flex: 1, backgroundColor: colors.surface2, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayTxt: { color: '#9CA3AF', fontWeight: '800', fontSize: 16 },
  cta: { marginTop: 20, borderRadius: 14, overflow: 'hidden' },
  ctaGrad: { padding: 16, alignItems: 'center' },
  ctaTxt: { color: '#fff', fontWeight: '900', letterSpacing: 0.5 },
  footer: { color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 12 },
});
