import { Platform } from 'react-native';

export type HealthSnapshot = {
  stepsToday: number | null;
  restingHR: number | null;
  bpLatest: { systolic: number; diastolic: number; pulse?: number } | null;
  source: 'health-connect' | 'healthkit' | 'phone' | null;
  message?: string;
};

/**
 * Lee pasos / pulso / presión desde la plataforma de salud del teléfono.
 *
 * Android  -> Health Connect
 * iPhone   -> Apple Health (HealthKit)
 *
 * NOTA: la lectura automática se activa en la Fase 2 (requiere build nativo con
 * los módulos de salud y permisos). Hoy devuelve null de forma segura para que
 * la app funcione igual (modo manual + podómetro del teléfono).
 */
export async function readFromHealthPlatform(): Promise<HealthSnapshot> {
  const empty: HealthSnapshot = { stepsToday: null, restingHR: null, bpLatest: null, source: null };
  try {
    if (Platform.OS === 'android') {
      // Fase 2: react-native-health-connect
      // const HC = require('react-native-health-connect');
      // ...
      return { ...empty, message: 'Health Connect: pendiente de activar (Fase 2).' };
    }
    if (Platform.OS === 'ios') {
      // Fase 2: @kingstinct/react-native-healthkit
      // const HK = require('@kingstinct/react-native-healthkit');
      // ...
      return { ...empty, message: 'Apple Health: pendiente de activar (Fase 2).' };
    }
    return { ...empty, message: 'Solo disponible en la app del teléfono.' };
  } catch (e: any) {
    return { ...empty, message: e?.message ?? 'No disponible.' };
  }
}

/** Cuenta los pasos del día usando el sensor del propio teléfono (sin reloj). */
export async function getPhoneStepsToday(): Promise<number | null> {
  try {
    const { Pedometer } = require('expo-sensors');
    const available = await Pedometer.isAvailableAsync();
    if (!available) return null;
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const res = await Pedometer.getStepCountAsync(start, end);
    return typeof res?.steps === 'number' ? res.steps : null;
  } catch {
    return null;
  }
}

/** Intenta traer los pasos: primero plataforma de salud, luego el teléfono. */
export async function syncSteps(): Promise<{ steps: number | null; source: string; message?: string }> {
  const platform = await readFromHealthPlatform();
  if (platform.stepsToday != null) return { steps: platform.stepsToday, source: platform.source ?? 'health' };

  const phone = await getPhoneStepsToday();
  if (phone != null) return { steps: phone, source: 'phone' };

  return { steps: null, source: 'none', message: platform.message ?? 'No se pudieron leer los pasos. Cargalos manual.' };
}
