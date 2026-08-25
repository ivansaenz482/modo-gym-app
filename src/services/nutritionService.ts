// Imágenes de platos para dieta - gratis via TheMealDB + fallback local - sin API key
const MEALDB_SEARCH = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

const FALLBACK_MEALS: Record<string, string> = {
  pollo: 'https://www.themealdb.com/images/media/meals/1529444830.jpg',
  ensalada: 'https://www.themealdb.com/images/media/meals/suuret1511555991.jpg',
  avena: 'https://www.themealdb.com/images/media/meals/ryppsv1511815505.jpg',
  pescado: 'https://www.themealdb.com/images/media/meals/1529447256.jpg',
  arroz: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
  pasta: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
  lentejas: 'https://www.themealdb.com/images/media/meals/aquorx1511555364.jpg',
  yogur: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
};

const cache = new Map<string, string>();

export async function getMealImage(query: string): Promise<string> {
  const key = query.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;
  const fallback = FALLBACK_MEALS[Object.keys(FALLBACK_MEALS).find((k) => key.includes(k)) ?? ''] ?? FALLBACK_MEALS['pollo'];
  try {
    const res = await fetch(`${MEALDB_SEARCH}${encodeURIComponent(query.split(' ')[0])}`);
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
