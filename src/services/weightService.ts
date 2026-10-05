import { Exercise } from './exerciseService';
import { Goal, GymLevel } from '../utils/calculations';

// Categorías de ejercicios por tipo de carga
export type WeightCategory = 'compuesto' | 'aislamiento' | 'peso_corporal';

export function classifyWeightCategory(ex: Exercise): WeightCategory {
  const name = (ex.name || '').toLowerCase();
  const target = (ex.target || '').toLowerCase();
  const equipment = (ex.equipment || '').toLowerCase();
  const compuestos = ['press', 'bench', 'squat', 'deadlift', 'lifting', 'push press', 'military press', 'row', 'pull-up', 'pull up', 'chin-up', 'dip', 'clean', 'snatch', 'overhead press', 'lunge', 'hip thrust'];
  const corporales = ['bodyweight', 'peso corporal', 'proprioceptive', 'lever'];
  if (corporales.some((k) => equipment.includes(k))) return 'peso_corporal';
  if (compuestos.some((k) => name.includes(k))) return 'compuesto';
  return 'aislamiento';
}

// Peso recomendado para empezar, según dificultad y tipo; relativo al peso corporal y al nivel
export function recomendarPesoInicial(ex: Exercise, pesoCorporalKg?: number, nivel: GymLevel = 'principiante'): number {
  const cat = classifyWeightCategory(ex);
  if (cat === 'peso_corporal') {
    // Ejercicios con peso corporal: no requieren carga externa para empezar
    return 0;
  }
  const base = pesoCorporalKg && pesoCorporalKg > 20 ? pesoCorporalKg : 70;
  const pctMap: Record<GymLevel, [number, number]> = {
    principiante: [0.35, 0.15],
    intermedio: [0.50, 0.25],
    pro: [0.65, 0.35],
  };
  const [compPct, isoPct] = pctMap[nivel] ?? pctMap.principiante;
  const pct = cat === 'compuesto' ? compPct : isoPct;
  let peso = Math.round((base * pct) / 2.5) * 2.5; // redondea a placas de 2.5
  if (peso < 5) peso = 5;
  return peso;
}

// Sugiere cuánto subir según el peso actual, objetivo y consistencia en el rango de reps
export function sugerirProgresion(pesoActual: number, repeticiones: number, objetivo: Goal): number {
  if (!pesoActual || pesoActual <= 0) return 2.5;
  let factor = 0.025; // +2.5% base por consistencia
  if (objetivo === 'ganar_musculo') factor = 0.03;
  // Si llega a la parte baja del rango (cercano al máximo de reps), sube más
  const cercaMax = repeticiones >= 12;
  if (cercaMax) factor = 0.05;
  let delta = Math.max(2.5, Math.round((pesoActual * factor) / 2.5) * 2.5);
  return Math.round((pesoActual + delta) / 2.5) * 2.5;
}

// Mensaje motivador sobre el peso
export function mensajePeso(pesoRecomendado: number, esNuevo: boolean): string {
  if (pesoRecomendado <= 0) return 'Este ejercicio es con tu peso corporal. Empieza dominando la técnica antes de añadir carga.';
  if (esNuevo) return `Peso ideal para empezar: ${pesoRecomendado} kg. Aprende bien la técnica y sube cuando completes todas las repeticiones con buena forma.`;
  return `Te sugerimos subir a ${pesoRecomendado} kg cuando completes el rango de repeticiones de forma limpia.`;
}

// Etiqueta de la categoría para mostrar
export function categoriaLabel(cat: WeightCategory): string {
  if (cat === 'compuesto') return 'Compuesto';
  if (cat === 'aislamiento') return 'Aislamiento';
  return 'Peso corporal';
}

