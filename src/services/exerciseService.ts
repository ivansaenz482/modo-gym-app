import { mockExercises } from '../data/mockExercises';
import { exercisesFull } from '../data/exercisesFull';

export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  targetEs: string;
  section: string;
  secondaryMuscles: string[];
  difficulty: string;
  category: 'gym' | 'cardio' | 'calentamiento';
  instructions: string[];
  gifUrl: string;
  image: string;
  videoUrl?: string;
  thumbnail?: string;
  restSeconds?: number;
  isTimed?: boolean;
  suggestedDurationMin?: number;
};

const MUSCLE_ES: Record<string, string> = {
  biceps: 'bíceps',
  triceps: 'tríceps',
  'pectorals': 'pecho', chest: 'pecho', 'pectoralis major': 'pecho',
  back: 'espalda', lats: 'espalda', 'latissimus dorsi': 'espalda', traps: 'espalda', trapezius: 'espalda',
  quadriceps: 'piernas', quads: 'piernas', adductors: 'piernas', abductors: 'piernas',
  hamstrings: 'isquios', hamstring: 'isquios',
  calves: 'gemelos',
  glutes: 'glúteos', 'gluteus maximus': 'glúteos',
  shoulders: 'hombros', delts: 'hombros', deltoids: 'hombros', deltoid: 'hombros',
  abs: 'abdomen', abdominals: 'abdomen', obliques: 'abdomen', core: 'abdomen', waist: 'abdomen',
  forearms: 'brazos', neck: 'cuello',
  'serratus anterior': 'pecho',
};

function toSpanishMuscle(en: string): string {
  const k = en.toLowerCase().trim();
  return MUSCLE_ES[k] ?? k;
}

// --- Metadatos de tiempo: descanso entre series y duración para cardio ---
function detectCardio(name: string): boolean {
  const n = name.toLowerCase();
  if (/air bike|stationary bike|bike|bicicl|treadmill|elliptical|elip|rower|rowing machine|jump rope|soga|cuerda|stepmill|stair climber|stepper|cardio|aerob|jog|trotar|caminar/.test(n)) return true;
  if (/\brun(ning)?\b/.test(n)) return true;
  return false;
}
function computeRestSeconds(cat: 'gym'|'cardio'|'calentamiento', name: string): number {
  if (cat === 'cardio') return 0;
  if (cat === 'calentamiento') return 20;
  const n = name.toLowerCase();
  if (/squat|deadlift|bench|press|row|pull|pull-up|pull up|push-up|push up|lunge|overhead|clean|snatch|dip|hip thrust|back extension/.test(n)) return 120;
  if (/curl|raise|extension|fly|crunch|kickback|calf|leg press|leg curl|hammer|concentration|tricep|bicep|plank/.test(n)) return 60;
  return 90;
}
function computeIsTimed(cat: 'gym'|'cardio'|'calentamiento', name: string): boolean {
  if (cat === 'cardio') return true;
  return detectCardio(name);
}
function computeDuration(cat: 'gym'|'cardio'|'calentamiento', name: string): number {
  const n = name.toLowerCase();
  if (/air bike|stationary bike|bike|bicicl|cycling/.test(n)) return 20;
  if (/caminar|walking|walk/.test(n)) return 30;
  if (/corr|run|treadmill|trotar|jog|sprint/.test(n)) return 25;
  return 15;
}
function classifySection(primary: string, secondary: string[], name: string): string {
  const p = primary.toLowerCase();
  const n = name.toLowerCase();
  // Prioriza músculo principal, no secundario para bíceps/tríceps
  if (p.includes('pector') || p.includes('chest')) return 'pecho';
  if (p.includes('back') || p.includes('lats') || p.includes('traps') || p.includes('middle back') || p.includes('lower back')) return 'espalda';
  if (p.includes('glute')) return 'glúteos';
  if (p.includes('quadr') || p.includes('hamstring') || p.includes('calves') || p.includes('adductor') || p.includes('quad') || p.includes('abductor')) return 'piernas';
  if (p.includes('shoulder') || p.includes('delt')) return 'hombros';
  if (p.includes('abs') || p.includes('abdominal') || p.includes('oblique') || p.includes('core') || p.includes('waist')) return 'abdomen';
  if (p.includes('biceps')) return 'bíceps';
  if (p.includes('triceps')) return 'tríceps';
  if (p.includes('forearm')) return 'brazos';
  // fallback por nombre si primary es genérico
  if (n.includes('bicep') && !n.includes('pull') && !n.includes('row')) return 'bíceps';
  if (n.includes('tricep')) return 'tríceps';
  if (n.includes('bench') || n.includes('chest') || n.includes('fly')) return 'pecho';
  if (n.includes('pull') || n.includes('row') || n.includes('deadlift') || n.includes('pulldown')) return 'espalda';
  if (n.includes('squat') || n.includes('lunge') || n.includes('leg press') || n.includes('leg extension') || n.includes('hamstring')) return 'piernas';
  if (n.includes('shoulder') || n.includes('lateral raise') || n.includes('overhead press')) return 'hombros';
  return 'full body';
}

// Solo hasaneyldrm (1324) como fuente principal — todos con GIF animado + instrucciones ES ya traducidas, sin foto real
const HASAN_JSON = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const HASAN_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

let cache: Exercise[] | null = null;

export async function fetchExercises(): Promise<Exercise[]> {
  if (cache) return cache;
  try {
    const res = await fetch(HASAN_JSON);
    if (!res.ok) throw new Error('hasan fail');
    const data: any[] = await res.json();
    cache = data.map((e: any) => {
      const primary = (e.target || e.category || 'general').toLowerCase();
      const secondary: string[] = e.secondary_muscles || e.secondaryMuscles || [];
      const name: string = e.name;
      const catRaw = (e.category || '').toLowerCase();
      const isCalentamiento = catRaw === 'stretching' || name.toLowerCase().includes('stretch');
      const isCardio = detectCardio(name);
      const cat: 'gym'|'cardio'|'calentamiento' = isCalentamiento ? 'calentamiento' : (isCardio ? 'cardio' : 'gym');
      const section = cat === 'calentamiento' ? 'calentamiento' : classifySection(primary, secondary, name);
      // instrucciones ya en ES en hasaneyldrm
      const instr = e.instructions?.es || e.instruction_steps?.es || e.instructions?.en || e.instructions || [];
      const instructions: string[] = Array.isArray(instr) ? instr : [String(instr)];
      const gif = e.gif_url ? `${HASAN_BASE}${e.gif_url}` : '';
      const img = e.image ? `${HASAN_BASE}${e.image}` : gif;
      return {
        id: String(e.id),
        name,
        bodyPart: toSpanishMuscle(e.body_part || primary),
        equipment: (e.equipment || 'peso corporal').toLowerCase(),
        target: primary,
        targetEs: toSpanishMuscle(primary),
        section,
        secondaryMuscles: secondary.map(toSpanishMuscle),
        difficulty: 'intermedio',
        category: cat,
        instructions,
        gifUrl: gif,
        image: img,
        videoUrl: gif,
        thumbnail: img,
        restSeconds: computeRestSeconds(cat, name),
        isTimed: computeIsTimed(cat, name),
        suggestedDurationMin: computeDuration(cat, name),
      };
    });
    return cache;
  } catch {
    // Fallback offline: carga la base completa local (1318 ejercicios con vídeo)
    cache = exercisesFull.map((m) => {
      const name = m.name;
      const cat = m.category;
      return {
        ...m,
        videoUrl: (m as any).videoUrl || (m as any).gifUrl || m.image,
        thumbnail: (m as any).thumbnail || m.image,
        restSeconds: (m as any).restSeconds ?? computeRestSeconds(cat, name),
        isTimed: (m as any).isTimed ?? computeIsTimed(cat, name),
        suggestedDurationMin: (m as any).suggestedDurationMin ?? computeDuration(cat, name),
      };
    });
    return cache;
  }
}

export function getRestSeconds(ex: Exercise): number {
  if (ex.category === 'cardio') return 0;
  if (ex.category === 'calentamiento') return 20;
  return ex.restSeconds ?? 90;
}

export function isTimedExercise(ex: Exercise): boolean {
  if (ex.category === 'cardio') return true;
  return ex.isTimed ?? false;
}

export function getSuggestedDurationMin(ex: Exercise): number {
  return ex.suggestedDurationMin ?? 20;
}

// Series y repeticiones recomendadas según el tipo de ejercicio
export function suggestedSetsReps(ex: Exercise): { sets: number; reps: string; rest: number; timed: boolean } {
  if (isTimedExercise(ex)) return { sets: 1, reps: 'por tiempo', rest: 0, timed: true };
  const n = ex.name.toLowerCase();
  if (/press|squat|deadlift|row|pull|push|lunge|hip thrust|dip|clean|snatch|overhead/.test(n)) {
    return { sets: 4, reps: '8-10', rest: getRestSeconds(ex) || 120, timed: false };
  }
  return { sets: 3, reps: '12-15', rest: getRestSeconds(ex) || 60, timed: false };
}

export async function searchExercises(q: string, filter?: { category?: string; bodyPart?: string }) {
  const all = await fetchExercises();
  let r = all;
  if (q) r = r.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()) || e.target.includes(q.toLowerCase()));
  if (filter?.category) r = r.filter((e) => e.category === filter.category);
  if (filter?.bodyPart) r = r.filter((e) => e.bodyPart === filter.bodyPart);
  return r;
}

export const categories = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'gym', label: 'Gym', icon: 'barbell' },
  { id: 'cardio', label: 'Cardio', icon: 'bicycle' },
] as const;

export const bodyParts = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'abdomen', 'gluteos', 'full body'];
