import { mockExercises } from '../data/mockExercises';

export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string; // original inglés (para búsqueda)
  targetEs: string; // español para mostrar
  section: string; // sección principal: pecho, espalda, bíceps, etc.
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
const ADRIAN_JSON = 'https://raw.githubusercontent.com/adriankadev/exercises-dataset/main/data/exercises.json';
const ADRIAN_BASE = 'https://raw.githubusercontent.com/adriankadev/exercises-dataset/main/';

let cache: Exercise[] | null = null;
let adrianMap: Map<string, string> | null = null;

async function loadAdrianMap(): Promise<Map<string, string>> {
  if (adrianMap) return adrianMap;
  try {
    const res = await fetch(ADRIAN_JSON);
    if (!res.ok) throw new Error('adrian fetch fail');
    const data: any[] = await res.json();
    const m = new Map<string, string>();
    for (const e of data) {
      const key = String(e.name).toLowerCase().trim();
      const gif = e.gif_url ? `${ADRIAN_BASE}${e.gif_url}` : null;
      if (gif) m.set(key, gif);
    }
    adrianMap = m;
    return m;
  } catch {
    adrianMap = new Map();
    return adrianMap;
  }
}

function slugMatch(name: string, map: Map<string, string>): string | undefined {
  const k = name.toLowerCase().trim();
  if (map.has(k)) return map.get(k);
  // intento por palabras clave
  for (const [key, v] of map.entries()) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  // fallback: por target
  return undefined;
}

const CALENTAMIENTO_IDS = new Set(['Neck_Circles','Shoulder_Rolls','Arm_Circles','Hip_Circles','Leg_Swings','Jumping_Jacks','High_Knees','Butt_Kicks','90_90_Hamstring','90/90 Hamstring','World_Greatest_Stretch']);

function mapYuhonas(raw: any[], videoMap: Map<string, string>): Exercise[] {
  const pool = Array.from(videoMap.values());
  return raw.slice(0, 873).map((e: any, idx: number) => {
    const id: string = e.id;
    const name: string = e.name;
    const primary = (e.primaryMuscles?.[0] || 'general').toLowerCase();
    const secondary: string[] = e.secondaryMuscles || [];
    const img = `${YUHONAS_IMG_BASE}${id}/0.jpg`;
    const videoFromMap = slugMatch(name, videoMap) || pool[idx % pool.length] || '';
    const isCalentamiento = e.category === 'stretching' || CALENTAMIENTO_IDS.has(id) || name.toLowerCase().includes('stretch') || name.toLowerCase().includes('hamstring') && name.includes('90/90');
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
      gifUrl: videoFromMap || img,
      image: img,
      videoUrl: videoFromMap || img,
      thumbnail: img,
    };
  });
}

export async function fetchExercises(): Promise<Exercise[]> {
  if (cache) return cache;
  try {
    const [resY, vMap] = await Promise.all([fetch(YUHONAS_JSON), loadAdrianMap()]);
    if (!resY.ok) throw new Error('yuhonas fail');
    const data = await resY.json();
    cache = mapYuhonas(data, vMap);
    return cache;
  } catch {
    // fallback: intenta solo adrian o mock
    try {
      const res = await fetch(ADRIAN_JSON);
      if (res.ok) {
        const data: any[] = await res.json();
        cache = data.slice(0, 300).map((e: any) => {
          const primary = (e.target || 'general').toLowerCase();
          return {
            id: e.id,
            name: e.name,
            bodyPart: toSpanishMuscle(e.body_part || e.category || 'general'),
            equipment: (e.equipment || 'peso corporal').toLowerCase(),
            target: primary,
            targetEs: toSpanishMuscle(primary),
            section: classifySection(primary, e.secondary_muscles || [], e.name),
            secondaryMuscles: (e.secondary_muscles || []).map(toSpanishMuscle),
            difficulty: 'intermedio',
            category: (e.category === 'cardio' ? 'cardio' : 'gym') as any,
            instructions: e.instruction_steps?.en || [e.instructions?.en || ''].filter(Boolean),
            gifUrl: e.gif_url ? `${ADRIAN_BASE}${e.gif_url}` : '',
            image: e.image ? `${ADRIAN_BASE}${e.image}` : '',
            videoUrl: e.gif_url ? `${ADRIAN_BASE}${e.gif_url}` : '',
            thumbnail: e.image ? `${ADRIAN_BASE}${e.image}` : '',
          };
        });
        return cache!;
      }
    } catch {}
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
