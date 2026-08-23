import { mockExercises } from '../data/mockExercises';

export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  difficulty: string;
  category: 'gym' | 'cardio' | 'crossfit' | 'calentamiento';
  instructions: string[];
  gifUrl: string;
  image: string;
  videoUrl?: string;
};

const YUHONAS_JSON = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const YUHONAS_IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

let cache: Exercise[] | null = null;

function mapYuhonas(raw: any[]): Exercise[] {
  return raw.slice(0, 400).map((e: any) => ({
    id: e.id,
    name: e.name,
    bodyPart: (e.primaryMuscles?.[0] || e.category || 'general').toLowerCase(),
    equipment: (e.equipment || 'peso corporal').toLowerCase(),
    target: (e.primaryMuscles?.[0] || 'general').toLowerCase(),
    secondaryMuscles: e.secondaryMuscles || [],
    difficulty: (e.level || 'beginner').toLowerCase(),
    category: (e.category === 'cardio' ? 'cardio' : e.category === 'stretching' ? 'calentamiento' : 'gym') as any,
    instructions: e.instructions || [],
    gifUrl: e.images?.[0] ? `${YUHONAS_IMG_BASE}${e.images[0]}` : mockExercises[0].gifUrl,
    image: e.images?.[0] ? `${YUHONAS_IMG_BASE}${e.images[0]}` : mockExercises[0].image,
  }));
}

export async function fetchExercises(): Promise<Exercise[]> {
  if (cache) return cache;
  try {
    const res = await fetch(YUHONAS_JSON);
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    cache = mapYuhonas(data);
    return cache;
  } catch {
    cache = mockExercises;
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
  { id: 'crossfit', label: 'CrossFit', icon: 'flame' },
  { id: 'calentamiento', label: 'Calentamiento', icon: 'sunny' },
] as const;

export const bodyParts = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'abdomen', 'gluteos', 'full body'];
