import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { useMembershipStore, nextExpiryDate, calcExpiryAlert, MembershipPlan } from '../store/membershipStore';
import { scheduleMembershipAlerts } from '../services/notificationService';
import { useUserStore } from '../store/userStore';
import { ScreenHeader } from '../components/ui/ScreenHeader';

export function MembershipScreen() {
  const { memberships, expenses, load, addMembership, addExpense, removeMembership, renewMembership } = useMembershipStore();
  const { profile } = useUserStore();
  const [gym, setGym] = useState('MODO-GYM Central');
  const [plan, setPlan] = useState<MembershipPlan>('mensual');
  const [price, setPrice] = useState('80');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => { load(); }, []);

  const createMem = async () => {
    if (!gym || !price) return Alert.alert('Completa gym y precio');
    const start = startDate ? new Date(startDate) : new Date();
    const end = nextExpiryDate(start, plan);
    const m = { id: Date.now().toString(), gymName: gym, plan, startDate: start.toISOString(), endDate: end.toISOString(), price: Number(price), paid: true };
    await addMembership(m);
    await scheduleMembershipAlerts(m, profile?.daysPerWeek);
    const d = profile?.daysPerWeek ?? 4;
    Alert.alert('✓ Membresía guardada', `Inicio: ${start.toLocaleDateString()} · Vence: ${end.toLocaleDateString()}. Te avisaré cuando falte y recordaré entrenar ${d} días/semana.`);
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (date) setStartDate(date);
  };

  const addExp = async () => {
    if (!concept || !amount) return Alert.alert('Completa concepto y monto');
    await addExpense({ id: Date.now().toString(), concept, amount: Number(amount), date: new Date().toISOString(), category: 'otro' });
    setConcept(''); setAmount('');
  };

  const handleRenew = async (m: any) => {
    Alert.alert('Renovar membresía', `¿Extender ${m.gymName} por ${m.plan === 'diaria' ? '1 día' : m.plan === 'trimestral' ? '1 trimestre' : '1 mes'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí, renovar',
        onPress: async () => {
          const updated = await renewMembership(m.id);
          if (updated) {
            await scheduleMembershipAlerts(updated, profile?.daysPerWeek);
            Alert.alert('✓ Renovado', `Nuevo vencimiento: ${new Date(updated.endDate).toLocaleDateString()}.`);
          }
        },
      },
    ]);
  };

  const totalGastos = expenses.reduce((s, e) => s + e.amount, 0) + memberships.reduce((s, m) => s + m.price, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <ScreenHeader icon="card" title="Membresía & Pagos" subtitle="Alertas automáticas diaria / mensual / trimestral" />

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
        <Text style={[styles.label, { marginTop: 4 }]}>FECHA DE INICIO DE LA MEMBRESÍA</Text>
        <Pressable onPress={() => setShowPicker(true)} style={styles.dateBtn}>
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 10 }}>{startDate.toLocaleDateString()}</Text>
          <Text style={{ color: '#6B7280', fontSize: 11, marginLeft: 6 }}>Toca para cambiar</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker value={startDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
        )}
        <Text style={{ color: '#6B7280', fontSize: 10, marginTop: 8, marginBottom: 4 }}>Elige la fecha real en que empezó/pagó la membresía. El vencimiento se calcula desde esa fecha.</Text>
        <Pressable onPress={createMem} style={styles.cta}><Text style={styles.ctaTxt}>GUARDAR MEMBRESÍA</Text></Pressable>
        <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 8, textAlign: 'center' }}>Alerta push cuando falten 7 y 3 días. Valida diaria/mensual/trimestral.</Text>
      </View>

      {/* Lista membresías */}
      {memberships.map((m) => {
        const a = calcExpiryAlert(m.endDate);
        const vencida = a.status === 'vencida';
        const critica = a.status === 'critico';
        return (
          <View key={m.id} style={[styles.card, vencida && { borderColor: colors.error, backgroundColor: '#200A0A' }, critica && { borderColor: colors.warning }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{m.gymName}</Text>
              <View style={[styles.badge, vencida ? { backgroundColor: colors.error } : critica ? { backgroundColor: colors.warning } : { backgroundColor: colors.success }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{vencida ? 'VENCIDA' : a.status.toUpperCase()} · {Math.abs(a.days)}d</Text>
              </View>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{m.plan} · ${m.price} · {new Date(m.startDate).toLocaleDateString()} → {new Date(m.endDate).toLocaleDateString()}</Text>
            {vencida && <Text style={{ color: colors.error, fontSize: 11, marginTop: 4 }}>Membresía vencida. Renueva para continuar.</Text>}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Pressable onPress={() => handleRenew(m)} style={[styles.cta, { flex: 1, marginTop: 0, backgroundColor: colors.success }]}>
                <Text style={styles.ctaTxt}>🔄 RENOVAR (1 {m.plan === 'diaria' ? 'día' : m.plan === 'trimestral' ? 'trimestre' : 'mes'})</Text>
              </Pressable>
              <Pressable onPress={() => removeMembership(m.id)} style={[styles.cta, { flex: 0, marginTop: 0, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }]}>
                <Ionicons name="trash" size={18} color={colors.error} />
              </Pressable>
            </View>
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
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  title: { color: '#fff', fontWeight: '800', marginBottom: 10 },
  label: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderRadius: 12, padding: 12, color: '#fff', borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  plan: { flex: 1, backgroundColor: colors.surface2, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  planActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  planTxt: { color: '#9CA3AF', fontWeight: '800', fontSize: 11 },
  cta: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 12 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
});
