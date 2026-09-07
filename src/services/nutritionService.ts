// Imágenes de platos para dieta - gratis via TheMealDB + fallback local - sin API key
const MEALDB_SEARCH = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

const FALLBACK_MEALS: Record<string, string> = {
  pollo: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=400&q=80',
  ensalada: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  avena: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=400&q=80',
  pescado: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
  arroz: 'https://images.unsplash.com/photo-1536304929831-eeedbe2d3343?auto=format&fit=crop&w=400&q=80',
  pasta: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=400&q=80',
  lentejas: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
  yogur: 'https://images.unsplash.com/photo-1488477181946-64290103bb53?auto=format&fit=crop&w=400&q=80',
  lenteja: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
  tortita: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  tortilla: 'https://images.unsplash.com/photo-1482049016688-2d3e1b3a543f?auto=format&fit=crop&w=400&q=80',
  huevo: 'https://images.unsplash.com/photo-1482049016688-2d3e1b3a543f?auto=format&fit=crop&w=400&q=80',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',
  atun: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  quinoa: 'https://images.unsplash.com/photo-1586201375761-3860e9b75d3e?auto=format&fit=crop&w=400&q=80',
  granola: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80',
};

const ES_TO_EN: Record<string, string> = {
  lentejas: 'Lentils', lenteja: 'Lentils',
  pollo: 'Chicken', pavo: 'Turkey', cerdo: 'Pork',
  arroz: 'Rice', pasta: 'Pasta', avena: 'Oats',
  ensalada: 'Salad', yogur: 'Yogurt', huevo: 'Egg',
  pescado: 'Fish', merluza: 'Fish', salmon: 'Salmon', atun: 'Tuna',
  tortilla: 'Omelette', pan: 'Bread', queso: 'Cheese',
};

const cache = new Map<string, string>();

export async function getMealImage(query: string): Promise<string> {
  const key = query.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;
  const firstWord = key.split(' ')[0].replace(/[^a-záéíóúñ]/g, '');
  const enWord = ES_TO_EN[firstWord] || firstWord;
  const fallback = FALLBACK_MEALS[Object.keys(FALLBACK_MEALS).find((k) => key.includes(k)) ?? ''] ?? FALLBACK_MEALS['pollo'];
  try {
    const res = await fetch(`${MEALDB_SEARCH}${encodeURIComponent(enWord)}`);
    if (!res.ok) throw new Error('meal fail');
    const data = await res.json();
    const meal = data.meals?.[0];
    if (meal?.strMealThumb) {
      cache.set(key, meal.strMealThumb);
      return meal.strMealThumb;
    }
  } catch {}
  cache.set(key, fallback);
  return fallback;
}

// Progresión semanal: ajusta calorías según evolución de peso
export type ProgressEntry = { date: string; weight: number; height?: number };
export function adjustCaloriesForProgress(baseKcal: number, history: ProgressEntry[], goal: string): number {
  if (history.length < 2) return baseKcal;
  const first = history[0].weight;
  const last = history[history.length - 1].weight;
  const diff = last - first; // negativo = perdió peso
  if (goal === 'perder_peso' && diff < -0.5) return baseKcal; // va bien, mantiene
  if (goal === 'perder_peso' && diff >= 0) return baseKcal - 100; // estancado, baja 100
  if (goal === 'ganar_musculo' && diff > 0.3) return baseKcal; // va bien
  if (goal === 'ganar_musculo' && diff <= 0) return baseKcal + 150;
  return baseKcal;
}
