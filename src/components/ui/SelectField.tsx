import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { appFont } from '../../theme/fonts';

type Option = { value: string; label: string; emoji?: string };

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SelectField({ label, value, options, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={styles.field}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
          {selected?.emoji && <Text style={{ fontSize: 16 }}>{selected.emoji}</Text>}
          <Text style={[styles.value, !selected && { color: colors.textMuted }]} numberOfLines={1}>
            {selected ? selected.label : placeholder || 'Selecciona...'}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{label}</Text>
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable key={o.value} onPress={() => { onChange(o.value); setOpen(false); }} style={[styles.option, active && styles.optionActive]}>
                    {o.emoji && <Text style={{ fontSize: 18 }}>{o.emoji}</Text>}
                    <Text style={[styles.optionTxt, active && { color: '#fff' }]}>{o.label}</Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                  </Pressable>
                );
              })}
              <Pressable onPress={() => setOpen(false)} style={styles.cancel}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6, fontFamily: appFont.bold },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: colors.border },
  value: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: appFont.bold },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 22 },
  sheet: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border },
  sheetTitle: { color: '#fff', fontWeight: '900', fontSize: 15, marginBottom: 10, textAlign: 'center', fontFamily: appFont.black },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 12, marginVertical: 2 },
  optionActive: { backgroundColor: 'rgba(0,209,255,0.08)', borderWidth: 1, borderColor: colors.accent },
  optionTxt: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', flex: 1, fontFamily: appFont.bold },
  cancel: { alignItems: 'center', padding: 12, marginTop: 6, borderTopWidth: 1, borderColor: colors.border },
});
