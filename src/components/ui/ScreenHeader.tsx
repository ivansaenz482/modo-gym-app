import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { appFont } from '../../theme/fonts';
import { MenuButton } from './MenuButton';

export function ScreenHeader({ icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[colors.surface, colors.surface2]} style={styles.gradient}>
        <View style={styles.badge}>
          <Ionicons name={icon} size={26} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        <MenuButton />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 2 },
  gradient: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: colors.border },
  badge: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.3, fontFamily: appFont.black },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 3, fontFamily: appFont.medium },
});
