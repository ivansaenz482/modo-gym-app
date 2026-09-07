import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { statFont, appFont } from '../theme/fonts';

export function SplashScreen({ onFinish, fontsReady = true }: { onFinish: () => void; fontsReady?: boolean }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 3000);
    return () => clearTimeout(t);
  }, [fontsReady]);
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1080&q=80' }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(225,6,0,0.85)']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.content}>
        <Image source={require('../../assets/icon.png')} style={{ width: 180, height: 180, borderRadius: 20, borderWidth: 2, borderColor: '#fff', backgroundColor: '#fff' }} />
        <Text style={styles.title}>MODO GYM</Text>
        <Text style={styles.sub}>El poder está en tu interior</Text>
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
});
