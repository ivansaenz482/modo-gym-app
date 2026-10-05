import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { statFont, appFont } from '../theme/fonts';
import { useSeasonPalette } from '../theme/season';

export function SplashScreen({ onFinish, fontsReady = true }: { onFinish: () => void; fontsReady?: boolean }) {
  const { isHalloween } = useSeasonPalette();
  useEffect(() => {
    const t = setTimeout(onFinish, 3000);
    return () => clearTimeout(t);
  }, [fontsReady]);
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1080&q=80' }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={isHalloween ? ['rgba(11,6,20,0.55)', 'rgba(168,85,247,0.9)'] : ['rgba(0,0,0,0.5)', 'rgba(225,6,0,0.85)']} style={StyleSheet.absoluteFillObject} />
      {isHalloween && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Text style={[styles.emoji, { top: 70, left: 34 }]}>🦇</Text>
          <Text style={[styles.emoji, { top: 120, right: 40 }]}>🕷️</Text>
          <Text style={[styles.emoji, { bottom: 120, left: 46 }]}>👻</Text>
          <Text style={[styles.emoji, { bottom: 70, right: 34 }]}>🎃</Text>
        </View>
      )}
      <View style={styles.content}>
        <Image source={require('../../assets/icon.png')} style={{ width: 180, height: 180, borderRadius: 20, borderWidth: 2, borderColor: isHalloween ? '#FF7A18' : '#fff', backgroundColor: '#fff' }} />
        <Text style={[styles.title, isHalloween && { color: '#FFB067' }]}>{isHalloween ? 'MODO HALLOWEEN' : 'MODO GYM'}</Text>
        <Text style={styles.sub}>{isHalloween ? '🎃 Entrena con miedo… pero sin excusas 🦇' : 'El poder está en tu interior'}</Text>
        <Text style={styles.tagline}>MODO MENTE + CORAZÓN + FUERZA</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', gap: 12 },
  title: { color: '#fff', fontSize: 44, fontFamily: statFont.black, letterSpacing: 2, marginTop: 16 },
  sub: { color: '#FFD60A', fontSize: 15, fontWeight: '800', letterSpacing: 1, fontFamily: appFont.bold },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 4, fontFamily: appFont.semibold },
  emoji: { position: 'absolute', fontSize: 26, opacity: 0.95 },
});
