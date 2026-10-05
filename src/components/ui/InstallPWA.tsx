import React, { useEffect, useState } from 'react';
import { Platform, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Banner de instalación de la PWA.
 * - Android/Chrome: usa el prompt nativo (beforeinstallprompt) con botón "Instalar".
 * - iOS/Safari: NO existe prompt automático -> muestra instrucciones "Añadir a pantalla de inicio".
 * Solo se muestra en web y si la app no está ya instalada.
 */
export function InstallPWA() {
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const nav: any = window.navigator;

    // ¿Ya está instalada? (standalone)
    const standalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || nav.standalone === true;
    if (standalone) return;

    // ¿El usuario ya la cerró?
    try {
      if (window.localStorage.getItem('@modo_pwa_dismiss') === '1') return;
    } catch {}

    const ua = nav.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    setIsIOS(ios);
    setIsSafari(safari);

    // Android/desktop: prompt nativo
    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => { setVisible(false); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // iOS no dispara beforeinstallprompt -> mostramos la guía
    if (ios) setVisible(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch {}
    setDeferred(null);
    setVisible(false);
  };

  const close = () => {
    try { window.localStorage.setItem('@modo_pwa_dismiss', '1'); } catch {}
    setVisible(false);
  };

  const message = isIOS
    ? (isSafari
        ? 'Toca Compartir (□↑) y luego "Añadir a pantalla de inicio".'
        : 'Para instalar, abrí esta página en Safari y usa "Añadir a pantalla de inicio".')
    : 'Añádela a tu pantalla de inicio para usarla como app.';

  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>📲</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Instalá MODO GYM</Text>
        <Text style={styles.sub}>{message}</Text>
      </View>
      {!isIOS && deferred && (
        <Pressable onPress={install} style={styles.btn}>
          <Text style={styles.btnTxt}>INSTALAR</Text>
        </Pressable>
      )}
      <Pressable onPress={close} hitSlop={10} style={styles.close}>
        <Ionicons name="close" size={18} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 70,
    zIndex: 2000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1A1024',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#FF7A18',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  emoji: { fontSize: 22 },
  title: { color: '#fff', fontWeight: '900', fontSize: 13 },
  sub: { color: '#D1D5DB', fontSize: 11, marginTop: 2, lineHeight: 15 },
  btn: { backgroundColor: '#FF7A18', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  btnTxt: { color: '#0B0614', fontWeight: '900', fontSize: 11 },
  close: { paddingLeft: 4 },
});
