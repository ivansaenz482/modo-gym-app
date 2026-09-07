import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { appFont } from '../../theme/fonts';

export type BodyPartDatum = { label: string; value: number; color: string };

const MUSCLE_COLORS: Record<string, string> = {
  pecho: '#E10600',
  espalda: '#0EA5E9',
  piernas: '#10B981',
  hombros: '#F59E0B',
  bíceps: '#8B5CF6',
  tríceps: '#EC4899',
  abdomen: '#FFD60A',
  glúteos: '#F97316',
  'full body': '#22D3EE',
  brazo: '#A78BFA',
};

export function BodyPartChart({ data }: { data: BodyPartDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const chartW = 280;
  const rowH = 34;
  const barH = 16;
  const totalH = data.length * rowH + 8;

  return (
    <View style={styles.wrap}>
      <Svg width={chartW} height={totalH}>
        {data.map((d, i) => {
          const w = Math.max(10, (d.value / max) * (chartW - 120));
          const y = i * rowH + 8;
          return (
            <React.Fragment key={d.label}>
              <SvgText x={0} y={y + 13} fill="#9CA3AF" fontSize={12} fontFamily={appFont.bold}>{d.label}</SvgText>
              <Rect x={88} y={y} width={w} height={barH} rx={4} fill={d.color} />
              <SvgText x={88 + w + 6} y={y + 13} fill="#fff" fontSize={12} fontFamily={appFont.black}>{d.value}</SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      {data.length === 0 && (
        <Text style={styles.empty}>Registra entrenamientos para ver tu avance por músculo 📈</Text>
      )}
    </View>
  );
}

export function buildBodyPartData(bodyParts: Record<string, number>): BodyPartDatum[] {
  const order = ['pecho', 'espalda', 'piernas', 'hombros', 'bíceps', 'tríceps', 'abdomen', 'glúteos', 'brazo', 'full body'];
  const entries = Object.entries(bodyParts).filter(([, v]) => v > 0);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted.map(([label, value]) => ({
    label,
    value,
    color: MUSCLE_COLORS[label] || '#22D3EE',
  }));
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start' },
  empty: { color: '#9CA3AF', fontSize: 12, paddingVertical: 20, textAlign: 'center', width: '100%' },
});
