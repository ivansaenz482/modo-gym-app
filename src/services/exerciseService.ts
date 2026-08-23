import { mockExercises } from '../data/mockExercises';

export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  difficulty: string;
  category: 'gym' | 'cardio' | 'calentamiento';
  instructions: string[];
  gifUrl: string;
  image: string;
  videoUrl?: string; // MP4 o GIF animado
  thumbnail?: string;
};

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

function mapYuhonas(raw: any[], videoMap: Map<string, string>): Exercise[] {
  // pool de gifs para fallback aleatorio pero determinístico
  const pool = Array.from(videoMap.values());
  return raw.slice(0, 600).map((e: any, idx: number) => {
    const id: string = e.id;
    const name: string = e.name;
    const img = `${YUHONAS_IMG_BASE}${id}/0.jpg`;
    const videoFromMap = slugMatch(name, videoMap) || pool[idx % pool.length] || '';
    return {
      id,
      name,
      bodyPart: (e.primaryMuscles?.[0] || e.category || 'general').toLowerCase(),
      equipment: (e.equipment || 'peso corporal').toLowerCase(),
      target: (e.primaryMuscles?.[0] || 'general').toLowerCase(),
      secondaryMuscles: e.secondaryMuscles || [],
      difficulty: (e.level || 'beginner').toLowerCase(),
      category: (e.category === 'cardio' ? 'cardio' : e.category === 'stretching' ? 'calentamiento' : 'gym') as any,
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
        cache = data.slice(0, 300).map((e: any) => ({
          id: e.id,
          name: e.name,
          bodyPart: (e.body_part || e.category || 'general').toLowerCase(),
          equipment: (e.equipment || 'peso corporal').toLowerCase(),
          target: (e.target || 'general').toLowerCase(),
          secondaryMuscles: e.secondary_muscles || [],
          difficulty: 'intermedio',
          category: (e.category === 'cardio' ? 'cardio' : 'gym') as any,
          instructions: e.instruction_steps?.en || [e.instructions?.en || ''].filter(Boolean),
          gifUrl: e.gif_url ? `${ADRIAN_BASE}${e.gif_url}` : '',
          image: e.image ? `${ADRIAN_BASE}${e.image}` : '',
          videoUrl: e.gif_url ? `${ADRIAN_BASE}${e.gif_url}` : '',
          thumbnail: e.image ? `${ADRIAN_BASE}${e.image}` : '',
        }));
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
  { id: 'cardio', label: 'Cardio', icon: 'heart' },
  { id: 'calentamiento', label: 'Calentamiento', icon: 'sunny' },
] as const;

export const bodyParts = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'abdomen', 'gluteos', 'full body'];
