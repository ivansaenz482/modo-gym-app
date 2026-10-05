import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSeasonPalette } from '../../theme/season';

// Decoración flotante de Halloween con microanimación (tendencia 2026)
export function HalloweenOverlay() {
  const { isHalloween } = useSeasonPalette();
  const float = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isHalloween) return;
    const loop = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: dur, useNativeDriver: true }),
        ])
      ).start();
    loop(float, 2600);
    loop(float2, 3400);
    return () => { float.stopAnimation(); float2.stopAnimation(); };
  }, [isHalloween, float, float2]);

  if (!isHalloween) return null;

  const y1 = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const y2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.Text style={[styles.emoji, { top: 8, right: 16, transform: [{ translateY: y1 }] }]}>🦇</Animated.Text>
      <Animated.Text style={[styles.emoji, { top: 46, left: 12, transform: [{ translateY: y2 }] }]}>🕷️</Animated.Text>
      <Animated.Text style={[styles.emoji, { bottom: 8, right: 26, transform: [{ translateY: y1 }] }]}>🎃</Animated.Text>
      <Animated.Text style={[styles.emoji, { bottom: 26, left: 18, transform: [{ translateY: y2 }] }]}>👻</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emoji: { position: 'absolute', fontSize: 20, opacity: 0.92 },
});
