// Traducción ligera ES/EN para instrucciones de ejercicios - 100% gratis offline
// Usa diccionario de frases comunes fitness + fallback a traducción simple

const DICT: Record<string, string> = {
  // acciones
  'sit down on': 'siéntate en',
  'sit on': 'siéntate en',
  'lie flat on your back': 'acuéstate boca arriba',
  'lie on your back': 'acuéstate boca arriba',
  'stand with': 'párate con',
  'stand': 'párate',
  'hold': 'sostén',
  'hold a': 'sostén un',
  'grasp': 'agarra',
  'grip': 'agarra',
  'keep your back straight': 'mantén la espalda recta',
  'keep elbows close to the torso': 'mantén los codos pegados al torso',
  'elbows close to the torso': 'codos pegados al torso',
  'bend your knees': 'flexiona las rodillas',
  'extend': 'extiende',
  'lower': 'baja',
  'lift': 'levanta',
  'raise': 'eleva',
  'return to the starting position': 'vuelve a la posición inicial',
  'return to starting position': 'vuelve a la posición inicial',
  'slowly': 'lentamente',
  'controlled': 'controlado',
  'repeat for the desired number of repetitions': 'repite el número deseado de repeticiones',
  'repeat': 'repite',
  'feet shoulder-width apart': 'pies al ancho de los hombros',
  'feet flat on the ground': 'pies apoyados en el suelo',
  'knees bent': 'rodillas flexionadas',
  'hands behind your head': 'manos detrás de la cabeza',
  'engage your core': 'activa el core',
  'engaging your abs': 'activando el abdomen',
  'breathe': 'respira',
  'inhale': 'inhala',
  'exhale': 'exhala',
  'dumbbell in each hand': 'mancuerna en cada mano',
  'dumbbell': 'mancuerna',
  'barbell': 'barra',
  'bench': 'banco',
  'incline bench': 'banco inclinado',
  'chest': 'pecho',
  'back': 'espalda',
  'shoulders': 'hombros',
  'biceps': 'bíceps',
  'triceps': 'tríceps',
  'legs': 'piernas',
  'glutes': 'glúteos',
  'abs': 'abdomen',
};

function simpleTranslate(en: string): string {
  let es = en;
  // reemplazos por frase (más largas primero)
  const keys = Object.keys(DICT).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const re = new RegExp(k, 'gi');
    es = es.replace(re, DICT[k]);
  }
  // primera letra en mayúscula
  if (es.length > 0) es = es.charAt(0).toUpperCase() + es.slice(1);
  return es;
}

export function translateInstruction(en: string, locale: 'es' | 'en'): string {
  if (locale === 'en') return en;
  // si es español, traduce
  return simpleTranslate(en);
}

export function translateInstructions(list: string[], locale: 'es' | 'en'): string[] {
  return list.map((s) => translateInstruction(s, locale));
}
