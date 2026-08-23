import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

// Logo MODO-GYM: corazón mitad + cerebro metadelevando pesa
// Construido con View/Text para no depender de assets externos - escalable
export function Logo({ size = 64, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <View style={styles.row}>
          <Text style={{ fontSize: size * 0.42 }}>❤️</Text>
          <Text style={{ fontSize: size * 0.42, marginLeft: -6 }}>🧠</Text>
        </View>
        <Text style={{ fontSize: size * 0.28, marginTop: -4 }}>🏋️</Text>
        <View style={styles.shine} />
      </View>
      {showText && (
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>MODO<Text style={{ color: colors.primary }}>GYM</Text></Text>
          <Text style={styles.sub}>MODO MENTE + CORAZÓN</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    backgroundColor: '#15151C',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  sub: { color: '#9CA3AF', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginTop: -2 },
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.06)' },
});
