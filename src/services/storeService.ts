import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDocs, setDoc, Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';

export { isFirebaseConfigured };

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image?: string; // URL de la imagen
  active: boolean;
  createdAt: string;
};

export const CATEGORIES = ['Camisas', 'Tazas', 'Gorras', 'Llaveros', 'Perfumes', 'Accesorios', 'Suplementos', 'Otro'];

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getDb(): Firestore {
  if (db) return db;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  return db;
}

// Escucha productos en tiempo real (se actualiza al instante si la dueña agrega/edita)
export function subscribeToProducts(onData: (products: Product[]) => void, onError?: (e: Error) => void): () => void {
  if (!isFirebaseConfigured()) { onData([]); return () => {}; }
  try {
    const firestore = getDb();
    const q = query(collection(firestore, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const list: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      onData(list);
    }, (err) => onError?.(err));
  } catch (e) {
    onError?.(e as Error);
    return () => {};
  }
}

export async function fetchProductsOnce(): Promise<Product[]> {
  if (!isFirebaseConfigured()) return [];
  const firestore = getDb();
  const snap = await getDocs(collection(firestore, 'products'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

// Admin: agregar producto
export async function addProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  if (!isFirebaseConfigured()) throw new Error('Firebase no configurado');
  const firestore = getDb();
  const ref = await addDoc(collection(firestore, 'products'), { ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

// Admin: actualizar producto (por id)
export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase no configurado');
  const firestore = getDb();
  await updateDoc(doc(firestore, 'products', id), data as any);
}

// Admin: eliminar producto
export async function deleteProduct(id: string): Promise<void> {
  if (!isFirebaseConfigured()) throw new Error('Firebase no configurado');
  const firestore = getDb();
  await deleteDoc(doc(firestore, 'products', id));
}

// Admin: reemplazar catálogo completo (subir sus cosas de una vez) - opcional
export async function seedProducts(list: Omit<Product, 'id' | 'createdAt'>[]) {
  if (!isFirebaseConfigured()) throw new Error('Firebase no configurado');
  const firestore = getDb();
  for (const p of list) {
    await setDoc(doc(collection(firestore, 'products')), { ...p, createdAt: new Date().toISOString() });
  }
}

// ImgBB API key (gratis). Pega aquí tu clave: https://api.imgbb.com
export const IMGBB_API_KEY = 'e366de6fbc12da58b941cfb2b585a731';

// Admin: subir imagen local del celular a ImgBB y devolver la URL pública
export async function uploadProductImage(localUri: string): Promise<string> {
  if (!IMGBB_API_KEY || IMGBB_API_KEY.includes('YOUR_') || IMGBB_API_KEY.length < 30) {
    throw new Error('IMGBB no configurado');
  }
  // La imagen viene como data:image/...;base64,<data> desde el picker
  let data = localUri;
  if (data.startsWith('data:')) {
    data = data.split(',')[1] || '';
  } else if (data.startsWith('http')) {
    // Es una URL ya subida: no re-subir
    return data;
  } else {
    // uri nativa: intentar leer con expo-file-system (API nueva)
    try {
      const fs = await import('expo-file-system');
      const f = new (fs as any).File(localUri);
      data = await f.base64();
    } catch {
      throw new Error('No se pudo leer la imagen');
    }
  }
  if (!data) throw new Error('No se pudo leer la imagen');
  // Subir a ImgBB como base64 (método que la API acepta)
  const form = new FormData();
  form.append('key', IMGBB_API_KEY);
  form.append('image', data);
  form.append('expiration', '0');
  const up = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  const json = await up.json();
  if (!json || !json.data || !json.data.url) throw new Error('ImgBB: ' + (json?.error?.message || 'subida fallida'));
  return json.data.url as string;
}

