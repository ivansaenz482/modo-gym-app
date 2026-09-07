import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Membership } from '../store/membershipStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
});

const CHANNEL_MEMBRESIA = 'membresia';
const CHANNEL_ENTRENO = 'entrenamiento';

async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_MEMBRESIA, {
    name: 'Membresía',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 180, 250],
    lightColor: '#E10600',
    sound: 'default',
    bypassDnd: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_ENTRENO, {
    name: 'Entrenamiento',
    description: 'Recordatorios y motivación para tus días de gym',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 150, 200],
    lightColor: '#0EA5E9',
    sound: 'default',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
  });
}

const DAILY_MOTIVATION = [
  '“La disciplina pesa gramos, el arrepentimiento pesa toneladas.”',
  '“No cuentes las repeticiones, haz que las repeticiones cuenten.”',
  '“El cuerpo logra lo que la mente cree.”',
  '“Hoy es un buen día para ser mejor que ayer.”',
  '“El dolor de hoy es la fuerza de mañana.”',
];

// Distribuye los días de entrenamiento a lo largo de la semana (lunes=1 … domingo=7)
function trainingWeekdays(daysPerWeek: number): number[] {
  try {
    switch (daysPerWeek) {
      case 2: return [2, 5];            // Lun, Jue
      case 3: return [2, 4, 6];         // Lun, Mié, Vie
      case 4: return [2, 3, 5, 6];      // Lun, Mar, Jue, Vie
      case 5: return [2, 3, 4, 5, 6];   // Lun-Vie
      case 6: return [2, 3, 4, 5, 6, 7];// Lun-Sáb
      default: return [2, 3, 4, 5, 6];  // fallback 5
    }
  } catch {
    return [2, 3, 4, 5, 6];
  }
}

// Acumula una notificación de entrenamiento que se repite cada semana los días indicados a las 07:00
async function scheduleGymReminders(daysPerWeek: number, gymName: string) {
  const weekdays = trainingWeekdays(daysPerWeek);
  for (const wd of weekdays) {
    const tip = DAILY_MOTIVATION[Math.floor(Math.random() * DAILY_MOTIVATION.length)];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Hoy toca gym! 💪',
        body: `${tip}\nTe esperamos en ${gymName} hoy. ¡A darlo todo!`,
        sound: 'default',
        color: '#0EA5E9',
        badge: 1,
        categoryIdentifier: 'entrenamiento',
        data: { type: 'entrenamiento' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: wd, hour: 7, minute: 0, channelId: CHANNEL_ENTRENO } as any,
    });
  }
}

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMembershipAlerts(m: Membership, daysPerWeek?: number) {
  await ensureChannels();
  const hasPerm = await requestPermissions();
  if (!hasPerm) return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const end = new Date(m.endDate);
  const now = new Date();

  // Si el usuario entrena, programa recordatorios semanales "hoy toca gym"
  if (daysPerWeek && daysPerWeek >= 2) {
    await scheduleGymReminders(daysPerWeek, m.gymName);
  }

  // Vencimiento: se programa cada aviso SOLO si su fecha es futura y marca un umbral
  // (así no se acumulan todos a la vez).
  const thresholds = [
    { days: 5, title: 'Tu membresía vence en 5 días 📅', body: `${m.gymName}: te quedan 5 días de tu plan ${m.plan}. Renueva y sigue con tu racha.` },
    { days: 3, title: '¡Vence en 3 días! ⏰', body: `Tu plan ${m.plan} en ${m.gymName} vence pronto. No pares tu progreso.` },
    { days: 1, title: '¡Mañana vence tu membresía! 🔥', body: `${m.gymName}: mañana es el último día. ¡Renueva y sigue en modo!` },
    { days: 0, title: '¡Hoy vence tu membresía! ⚠️', body: `Hoy vence tu plan en ${m.gymName}. Renueva para no perder días de entrenamiento.` },
  ];

  for (const a of thresholds) {
    const triggerDate = new Date(end);
    triggerDate.setDate(end.getDate() - a.days);
    triggerDate.setHours(9, 0, 0, 0);
    // Solo si el aviso está en el futuro (no se acumulan los ya pasados)
    if (triggerDate.getTime() > now.getTime()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: a.title,
          body: a.body,
          sound: 'default',
          color: '#E10600',
          badge: 1,
          categoryIdentifier: 'membresia',
          data: { type: 'membresia', daysLeft: a.days },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate, channelId: CHANNEL_MEMBRESIA } as any,
      });
    }
  }
}
