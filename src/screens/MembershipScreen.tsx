import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useMembershipStore, nextExpiryDate, calcExpiryAlert, MembershipPlan } from '../store/membershipStore';
import { scheduleMembershipAlerts } from '../services/notificationService';

export function MembershipScreen() {
  const { memberships, expenses, load, addMembership, addExpense } = useMembershipStore();
  const [gym, setGym] = useState('MODO-GYM Central');
  const [plan, setPlan] = useState<MembershipPlan>('mensual');
  const [price, setPrice] = useState('80');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => { load(); }, []);

  const createMem = async () => {
    if (!gym || !price) return Alert.alert('Completa gym y precio');
    const start = new Date();
    const end = nextExpiryDate(start, plan);
    const m = { id: Date.now().toString(), gymName: gym, plan, startDate: start.toISOString(), endDate: end.toISOString(), price: Number(price), paid: true };
    await addMembership(m);
    await scheduleMembershipAlerts(m);
    Alert.alert('✓ Membresía guardada', `Vence: ${end.toLocaleDateString()} · Te avisaré a los 7,3,1 días y hoy. ¿Renovar?`);
  };

  const addExp = async () => {
    if (!concept || !amount) return Alert.alert('Completa concepto y monto');
    await addExpense({ id: Date.now().toString(), concept, amount: Number(amount), date: new Date().toISOString(), category: 'otro' });
    setConcept(''); setAmount('');
  };

  const totalGastos = expenses.reduce((s, e) => s + e.amount, 0) + memberships.reduce((s, m) => s + m.price, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.hero}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💳 Membresía & Pagos</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Alertas automáticas diaria / mensual / trimestral</Text>
      </View>

      {/* Form membresía */}
      <View style={styles.card}>
        <Text style={styles.title}>Nueva membresía</Text>
        <Text style={styles.label}>GYM</Text>
        <TextInput value={gym} onChangeText={setGym} style={styles.input} placeholderTextColor="#6B7280" />
        <Text style={styles.label}>PLAN</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['diaria', 'mensual', 'trimestral'] as MembershipPlan[]).map((p) => (
            <Pressable key={p} onPress={() => setPlan(p)} style={[styles.plan, plan === p && styles.planActive]}>
              <Text style={[styles.planTxt, plan === p && { color: '#fff' }]}>{p.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.label, { marginTop: 12 }]}>PRECIO (USD)</Text>
        <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
        <Pressable onPress={createMem} style={styles.cta}><Text style={styles.ctaTxt}>GUARDAR MEMBRESÍA</Text></Pressable>
        <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 8, textAlign: 'center' }}>Alerta push cuando falten 7 y 3 días. Valida diaria/mensual/trimestral.</Text>
      </View>

      {/* Lista membresías */}
      {memberships.map((m) => {
        const a = calcExpiryAlert(m.endDate);
        return (
          <View key={m.id} style={[styles.card, a.status === 'vencida' && { borderColor: colors.error }, a.status === 'critico' && { borderColor: colors.warning }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{m.gymName}</Text>
              <View style={[styles.badge, a.status === 'vencida' ? { backgroundColor: colors.error } : a.status === 'critico' ? { backgroundColor: colors.warning } : { backgroundColor: colors.success }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{a.status.toUpperCase()} · {a.days}d</Text>
              </View>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{m.plan} · ${m.price} · {new Date(m.startDate).toLocaleDateString()} → {new Date(m.endDate).toLocaleDateString()}</Text>
          </View>
        );
      })}

      {/* Gastos */}
      <View style={styles.card}>
        <Text style={styles.title}>Gastos de insumos / suplementos</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput value={concept} onChangeText={setConcept} placeholder="Ej: Proteína whey" placeholderTextColor="#6B7280" style={[styles.input, { flex: 1 }]} />
          <TextInput value={amount} onChangeText={setAmount} placeholder="$" placeholderTextColor="#6B7280" keyboardType="numeric" style={[styles.input, { width: 90 }]} />
        </View>
        <Pressable onPress={addExp} style={[styles.cta, { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]}><Text style={[styles.ctaTxt, { color: '#fff' }]}>+ AGREGAR GASTO</Text></Pressable>
        {expenses.slice(-5).map((e) => (
          <View key={e.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, backgroundColor: colors.surface2, borderRadius: 10, padding: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{e.concept}</Text>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>${e.amount}</Text>
          </View>
        ))}
        <View style={{ marginTop: 14, backgroundColor: colors.primary, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>TOTAL GASTOS</Text>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>${totalGastos.toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  title: { color: '#fff', fontWeight: '800', marginBottom: 10 },
  label: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderRadius: 12, padding: 12, color: '#fff', borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  plan: { flex: 1, backgroundColor: colors.surface2, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  planActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  planTxt: { color: '#9CA3AF', fontWeight: '800', fontSize: 11 },
  cta: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 12 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
});
