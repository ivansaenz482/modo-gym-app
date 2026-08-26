import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Share, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export function ShareScreen() {
  const appLink = 'https://play.google.com/store/apps/details?id=com.modogym.app';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appLink)}`;
  const onShare = async () => {
    await Share.share({ message: `¡Únete a MODO-GYM! El poder está en tu interior 💪❤️🧠 ${appLink}` });
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, alignItems: 'center', gap: 16 }}>
      <LinearGradient colors={[colors.primary, '#FF6B35']} style={styles.hero}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20 }}>MODO GYM</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>El poder está en tu interior</Text>
      </LinearGradient>
      <View style={styles.card}>
        <Text style={styles.title}>Comparte MODO-GYM</Text>
        <Text style={styles.sub}>Escanea el QR para instalar la app</Text>
        <Image source={{ uri: qrUrl }} style={{ width: 260, height: 260, borderRadius: 16, marginTop: 12, backgroundColor: '#fff' }} />
        <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 8, textAlign: 'center' }}>{appLink}</Text>
        <Pressable onPress={onShare} style={styles.btn}><Text style={styles.btnTxt}>COMPARTIR LINK</Text></Pressable>
      </View>
      <View style={styles.card}>
        <Text style={{ color: colors.gold, fontWeight: '800' }}>Fondo impactante</Text>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' }} style={{ width: '100%', height: 140, borderRadius: 12, marginTop: 8 }} />
        <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 6 }}>Gráfica de modelos gym (Unsplash CC0) — gratis y permitida para Play Store.</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  hero: { width: '100%', borderRadius: 16, padding: 16, alignItems: 'center' },
  card: { width: '100%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  title: { color: '#fff', fontWeight: '900', fontSize: 16 },
  sub: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 16, width: '100%', alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '900' },
});
