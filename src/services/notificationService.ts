import * as Notifications from 'expo-notifications';
import { Membership } from '../store/membershipStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMembershipAlerts(m: Membership) {
  const hasPerm = await requestPermissions();
  if (!hasPerm) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const end = new Date(m.endDate);
  const alerts = [
    { days: 7, title: 'MODO-GYM: tu membresía vence en 7 días', body: `${m.gymName} vence el ${end.toLocaleDateString()}. ¿Renovar?` },
    { days: 3, title: 'MODO-GYM: vence en 3 días ⏰', body: `Tu plan ${m.plan} vence pronto. Renueva y no pares tu progreso.` },
    { days: 1, title: 'MODO-GYM: ¡mañana vence! 🔥', body: `${m.gymName} vence mañana. ¡Renueva y sigue en modo!` },
    { days: 0, title: 'MODO-GYM: ¡Hoy vence tu membresía!', body: `Hoy vence ${m.gymName}. ¡Renueva para no perder racha!` },
  ];
  for (const a of alerts) {
    const triggerDate = new Date(end);
    triggerDate.setDate(end.getDate() - a.days);
    triggerDate.setHours(9, 0, 0, 0);
    if (triggerDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: { title: a.title, body: a.body, sound: 'default' },
        trigger: { date: triggerDate, channelId: 'membresia' } as any,
      });
    }
  }
}
