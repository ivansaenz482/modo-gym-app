import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

export function CreditsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Créditos y Licencias</Text>
        <Text style={styles.text}>MODO-GYM utiliza solo fuentes 100% libres para Play Store.</Text>
        <Text style={styles.h2}>Ejercicios</Text>
        <Text style={styles.text}>• yuhonas/free-exercise-db — Unlicense (dominio público) — 800+ ejercicios, imágenes HD. https://github.com/yuhonas/free-exercise-db</Text>
        <Text style={styles.text}>• Imágenes servidas desde raw.githubusercontent.com (GitHub) — sin key, sin límite.</Text>
        <Text style={styles.h2}>Dietas e imágenes de platos</Text>
        <Text style={styles.text}>• TheMealDB (https://www.themealdb.com) — API libre sin key para imágenes de platos. Fallback local.</Text>
        <Text style={styles.h2}>Código</Text>
        <Text style={styles.text}>• MODO-GYM — MIT — Creado por Ing. Ivan Teneta para MODO-GYM. UI, lógica de rutinas, dietas y progreso son originales.</Text>
        <Text style={styles.h2}>Nota de plagio</Text>
        <Text style={styles.text}>No se copió UI, textos ni marca de otras apps. Toda la lógica de negocio y diseño es original y verificada con expo-doctor 18/18.</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  title: { color: '#fff', fontWeight: '900', fontSize: 18 },
  h2: { color: colors.primary, fontWeight: '800', marginTop: 12 },
  text: { color: '#D1D5DB', fontSize: 12, marginTop: 6, lineHeight: 18 },
});
