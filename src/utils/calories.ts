import { Exercise } from '../services/exerciseService';

export function estimateMET(ex: Exercise): number {
  const n = ex.name.toLowerCase();
  const cat = ex.category;

  if (cat === 'calentamiento') return 3.5;

  if (cat === 'cardio') {
    if (/run|jog|corr|trotar|sprint|treadmill|cinta|running/.test(n)) return 9.8;
    if (/jump rope|saltar cuerda|cuerda|skipping/.test(n)) return 11;
    if (/bike|bicicl|cycling|air bike/.test(n)) return 7.5;
    if (/elliptical|elip/.test(n)) return 6.5;
    if (/rower|rowing|remo/.test(n)) return 7;
    if (/stepmill|stair|escalera|climber/.test(n)) return 8.5;
    if (/walk|caminar|walking/.test(n)) return 4;
    return 6.5;
  }

  if (/squat|deadlift|dead lift|hip thrust|leg press|weighted/.test(n)) return 5.5;
  if (/bench|curl|row|pull|push|press|fly|lunge/.test(n)) return 5;
  if (/plank|push-up|push up|pull-up|pull up/.test(n)) return 6;
  return 4.5;
}

export function caloriesPerMinute(met: number, weightKg: number): number {
  return (met * 3.5 * weightKg) / 200;
}

export function caloriesBurned(met: number, weightKg: number, seconds: number): number {
  return caloriesPerMinute(met, weightKg) * (seconds / 60);
}

const STOPS: [number, string][] = [
  [0, '#38BDF8'],
  [0.35, '#6366F1'],
  [0.7, '#EC4899'],
  [1, '#EF4444'],
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function heatColor(ratio: number): string {
  const r = Math.max(0, Math.min(1, ratio));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, c0] = STOPS[i];
    const [p1, c1] = STOPS[i + 1];
    if (r >= p0 && r <= p1) {
      const t = (r - p0) / (p1 - p0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      return `rgb(${lerp(a[0], b[0], t)}, ${lerp(a[1], b[1], t)}, ${lerp(a[2], b[2], t)})`;
    }
  }
  return STOPS[STOPS.length - 1][1];
}
