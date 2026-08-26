import { mockExercises } from '../data/mockExercises';

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
  abs: 'abdomen', abdominals: 'abdomen', obliques: 'abdomen', core: 'abdomen',
  forearms: 'brazos', neck: 'cuello',
  'serratus anterior': 'pecho',
};

function toSpanishMuscle(en: string): string {
  const k = en.toLowerCase().trim();
  return MUSCLE_ES[k] ?? k;
}
function classifySection(primary: string, secondary: string[], name: string): string {
  const p = primary.toLowerCase();
  const s = secondary.map((x) => x.toLowerCase()).join(' ');
  const n = name.toLowerCase();
  if (p.includes('biceps') || s.includes('biceps') || n.includes('bicep')) return 'bíceps';
  if (p.includes('triceps') || s.includes('triceps') || n.includes('tricep')) return 'tríceps';
  if (p.includes('pector') || p.includes('chest') || s.includes('chest') || n.includes('bench') || n.includes('chest') || n.includes('fly')) return 'pecho';
  if (p.includes('back') || p.includes('lats') || p.includes('traps') || s.includes('back') || n.includes('pull') || n.includes('row') || n.includes('deadlift')) return 'espalda';
  if (p.includes('glute') || s.includes('glute')) return 'glúteos';
  if (p.includes('quadr') || p.includes('hamstring') || p.includes('calves') || p.includes('adductor') || p.includes('quad') || s.includes('quad') || s.includes('hamstring') || n.includes('squat') || n.includes('lunge') || n.includes('leg press')) return 'piernas';
  if (p.includes('shoulder') || p.includes('delt') || s.includes('delt')) return 'hombros';
  if (p.includes('abs') || p.includes('oblique') || p.includes('core')) return 'abdomen';
  if (p.includes('forearm')) return 'brazos';
  return 'full body';
}

const YUHONAS_JSON = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const YUHONAS_IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

let cache: Exercise[] | null = null;

const CALENTAMIENTO_IDS = new Set(['Neck_Circles','Shoulder_Rolls','Arm_Circles','Hip_Circles','Leg_Swings','Jumping_Jacks','High_Knees','Butt_Kicks','90_90_Hamstring','90/90 Hamstring','World_Greatest_Stretch']);

function mapYuhonas(raw: any[]): Exercise[] {
  return raw.slice(0, 873).map((e: any) => {
    const id: string = e.id;
    const name: string = e.name;
    const primary = (e.primaryMuscles?.[0] || 'general').toLowerCase();
    const secondary: string[] = e.secondaryMuscles || [];
    const img = `${YUHONAS_IMG_BASE}${id}/0.jpg`;
    const thumb = `${YUHONAS_IMG_BASE}${id}/0.jpg`;
    const isCalentamiento = e.category === 'stretching' || CALENTAMIENTO_IDS.has(id) || name.toLowerCase().includes('stretch') || (name.toLowerCase().includes('hamstring') && name.includes('90/90'));
    const cat: 'gym'|'cardio'|'calentamiento' = isCalentamiento ? 'calentamiento' : (e.category === 'cardio' ? 'cardio' : 'gym');
    const section = cat === 'calentamiento' ? 'calentamiento' : classifySection(primary, secondary, name);
    return {
      id,
      name,
      bodyPart: toSpanishMuscle(primary),
      equipment: (e.equipment || 'peso corporal').toLowerCase(),
      target: primary,
      targetEs: toSpanishMuscle(primary),
      section,
      secondaryMuscles: secondary.map(toSpanishMuscle),
      difficulty: (e.level || 'beginner').toLowerCase(),
      category: cat,
      instructions: e.instructions || [],
      gifUrl: img,
      image: img,
      videoUrl: img,
      thumbnail: thumb,
    };
  });
}

export async function fetchExercises(): Promise<Exercise[]> {
  if (cache) return cache;
  try {
    const res = await fetch(YUHONAS_JSON);
    if (!res.ok) throw new Error('fetch fail');
    const data = await res.json();
    cache = mapYuhonas(data);
    return cache;
  } catch {
    cache = mockExercises.map((m) => ({
      ...m,
      videoUrl: (m as any).gifUrl || m.image,
      thumbnail: m.image,
    }));
    return cache;
  }
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
  { id: 'calentamiento', label: 'Calentamiento', icon: 'sunny' },
] as const;

export const bodyParts = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'abdomen', 'gluteos', 'full body'];
