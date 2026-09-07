import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Share, ScrollView, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MenuButton } from '../components/ui/MenuButton';

const PHONE = '593968536103';

export function ShareScreen() {
  const appLink = 'https://play.google.com/store/apps/details?id=com.modogym.app';
  const qrUrl = (d: string) => `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(d)}`;
  const waLink = `https://wa.me/${PHONE}?text=${encodeURIComponent('Hola, quiero más información sobre MODO-GYM 💪')}`;
  const onShare = async () => {
    await Share.share({ message: `¡Únete a MODO-GYM! El poder está en tu interior 💪❤️🧠 ${appLink}` });
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, alignItems: 'center', gap: 16 }}>
      <LinearGradient colors={[colors.primary, '#FF6B35']} style={styles.hero}>
        <View style={{ position: 'absolute', top: 12, left: 12 }}><MenuButton /></View>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20 }}>MODO GYM</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>El poder está en tu interior</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 6, textAlign: 'center' }}>
          Calle 12 entre Sedalana y Pancho Segura
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.title}>Comparte la App</Text>
        <Text style={styles.sub}>Escanea el QR para instalar MODO-GYM</Text>
        <Image source={{ uri: qrUrl(appLink) }} style={styles.qr} />
        <Text style={styles.mini}>{appLink}</Text>
        <Pressable onPress={onShare} style={styles.btn}><Text style={styles.btnTxt}>COMPARTIR LINK</Text></Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Contáctanos por WhatsApp</Text>
        <Text style={styles.sub}>Escanea el QR o escríbenos al {PHONE}</Text>
        <Image source={{ uri: qrUrl(waLink) }} style={styles.qr} />
        <Pressable onPress={() => Linking.openURL(waLink)} style={[styles.btn, { backgroundColor: '#25D366' }]}>
          <Text style={styles.btnTxt}>ABRIR WHATSAPP</Text>
        </Pressable>
      </View>

      <Text style={{ color: '#6B7280', fontSize: 9, textAlign: 'center' }}>
        Diseñado por Ing. Ivan Teneta  ·  Dueña del GYM y APP: Esther Acosta
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  hero: { width: '100%', borderRadius: 16, padding: 16, alignItems: 'center' },
  card: { width: '100%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  title: { color: '#fff', fontWeight: '900', fontSize: 16 },
  sub: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  qr: { width: 260, height: 260, borderRadius: 16, marginTop: 12, backgroundColor: '#fff' },
  mini: { color: '#9CA3AF', fontSize: 11, marginTop: 8, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 16, width: '100%', alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '900' },
});
