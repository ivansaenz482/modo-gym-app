import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../../theme/colors';

// Logo MODO-GYM: usa el asset real de la carpeta (corazón + cerebro + mancuerna)
export function Logo({ size = 64, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../../assets/icon.png')}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: colors.primary,
        }}
      />
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
  title: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  sub: { color: '#9CA3AF', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginTop: -2 },
});
