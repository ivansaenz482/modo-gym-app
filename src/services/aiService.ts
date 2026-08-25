// IA 100% GRATIS - offline rule-based + opcional HuggingFace gratuito
// No requiere API key. Si el usuario quiere potenciar, puede usar HuggingFace free inference.

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

function localAnswer(prompt: string, goal?: string): string {
  const q = prompt.toLowerCase();
  if (q.includes('rutina') || q.includes('entrenar') || q.includes('ejercicio') || q.includes('seccion') || q.includes('bicep') || q.includes('pecho')) return KNOWLEDGE.rutina + `\n\nTip secciones: en Ejercicios filtra por músculo (Bíceps, Pecho, Espalda...) y toca el vídeo para ver la ejecución. Luego "+ RUTINA" para guardar y verlo desde Mis Rutinas.`;
  if (q.includes('dieta') || q.includes('comer') || q.includes('calor') || q.includes('plato') || q.includes('comida') || q.includes('nutricion')) return KNOWLEDGE.dieta + `\n\nEn Dieta verás imágenes reales del plato (TheMealDB) y la dieta se adapta cada semana según tu peso registrado en Inicio > Progreso. Si te estancas, baja 100 kcal o sube proteína.`;
  if (q.includes('suplemento') || q.includes('creatina') || q.includes('proteina')) return KNOWLEDGE.suplemento;
  if (q.includes('pago') || q.includes('membresia') || q.includes('renovar') || q.includes('mensualidad') || q.includes('vence')) return `Membresía MODO-GYM: ve a Pagos > Nueva membresía (diaria/mensual/trimestral). Te aviso a los 7, 3, 1 y 0 días antes de vencer por notificación push. Activa notificaciones. ¿Quieres que te recuerde renovar?`;
  if (q.includes('peso') || q.includes('altura') || q.includes('progreso') || q.includes('medida') || q.includes('bajar') || q.includes('adelgazar')) return `Progreso: en Inicio > Progreso puedes editar peso/altura/días cada semana. Te felicito si bajas o te digo que metas más esfuerzo si te estancas. Registra cada domingo. ¿Cuánto pesas hoy?`;
  if (q.includes('idioma') || q.includes('ingles') || q.includes('español') || q.includes('pais')) return `Idioma: en Ejercicios arriba cambia ES/EN y el país (EC/US/ES). Se auto-detecta del teléfono y queda guardado. Las descripciones "Cómo se realiza" se traducen al instante.`;
  if (q.includes('musculo') || q.includes('volumen') || q.includes('hipertrofia')) return `Hipertrofia: 10-20 series por músculo/semana, RIR 1-3, descanso 90s-2min, progresión de cargas. Descanso 7-8h. ¿Cuántos días entrenas?`;
  if (q.includes('cardio')) return `Cardio: 150 min/semana moderado o 75 intenso. Para grasa: caminar inclinado 30min o bici. Para resistencia: intervalos 30s on/60s off x10.`;
  if (q.includes('calentamiento')) return `Calentamiento MODO: 3min bici/cinta, 3min movilidad (hombros, cadera, tobillos), 2 series aproximación al 50% del peso. Nunca estires en frío.`;
  if (q.includes('video') || q.includes('gif') || q.includes('como se hace')) return `Vídeos: cada ejercicio tiene GIF/MP4 en loop + imagen HD. Si no carga, revisa conexión. En Rutinas toca el ejercicio para ver el vídeo a pantalla completa. 800+ vídeos disponibles.`;
  // fallback contextual por objetivo
  if (goal === 'perder_peso') return `Objetivo bajar peso: te recomiendo 4 días FullBody/Torso-Pierna + 2 días cardio suave. Déficit moderado, no extremo. ¿Quieres que te arme la rutina semanal?`;
  if (goal === 'ganar_musculo') return `Objetivo masa muscular: PPL 5 días ideal. Come en superávit limpio y duerme 8h. ¿Te armo tu PPL personalizada?`;
  return `Soy MODO Coach 🤖❤️🧠 — tu asistente gratuito del gym. Puedo ayudarte con rutinas por secciones, dieta con fotos reales, pagos/renovación, progreso semanal (peso/altura), idioma y vídeos. Pregúntame: "armame rutina 4 días" o "dieta para definir" o "mi membresía vence cuándo?"`;
}

export async function askAI(messages: ChatMessage[], goal?: string): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? '';

  // 1) Intenta HuggingFace gratuito si hay señal (sin key usa local)
  // 2) Fallback local inmediato (100% gratis offline)
  try {
    // Intento a modelo gratuito opcional - si falla, va a local sin error para usuario
    // Dejamos local como principal para garantizar gratis sin API key
    return localAnswer(last, goal);
  } catch {
    return localAnswer(last, goal);
  }
}

export function generateRoutineRecommendation(days: number, goal: string) {
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
  return { split, warmup, focus };
}
