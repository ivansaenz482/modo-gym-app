import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { MenuButton } from '../components/ui/MenuButton';
import { useHealthStore, bpCategory } from '../store/healthStore';
import { syncSteps } from '../services/healthService';

const GOAL_STEPS = 8000;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function HealthScreen() {
  const { steps, restingHR, bp, load, addSteps, setRestingHR, addBP, removeBP } = useHealthStore();
  const [modal, setModal] = useState<null | 'bp' | 'steps' | 'hr'>(null);
  const [sys, setSys] = useState('120');
  const [dia, setDia] = useState('80');
  const [pulse, setPulse] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [hrInput, setHrInput] = useState('');
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { load(); }, []);

  const today = todayKey();
  const todaySteps = steps[today] || 0;
  const todayHR = restingHR[today] || 0;
  const ratio = Math.min(1, todaySteps / GOAL_STEPS);
  const latestBP = bp[0];
  const bpCat = latestBP ? bpCategory(latestBP.systolic, latestBP.diastolic) : null;

  const doSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    const res = await syncSteps();
    setSyncing(false);
    if (res.steps != null) {
      await useHealthStore.getState().setStepsToday(res.steps);
      setSyncMsg(`Sincronizado (${res.source === 'phone' ? 'teléfono' : 'salud'}): ${res.steps} pasos`);
    } else {
      setSyncMsg(res.message ?? 'No se pudieron leer los pasos automáticamente. Cargalos manual.');
    }
    setTimeout(() => setSyncMsg(null), 6000);
  };

  const saveModal = async () => {
    if (modal === 'bp') {
      const s = Number(sys); const d = Number(dia);
      if (!s || !d) return;
      await addBP(s, d, Number(pulse) || undefined);
    } else if (modal === 'steps') {
      const n = Number(stepsInput);
      if (!n || n < 0) return;
      await useHealthStore.getState().setStepsToday(n);
    } else if (modal === 'hr') {
      const n = Number(hrInput);
      if (!n) return;
      await setRestingHR(n);
    }
    setModal(null);
    setPulse(''); setStepsInput(''); setHrInput('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <ScreenHeader icon="heart" title="Salud" subtitle="Pasos, pulso y presión — del reloj o manual" />
          </View>
          <MenuButton />
        </View>

        {/* Pasos */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="footsteps" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Pasos hoy</Text>
            </View>
            <Text style={styles.bigNum}>{todaySteps.toLocaleString()}</Text>
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: ratio >= 1 ? colors.success : colors.primary }]} /></View>
          <Text style={styles.hint}>Meta: {GOAL_STEPS.toLocaleString()} pasos · {Math.round(ratio * 100)}%</Text>
          <View style={styles.rowBtns}>
            <Pressable onPress={doSync} style={[styles.btn, { backgroundColor: colors.success }]} disabled={syncing}>
              <Ionicons name="sync" size={15} color="#fff" />
              <Text style={styles.btnTxt}>{syncing ? 'SINCRONIZANDO…' : 'SINCRONIZAR'}</Text>
            </Pressable>
            <Pressable onPress={() => { setStepsInput(String(todaySteps || '')); setModal('steps'); }} style={[styles.btn, { backgroundColor: colors.surface3 }]}>
              <Ionicons name="create-outline" size={15} color="#fff" />
              <Text style={styles.btnTxt}>MANUAL</Text>
            </Pressable>
          </View>
          {syncMsg && <Text style={styles.syncMsg}>{syncMsg}</Text>}
        </View>

        {/* Pulso */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="pulse" size={18} color="#EC4899" />
              <Text style={styles.cardTitle}>Pulso en reposo</Text>
            </View>
            <Text style={styles.bigNum}>{todayHR ? `${todayHR} bpm` : '—'}</Text>
          </View>
          <Pressable onPress={() => { setHrInput(todayHR ? String(todayHR) : ''); setModal('hr'); }} style={[styles.btn, { backgroundColor: colors.surface3, alignSelf: 'flex-start' }]}>
            <Ionicons name="create-outline" size={15} color="#fff" />
            <Text style={styles.btnTxt}>REGISTRAR PULSO</Text>
          </Pressable>
        </View>

        {/* Presión */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="water" size={18} color="#EF4444" />
            <Text style={styles.cardTitle}>Presión arterial</Text>
          </View>

          {latestBP ? (
            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.bpValue}>{latestBP.systolic}/{latestBP.diastolic} <Text style={styles.bpUnit}>mmHg</Text></Text>
                <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>
                  {new Date(latestBP.date).toLocaleDateString()}{latestBP.pulse ? ` · ${latestBP.pulse} bpm` : ''}
                </Text>
              </View>
              {bpCat && <View style={[styles.bpTag, { backgroundColor: `${bpCat.color}22`, borderColor: bpCat.color }]}><Text style={[styles.bpTagTxt, { color: bpCat.color }]}>{bpCat.label}</Text></View>}
            </View>
          ) : (
            <Text style={styles.hint2}>Aún no registras tu presión. Cargala manual o desde un tensiómetro compatible.</Text>
          )}

          <Pressable onPress={() => setModal('bp')} style={[styles.btn, { backgroundColor: colors.primary, marginTop: 12, alignSelf: 'flex-start' }]}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.btnTxt}>REGISTRAR PRESIÓN</Text>
          </Pressable>

          {bp.length > 0 && (
            <View style={{ marginTop: 12, gap: 6 }}>
              {bp.slice(0, 6).map((b) => {
                const c = bpCategory(b.systolic, b.diastolic);
                return (
                  <View key={b.id} style={styles.bpRow}>
                    <View style={[styles.dot, { backgroundColor: c.color }]} />
                    <Text style={{ color: '#fff', fontWeight: '800', flex: 1 }}>{b.systolic}/{b.diastolic}</Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 11, marginRight: 8 }}>{new Date(b.date).toLocaleDateString()}</Text>
                    <Pressable onPress={() => removeBP(b.id)} hitSlop={8}><Ionicons name="close-circle" size={18} color={colors.error} /></Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle" size={16} color="#9CA3AF" />
          <Text style={styles.noteTxt}>
            Para automático: activá la sincronización de tu reloj (ej. Mi Fitness → Health Connect / Apple Health). La lectura automática se habilita en la próxima actualización; por ahora podés cargar los datos manualmente.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {modal === 'bp' ? 'Registrar presión' : modal === 'steps' ? 'Cargar pasos' : 'Registrar pulso'}
            </Text>

            {modal === 'bp' && (
              <>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrap}><Text style={styles.inLbl}>SISTÓLICA</Text><TextInput value={sys} onChangeText={setSys} keyboardType="numeric" style={styles.input} /></View>
                  <View style={styles.inputWrap}><Text style={styles.inLbl}>DIASTÓLICA</Text><TextInput value={dia} onChangeText={setDia} keyboardType="numeric" style={styles.input} /></View>
                  <View style={styles.inputWrap}><Text style={styles.inLbl}>PULSO</Text><TextInput value={pulse} onChangeText={setPulse} keyboardType="numeric" placeholder="—" placeholderTextColor="#6B7280" style={styles.input} /></View>
                </View>
              </>
            )}
            {modal === 'steps' && (
              <View style={styles.inputWrap}><Text style={styles.inLbl}>PASOS DE HOY</Text><TextInput value={stepsInput} onChangeText={setStepsInput} keyboardType="numeric" style={styles.input} /></View>
            )}
            {modal === 'hr' && (
              <View style={styles.inputWrap}><Text style={styles.inLbl}>PULSO EN REPOSO (BPM)</Text><TextInput value={hrInput} onChangeText={setHrInput} keyboardType="numeric" style={styles.input} /></View>
            )}

            <Pressable onPress={saveModal} style={styles.save}><Text style={styles.saveTxt}>GUARDAR</Text></Pressable>
            <Pressable onPress={() => setModal(null)} style={{ marginTop: 10, alignItems: 'center', padding: 8 }}><Text style={{ color: '#9CA3AF', fontWeight: '700' }}>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  bigNum: { color: '#fff', fontSize: 30, fontWeight: '900', fontFamily: 'Inter_900Black' },
  track: { height: 10, borderRadius: 6, backgroundColor: colors.surface3, marginTop: 14, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 6 },
  hint: { color: '#9CA3AF', fontSize: 11, marginTop: 8 },
  hint2: { color: '#9CA3AF', fontSize: 12, marginTop: 10, lineHeight: 17 },
  rowBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  btnTxt: { color: '#fff', fontWeight: '900', fontSize: 11 },
  syncMsg: { color: '#10B981', fontSize: 11, marginTop: 10 },
  bpValue: { color: '#fff', fontSize: 26, fontWeight: '900', fontFamily: 'Inter_900Black' },
  bpUnit: { fontSize: 12, color: '#9CA3AF' },
  bpTag: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  bpTagTxt: { fontSize: 11, fontWeight: '900' },
  bpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface2, borderRadius: 10, padding: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  note: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface2, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  noteTxt: { color: '#9CA3AF', fontSize: 11, flex: 1, lineHeight: 16 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border },
  sheetTitle: { color: '#fff', fontWeight: '900', fontSize: 18, marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 8 },
  inputWrap: { flex: 1 },
  inLbl: { color: '#9CA3AF', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  input: { backgroundColor: colors.surface3, borderRadius: 10, padding: 12, color: '#fff', fontSize: 17, textAlign: 'center', borderWidth: 1, borderColor: colors.border },
  save: { backgroundColor: colors.primary, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 16 },
  saveTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
});
