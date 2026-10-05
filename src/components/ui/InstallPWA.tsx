import React, { useEffect, useState } from 'react';
import { Platform, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APP_URL = 'https://modogym.vercel.app';

/**
 * Banner de instalación de la PWA.
 * - Android/Chrome: usa el prompt nativo (beforeinstallprompt) con botón "Instalar".
 * - iOS/Safari: NO existe prompt automático -> muestra instrucciones "Añadir a pantalla de inicio".
 * - Navegador interno (WhatsApp/Instagram): guía a abrir en Safari y permite "Copiar link".
 * Solo se muestra en web y si la app no está ya instalada.
 */
export function InstallPWA() {
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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
    const webview = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|BytedanceWebview|musical_ly|Twitter|Line\/|GSA\//.test(ua);
    setIsIOS(ios);
    setIsSafari(safari);
    setInApp(webview);

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

  const copy = async () => {
    try {
      const nav: any = window.navigator;
      if (nav.clipboard && (window as any).isSecureContext) {
        await nav.clipboard.writeText(APP_URL);
      } else {
        const ta = document.createElement('textarea');
        ta.value = APP_URL;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const close = () => {
    try { window.localStorage.setItem('@modo_pwa_dismiss', '1'); } catch {}
    setVisible(false);
  };

  const message = isIOS
    ? (inApp
        ? 'Estás dentro de otra app. Copiá el link y abrilo en Safari, luego "Añadir a pantalla de inicio".'
        : isSafari
          ? 'Tocá Compartir (□↑) y luego "Añadir a pantalla de inicio".'
          : 'Para instalar, abrí esta página en Safari y usá "Añadir a pantalla de inicio".')
    : (inApp
        ? 'Estás dentro de otra app. Copiá el link y abrilo en Chrome para instalarla.'
        : 'Añádela a tu pantalla de inicio para usarla como app.');

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.emoji}>📲</Text>
        <Text style={styles.title}>Instalá MODO GYM</Text>
        <Pressable onPress={close} hitSlop={10} style={styles.close}>
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </Pressable>
      </View>

      <Text style={styles.sub}>{message}</Text>

      <View style={styles.actions}>
        {!isIOS && deferred && (
          <Pressable onPress={install} style={styles.btn}>
            <Text style={styles.btnTxt}>INSTALAR</Text>
          </Pressable>
        )}
        <Pressable onPress={copy} style={styles.btnGhost}>
          <Ionicons name={copied ? 'checkmark' : 'link'} size={14} color={copied ? '#10B981' : '#FF7A18'} />
          <Text style={[styles.btnGhostTxt, copied && { color: '#10B981' }]}>{copied ? '¡COPIADO!' : 'COPIAR LINK'}</Text>
        </Pressable>
      </View>
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
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoji: { fontSize: 20 },
  title: { flex: 1, color: '#fff', fontWeight: '900', fontSize: 13 },
  close: { paddingLeft: 4 },
  sub: { color: '#D1D5DB', fontSize: 11, marginTop: 6, lineHeight: 15 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { backgroundColor: '#FF7A18', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  btnTxt: { color: '#0B0614', fontWeight: '900', fontSize: 11 },
  btnGhost: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,122,24,0.12)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(255,122,24,0.5)' },
  btnGhostTxt: { color: '#FF7A18', fontWeight: '900', fontSize: 11 },
});
