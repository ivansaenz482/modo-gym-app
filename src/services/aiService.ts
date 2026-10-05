// IA 100% GRATIS - offline rule-based + opcional HuggingFace gratuito
// No requiere API key. Si el usuario quiere potenciar, puede usar HuggingFace free inference.

import type { Exercise } from './exerciseService';
import { GymLevel, exercisesPerDay } from '../utils/calculations';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const KNOWLEDGE: Record<string, string> = {
  rutina: `Para crear rutina dime cuántos días vas al gym (2-6) y tu objetivo. Regla base:
• 2 días: Full Body + Full Body
• 3 días: Push / Pull / Legs
• 4 días: Torso/Pierna x2
• 5 días: PPL + Upper/Lower
• 6 días: PPL x2
Calentamiento siempre 8-10 min: movilidad + cardio suave + series de aproximación.`,
  dieta: `Dieta según objetivo:
• Perder peso: déficit -500 kcal, proteína 1.8g/kg, fibra alta.
• Ganar músculo: superávit +350 kcal, proteína 2g/kg, 4-5 comidas.
• Definir: déficit suave -250 kcal, mantén cargas.
Dime tu peso/altura y te calculo calorías exactas.`,
  suplemento: `Suplementos con evidencia:
• Creatina monohidrato 5g/día (fuerza)
• Proteína whey si no llegas a 1.6-2.2g/kg
• Omega-3 y vitamina D si déficit.
No necesitas más para empezar.`,
};

export async function createWeeklyRoutineFromAI(profile: any, prompt: string): Promise<{ success: boolean; message: string }> {
  try {
    const { fetchExercises } = await import('./exerciseService');
    const { useRoutineStore } = await import('../store/routineStore');
    const all = await fetchExercises();
    const days = profile?.daysPerWeek ?? 4;
    const goal = profile?.goal ?? 'mantener';
    const level: GymLevel = profile?.level ?? 'principiante';
    const rec = generateRoutineRecommendation(days, goal, level);
    const store = useRoutineStore.getState();
    for (let i = 0; i < rec.split.length; i++) {
      const dayNum = i + 1;
      const picks = pickExercisesForSplit(rec.split[i], all, rec.exercisesPerDay, i);
      for (const ex of picks) await store.addExerciseToDay(ex, dayNum);
    }
    return { success: true, message: `¡Rutina de ${days} días creada para nivel ${level}! Cada día con ${rec.exercisesPerDay} ejercicios con vídeo. Ve a Rutinas para verla y ajustarla. ¿Quieres que también te genere la dieta?` };
  } catch (e) {
    return { success: false, message: 'No pude crear la rutina automáticamente. Ve a Ejercicios y usa "+ RUTINA" eligiendo el día.' };
  }
}

// Elige ejercicios según el tipo de día (Push/Pull/Legs/Torso...) y el nivel del usuario.
export function pickExercisesForSplit(split: string, all: Exercise[], count: number, seed = 0): Exercise[] {
  const hint = split.toLowerCase();
  let pool: Exercise[] = [];
  const gym = all.filter((e) => e.category === 'gym');
  if (hint.includes('pecho') || hint.includes('push')) pool = gym.filter((e) => ['pecho', 'hombros', 'tríceps'].includes(e.section));
  else if (hint.includes('espalda') || hint.includes('pull')) pool = gym.filter((e) => ['espalda', 'bíceps'].includes(e.section));
  else if (hint.includes('pierna') || hint.includes('legs') || hint.includes('lower')) pool = gym.filter((e) => ['piernas', 'glúteos'].includes(e.section));
  else if (hint.includes('torso') || hint.includes('upper')) pool = gym.filter((e) => ['pecho', 'espalda', 'hombros'].includes(e.section));
  else if (hint.includes('full')) pool = gym.filter((e) => ['pecho', 'espalda', 'piernas', 'hombros', 'abdomen'].includes(e.section));
  else pool = gym.filter((e) => e.section === 'full body');
  if (pool.length < count) pool = pool.concat(gym);
  const seen = new Set<string>();
  const out: Exercise[] = [];
  const start = pool.length > 0 ? (seed * count) % pool.length : 0;
  for (let k = 0; k < pool.length && out.length < count; k++) {
    const ex = pool[(start + k) % pool.length];
    if (!seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
  }
  return out;
}

export async function createWeeklyDietFromAI(profile: any): Promise<string> {
  const goal = profile?.goal ?? 'mantener';
  return `Dieta generada para objetivo ${goal} con ${profile?.weight}kg. Ve a Dieta y elige el día — cada plato trae foto real y receta paso a paso, y se adapta cada semana según tu peso. ¿Quieres ajustar calorías?`;
}

export async function addBestExercisesForMuscle(muscle: string, profile?: any): Promise<string> {
  try {
    const { fetchExercises } = await import('./exerciseService');
    const { useRoutineStore } = await import('../store/routineStore');
    const all = await fetchExercises();
    const m = muscle.toLowerCase().replace(/\./g, '').trim();
    const targetMap: Record<string, string> = {
      biceps: 'bíceps', bíceps: 'bíceps',
      triceps: 'tríceps', tríceps: 'tríceps',
      pecho: 'pecho', chest: 'pecho', pectoral: 'pecho',
      espalda: 'espalda', back: 'espalda',
      pierna: 'piernas', piernas: 'piernas', femoral: 'piernas', femorales: 'piernas',
      cuadricep: 'piernas', cuádriceps: 'piernas',
      hombro: 'hombros', hombros: 'hombros', deltoide: 'hombros', deltoides: 'hombros',
      abdomen: 'abdomen', abdominal: 'abdomen', core: 'abdomen',
      glutéo: 'glúteos', gluto: 'glúteos', gluteo: 'glúteos', glúteos: 'glúteos', gluteos: 'glúteos',
      brazo: 'bíceps', brazos: 'bíceps',
    };
    const section = targetMap[m] || (m.includes('gluteo') || m.includes('glúteo') ? 'glúteos' : m);
    let picks = all.filter((e) => e.section === section);
    if (picks.length === 0) picks = all.filter((e) => e.target.toLowerCase().includes(m) || e.name.toLowerCase().includes(m));
    // Ordena por nombre para una selección estable, luego top 5
    picks = picks.slice().sort((a, b) => a.name.localeCompare(b.name)).slice(0, 5);
    if (picks.length === 0) return `No encontré ejercicios para ${muscle}. Prueba con biceps, triceps, pecho, espalda, piernas, hombros, abdomen o glúteos.`;
    const store = useRoutineStore.getState();
    const extraDayName = `Extra - ${section.charAt(0).toUpperCase() + section.slice(1)}`;
    let extraDay = store.routines.find((r) => r.name === extraDayName);
    if (!extraDay) {
      const maxDay = Math.max(0, ...store.routines.map((r) => r.dayNumber));
      const dayNum = maxDay + 1;
      await store.addRoutine({ id: `extra-${section}-${Date.now()}`, name: extraDayName, dayNumber: dayNum, exercises: picks, warmup: [], date: new Date().toISOString() });
    } else {
      for (const ex of picks) await store.addExerciseToDay(ex, extraDay.dayNumber);
    }
    const names = picks.map((p) => p.name).slice(0, 3).join(', ');
    return `¡Encontré los mejores para ${muscle}! Añadí ${picks.length} ejercicio(s) a tu rutina "${extraDayName}" (con vídeo): ${names}... Ve a Rutinas > ${extraDayName} para verlos. ¿Quieres más de otro músculo?`;
  } catch {
    return `No pude añadir ejercicios de ${muscle}. Ve a Ejercicios, filtra por ${muscle} y usa "+ RUTINA" eligiendo el día.`;
  }
}

function localAnswer(prompt: string, goal?: string): string {
  const q = prompt.toLowerCase();
  if (q.includes('rutina') || q.includes('entrenar') || q.includes('ejercicio') || q.includes('seccion') || q.includes('bicep') || q.includes('pecho') || q.includes('semana') || q.includes('dias')) {
    if (q.includes('crea') || q.includes('haz') || q.includes('genera') || q.includes('armame') || q.includes('semana')) {
      return `Puedo crearte la rutina semanal completa por días con vídeos. Dime: ¿cuántos días entrenas (${goal ? 'tienes ' + goal : '2-6'}) y cuántos ejercicios por día (1-3)? Ej: "hazme rutina 4 días, 3 ejercicios por día".`;
    }
    return KNOWLEDGE.rutina + `\n\nTip secciones: en Ejercicios filtra por músculo (Bíceps, Pecho, Espalda...) y toca el vídeo para ver la ejecución. Luego "+ RUTINA" elige el Día. O dime "crea mi rutina semanal" y la armo con vídeos por ti.`;
  }
  if (q.includes('dieta') || q.includes('comer') || q.includes('calor') || q.includes('plato') || q.includes('comida') || q.includes('nutricion') || q.includes('receta')) {
    if (q.includes('crea') || q.includes('genera') || q.includes('dame')) return KNOWLEDGE.dieta + `\n\nEn Dieta verás imágenes reales + receta paso a paso y cada semana se adapta a tu peso. Dime "crea mi dieta semanal" y te la dejo lista.`;
    return KNOWLEDGE.dieta + `\n\nEn Dieta verás imágenes reales del plato y receta. Se adapta cada semana según tu peso en Inicio > Progreso.`;
  }
  if (q.includes('suplemento') || q.includes('creatina') || q.includes('proteina')) return KNOWLEDGE.suplemento;
  if (q.includes('pago') || q.includes('membresia') || q.includes('renovar') || q.includes('mensualidad') || q.includes('vence')) return `Membresía MODO-GYM: ve a Pagos > Nueva membresía (diaria/mensual/trimestral). Te aviso a los 5 días y recordatorio diario si es diaria. ¿Quieres que te recuerde renovar?`;
  if (q.includes('peso') || q.includes('altura') || q.includes('progreso') || q.includes('medida') || q.includes('bajar') || q.includes('adelgazar')) return `Progreso: en Inicio > Progreso edita peso/altura/días cada semana. Te felicito si bajas o te digo que metas más esfuerzo. ¿Cuánto pesas hoy?`;
  if (q.includes('idioma') || q.includes('ingles') || q.includes('español') || q.includes('pais')) return `Idioma: en Ejercicios arriba cambia ES/EN y país (EC/US/ES). Se auto-detecta y queda guardado.`;
  if (q.includes('musculo') || q.includes('volumen') || q.includes('hipertrofia')) return `Hipertrofia: 10-20 series por músculo/semana, RIR 1-3, descanso 90s-2min, progresión. ¿Cuántos días entrenas?`;
  if (q.includes('cardio')) return `Cardio: 150 min/semana moderado o 75 intenso. Para grasa: caminar inclinado 30min.`;
  if (q.includes('calentamiento')) return `Calentamiento: 3min bici/cinta, 3min movilidad, 2 series aproximación 50%.`;
  if (q.includes('video') || q.includes('gif') || q.includes('como se hace')) return `Vídeos: cada ejercicio tiene GIF en loop + imagen HD con músculos. En Rutinas toca el ejercicio para ver vídeo. 1.300+ vídeos.`;
  if (goal === 'perder_peso') return `Objetivo bajar peso: 4 días FullBody/Torso-Pierna + 2 días cardio suave. ¿Te creo la rutina semanal por días con vídeos?`;
  if (goal === 'ganar_musculo') return `Objetivo masa muscular: PPL 5 días ideal. ¿Te armo tu rutina semanal por días con vídeos?`;
  return `Soy MODO Coach 🤖❤️🧠 — respondo todo de ejercicios (explico cualquier ejercicio), creo tu rutina semanal por días con vídeos y tu dieta con receta. Dime: "crea mi rutina 4 días" o "crea mi dieta".`;
}

import { askFreeAI } from './freeAIService';

export async function askAI(messages: ChatMessage[], goal?: string, profile?: any): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? '';
  const context = profile ? `Usuario: ${profile.name}, ${profile.weight}kg, ${profile.height}cm, ${profile.age || 25} años, objetivo ${goal}, ${profile.daysPerWeek} días/semana, gym ${profile.gymName}` : `Objetivo: ${goal}`;
  // 1) Intenta IA gratuita online (HF) si hay internet
  try {
    const free = await askFreeAI(last, context);
    if (free && free.length > 20) return free;
  } catch {}
  // 2) Fallback local 100% gratis offline
  try {
    return localAnswer(last, goal);
  } catch {
    return localAnswer(last, goal);
  }
}

export function generateRoutineRecommendation(days: number, goal: string, level: GymLevel = 'principiante') {
  const warmup = ['3 min cinta/bici suave', 'Movilidad hombros + cadera 3 min', '2 series aproximación 50% carga', 'Activación core 1 min'];
  let split: string[] = [];
  if (days <= 2) split = ['Full Body A', 'Full Body B'];
  else if (days === 3) split = ['Push (pecho-hombro-tríceps)', 'Pull (espalda-bíceps)', 'Legs (pierna-glúteo)'];
  else if (days === 4) split = ['Torso', 'Pierna', 'Torso', 'Pierna + core'];
  else if (days === 5) split = ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];
  else split = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];

  let focus = '';
  if (goal === 'perder_peso') focus = 'Fuerza 70% + cardio 15min fin + 8k pasos/día';
  if (goal === 'ganar_musculo') focus = 'Hipertrofia 8-12 reps, descanso 90s, progresión semanal';
  if (goal === 'definir') focus = 'Mantén cargas, reps 10-15, déficit suave';
  if (goal === 'resistencia') focus = 'Circuitos, descansos cortos 45s, WODs CrossFit 2x semana';
  return { split, warmup, focus, exercisesPerDay: exercisesPerDay(level) };
}
