import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { appFont } from '../../theme/fonts';

type Props = {
  label: string;
  onPress: () => void;
  icon?: any;
  variant?: 'primary' | 'dark' | 'success';
  small?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, icon, variant = 'primary', small, loading }: Props) {
  const isPrimary = variant === 'primary';
  const isSuccess = variant === 'success';
  const grad: [string, string] = isSuccess ? ['#10B981', '#059669'] : isPrimary ? ['#E10600', '#FF3B30'] : ['#2A2A35', '#1E1E28'];
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [styles.btn, small && styles.small, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.grad}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            {icon ? <Ionicons name={icon} size={small ? 14 : 18} color="#fff" style={{ marginRight: 8 }} /> : null}
            <Text style={[styles.txt, small && { fontSize: 11 }]}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  small: { borderRadius: 10, marginTop: 0 },
  grad: { paddingVertical: 15, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  txt: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.4, fontFamily: appFont.bold },
});
