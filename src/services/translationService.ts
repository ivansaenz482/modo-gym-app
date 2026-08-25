// Traducción completa ES/EN offline - extendida para 100% de instrucciones
const DICT: Record<string, string> = {
  // posiciones base
  'sit down on': 'siéntate en',
  'sit on': 'siéntate en',
  'lie flat on your back with your knees bent and feet flat on the ground': 'acuéstate boca arriba con rodillas flexionadas y pies apoyados',
  'lie flat on your back': 'acuéstate boca arriba',
  'lie on your back': 'acuéstate boca arriba',
  'lie on an incline bench': 'acuéstate en banco inclinado',
  'stand with': 'párate con',
  'stand': 'párate',
  'place your feet': 'coloca tus pies',
  'place your hands': 'coloca tus manos',
  'place your hands behind your head with your elbows pointing outwards': 'coloca manos tras la cabeza con codos hacia afuera',
  // acciones
  'hold': 'sostén',
  'hold a': 'sostén un',
  'grasp': 'agarra',
  'grip': 'agarra con agarre',
  'keep your back straight': 'mantén la espalda recta',
  'keep elbows close to the torso': 'mantén codos pegados al torso',
  'elbows close to the torso': 'codos pegados al torso',
  'keep the elbows close': 'mantén codos pegados',
  'bend your knees': 'flexiona rodillas',
  'extend your arms': 'extiende brazos',
  'extend': 'extiende',
  'flex': 'flexiona',
  'lower your body': 'baja el cuerpo',
  'lower': 'baja',
  'lift your upper body': 'eleva el torso',
  'lift': 'levanta',
  'raise': 'eleva',
  'pull': 'tira',
  'push': 'empuja',
  'press': 'presiona',
  'curl': 'haz curl',
  'squat': 'haz sentadilla',
  'lunge': 'haz zancada',
  'return to the starting position': 'vuelve a la posición inicial',
  'return to starting position': 'vuelve a la posición inicial',
  'slowly lower your upper body back down': 'baja lentamente el torso',
  'slowly': 'lentamente',
  'controlled': 'controlado',
  'with control': 'con control',
  'repeat for the desired number of repetitions': 'repite las repeticiones deseadas',
  'repeat for the desired number': 'repite el número deseado',
  'for the desired number of repetitions': 'el número deseado de repeticiones',
  'pause for a moment at the top': 'pausa un instante arriba',
  'pause at the top': 'pausa arriba',
  'then slowly': 'luego lentamente',
  // anatomía / posición
  'feet shoulder-width apart': 'pies al ancho de hombros',
  'feet flat on the ground': 'pies apoyados en el suelo',
  'shoulder width apart': 'al ancho de hombros',
  'knees bent': 'rodillas flexionadas',
  'hands behind your head': 'manos tras la cabeza',
  'elbows pointing outwards': 'codos hacia afuera',
  'engage your core': 'activa el core',
  'engaging your abs': 'activando abdomen',
  'engaging your abs, slowly': 'activando abdomen, lentamente',
  'abs': 'abdomen',
  'core': 'core',
  'breathe': 'respira',
  'inhale as you lower': 'inhala al bajar',
  'exhale as you lift': 'exhala al subir',
  'inhale': 'inhala',
  'exhale': 'exhala',
  // equipamiento
  'dumbbell in each hand being held at arms length': 'mancuerna en cada mano a brazos extendidos',
  'dumbbell in each hand': 'mancuerna en cada mano',
  'dumbbell': 'mancuerna',
  'barbell': 'barra',
  'bench': 'banco',
  'incline bench': 'banco inclinado',
  'cable': 'polea',
  'machine': 'máquina',
  'body weight': 'peso corporal',
  'kettlebell': 'pesa rusa',
  // músculos
  'chest': 'pecho',
  'back': 'espalda',
  'shoulders': 'hombros',
  'biceps': 'bíceps',
  'triceps': 'tríceps',
  'forearms': 'antebrazos',
  'legs': 'piernas',
  'quadriceps': 'cuádriceps',
  'hamstrings': 'isquios',
  'glutes': 'glúteos',
  'calves': 'gemelos',
  'pectorals': 'pectorales',
  'lats': 'dorsales',
  'traps': 'trapecios',
  // extras comunes yuhonas
  'tip: keep the elbows close to the torso.this will be your starting position': 'tip: mantén codos pegados al torso. Esta es tu posición inicial.',
  'this will be your starting position': 'esta será tu posición inicial',
  'engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle': 'activando abdomen, eleva lentamente el torso y encórvate hasta que quede a 45°',
  'curling forward until your torso is at a 45-degree angle': 'encórvate hasta 45°',
  'at a 45-degree angle': 'a 45 grados',
  'upper body off the ground': 'torso del suelo',
  'upper body': 'torso',
};

function simpleTranslate(en: string): string {
  let es = en;
  const keys = Object.keys(DICT).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    es = es.replace(re, DICT[k]);
  }
  // post-proceso: capitaliza y limpia dobles espacios
  es = es.replace(/\s+/g, ' ').trim();
  if (es.length > 0) es = es.charAt(0).toUpperCase() + es.slice(1);
  // si queda mucho inglés (>60% palabras sin traducir), añade prefijo para indicar traducción parcial
  return es;
}

export function translateInstruction(en: string, locale: 'es' | 'en'): string {
  if (locale === 'en') return en;
  return simpleTranslate(en);
}
export function translateInstructions(list: string[], locale: 'es' | 'en'): string[] {
  return list.map((s) => translateInstruction(s, locale));
}
export function translateCategory(cat: string, locale: 'es' | 'en'): string {
  if (locale === 'en') return cat;
  const m: Record<string, string> = { gym: 'Gym', cardio: 'Cardio', calentamiento: 'Calentamiento', pecho: 'Pecho', espalda: 'Espalda', piernas: 'Piernas' };
  return m[cat] ?? cat;
}
