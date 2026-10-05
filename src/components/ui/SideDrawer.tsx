import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { appFont } from '../../theme/fonts';
import { useUiStore } from '../../store/uiStore';
import { useSeasonPalette } from '../../theme/season';
import { useSeasonStore } from '../../store/seasonStore';

const WIDTH = 300;

export type DrawerItem = { id: string; label: string; icon: any };

export function SideDrawer({ items, active, onNavigate }: { items: DrawerItem[]; active: string; onNavigate: (id: string) => void }) {
  const open = useUiStore((s) => s.drawerOpen);
  const close = useUiStore((s) => s.closeDrawer);
  const tx = useRef(new Animated.Value(-WIDTH)).current;
  const { isHalloween, palette } = useSeasonPalette();
  const toggleHalloween = useSeasonStore((s) => s.toggleHalloween);

  useEffect(() => {
    Animated.timing(tx, { toValue: open ? 0 : -WIDTH, duration: 220, useNativeDriver: true }).start();
  }, [open, tx]);

  const go = (id: string) => {
    onNavigate(id);
    close();
  };

  return (
    <View pointerEvents={open ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}>
      {open && (
        <Pressable style={styles.backdrop} onPress={close}>
          <Animated.View style={{ flex: 1 }} />
        </Pressable>
      )}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: tx }] }]}>
        <LinearGradient colors={palette.drawerGradient} style={{ flex: 1 }}>
          <View style={styles.brand}>
            <Image source={require('../../../assets/icon.png')} style={styles.logo} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.brandTxt}>MODO GYM</Text>
              <Text style={styles.brandSub}>El poder está en tu interior</Text>
            </View>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}><Ionicons name="close" size={20} color="#fff" /></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8 }}>
            {items.map((it) => {
              const isActive = active === it.id;
              return (
                <Pressable key={it.id} onPress={() => go(it.id)} style={[styles.item, isActive && [styles.itemActive, { backgroundColor: isHalloween ? 'rgba(255,122,24,0.14)' : 'rgba(225,6,0,0.10)', borderLeftColor: palette.primary }]]}>
                  <View style={[styles.itemIcon, isActive && { backgroundColor: palette.primary }]}>
                    <Ionicons name={it.icon} size={18} color={isActive ? '#fff' : '#9CA3AF'} />
                  </View>
                  <Text style={[styles.itemTxt, isActive && { color: palette.primary, fontWeight: '900' }]}>{it.label}</Text>
                  {isActive && <Ionicons name="checkmark-circle" size={16} color={palette.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable onPress={toggleHalloween} style={styles.toggleRow}>
            <Text style={{ fontSize: 20 }}>🎃</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.toggleTitle}>Modo Halloween</Text>
              <Text style={[styles.toggleSub, isHalloween && { color: palette.primary }]}>{isHalloween ? 'Activado · naranja/púrpura' : 'Desactivado'}</Text>
            </View>
            <View style={[styles.switchTrack, isHalloween && { backgroundColor: palette.primary, borderColor: palette.primary }]}>
              <View style={[styles.switchThumb, isHalloween && { alignSelf: 'flex-end' }]} />
            </View>
          </Pressable>

          <View style={styles.footer}>
            <Text style={{ color: '#6B7280', fontSize: 9, textAlign: 'center' }}>MODO-GYM · Diseñado por Ing. Ivan Teneta</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: WIDTH, backgroundColor: colors.surface, borderRightWidth: 1, borderColor: colors.border },
  brand: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 22 },
  logo: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff' },
  brandTxt: { color: '#fff', fontSize: 16, fontWeight: '900', fontFamily: appFont.black, letterSpacing: 1 },
  brandSub: { color: '#9CA3AF', fontSize: 9, marginTop: 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  itemActive: { backgroundColor: 'rgba(225,6,0,0.10)', borderLeftWidth: 3, borderLeftColor: colors.primary },
  itemIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  itemTxt: { flex: 1, color: '#D1D5DB', fontSize: 14, fontWeight: '700', fontFamily: appFont.semibold },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 6, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  toggleTitle: { color: '#fff', fontSize: 13, fontWeight: '800', fontFamily: appFont.bold },
  toggleSub: { color: '#9CA3AF', fontSize: 10, marginTop: 2 },
  switchTrack: { width: 46, height: 26, borderRadius: 13, backgroundColor: '#2A2A35', borderWidth: 1, borderColor: '#3A3A45', padding: 3, justifyContent: 'center' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: 'flex-start' },
  footer: { padding: 16 },
});
