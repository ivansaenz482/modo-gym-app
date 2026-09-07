import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUiStore } from '../../store/uiStore';

export function MenuButton({ tint = '#fff' }: { tint?: string }) {
  const openDrawer = useUiStore((s) => s.openDrawer);
  return (
    <Pressable onPress={openDrawer} hitSlop={8} style={styles.btn}>
      <Ionicons name="menu" size={24} color={tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
});
