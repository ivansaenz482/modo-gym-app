export const TIME_MILESTONES: Record<number, string> = {
  10: '¡10 minutos! 💪 Ya estás caliente. ¡Sigue!',
  15: '¡15 minutos! 🔥 El poder está en tu interior.',
  30: '¡30 minutos! ⏱️ ¡Máquina! Sigue así.',
  45: '¡45 minutos! 🚀 Más de la mitad. ¡No pares!',
  60: '¡1 HORA! 🏆 ¡Increíble compromiso!',
  75: '¡1 hora 15! 💥 ¡Eres una bestia!',
  90: '¡1 hora 30! 🥇 ¡Casi 2 horas de puro poder!',
  120: '¡2 HORAS! 👑 ¡LEYENDA de MODO-GYM!',
};

export const MUSCLE_MILESTONES: Record<number, string> = {
  3: '¡3 sesiones! 🔥 Tu músculo está despertando.',
  5: '¡5 sesiones! 💪 Ya se nota el esfuerzo.',
  10: '¡10 sesiones! 🏆 ¡Rutina sólida!',
  15: '¡15 sesiones! 🚀 ¡Eres imparable!',
  20: '¡20 sesiones! 👑 ¡Nivel MODO-GYM!',
};

export function timeMilestoneMessage(elapsedSeconds: number): { minutes: number; message: string } | null {
  const minutes = Math.floor(elapsedSeconds / 60);
  const msg = TIME_MILESTONES[minutes];
  return msg ? { minutes, message: msg } : null;
}

export function muscleMilestoneMessage(count: number): { count: number; message: string } | null {
  const msg = MUSCLE_MILESTONES[count];
  return msg ? { count, message: msg } : null;
}

export function randomPraise(part?: string): string {
  const base = part ? `¡Sigue con ${part}! ` : '';
  const options = [
    `${base}El poder está en tu interior 💪❤️🧠`,
    `${base}¡Cada día más fuerte! 🔥`,
    `${base}Tu mente y corazón están ganando 🏆`,
    `${base}¡No pares, MODO-GYM te respalda! 🚀`,
    `${base}¡Increíble trabajo! 💪`,
  ];
  return options[Math.floor(Math.random() * options.length)];
}
