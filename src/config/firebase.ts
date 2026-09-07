// Configuración de Firebase (Firestore) para la Tienda MODO-GYM
// Proyecto: modo-gym-b0cb5
export const firebaseConfig = {
  apiKey: 'AIzaSyAA5olIU0TmNVzh2LSDKKk54sF-kt7dFuM',
  authDomain: 'modo-gym-b0cb5.firebaseapp.com',
  projectId: 'modo-gym-b0cb5',
  storageBucket: 'modo-gym-b0cb5.firebasestorage.app',
  messagingSenderId: '574889922154',
  appId: '1:574889922154:web:d854eec38fbbc29e180413',
};

// Detección: la tienda se conecta a la nube cuando hay claves reales.
export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('YOUR_'));
}

// La dueña/admin puede subir productos. Se protege con un PIN.
export const ADMIN_PIN = '1985';

// Pide el PIN cuando se intenta entrar a modo administrador.
export function isAdminMode(): boolean {
  return false; // el acceso se valida con el PIN en la pantalla
}

// Verifica el PIN ingresado por el usuario.
export function checkAdminPin(pin: string): boolean {
  return pin.trim() === ADMIN_PIN;
}
