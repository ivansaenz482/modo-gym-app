import { Product } from '../services/storeService';

// Catálogo inicial sugerido de merchandising MODO-GYM.
// Se usa para cargar productos de una vez (botón "Cargar catálogo") sin subir foto por foto.
export const seedCatalog: Omit<Product, 'id' | 'createdAt'>[] = [
  { name: 'Camiseta MODO-GYM (negra)', category: 'Camisas', price: 12, stock: 30, description: 'Algodón premium, tallas S-XL', image: '', active: true },
  { name: 'Camiseta MODO-GYM (roja)', category: 'Camisas', price: 12, stock: 25, description: 'Algodón premium, tallas S-XL', image: '', active: true },
  { name: 'Taza MODO-GYM', category: 'Tazas', price: 8, stock: 40, description: 'Cerámica 350ml, estampado del logo', image: '', active: true },
  { name: 'Taza térmica MODO-GYM', category: 'Tazas', price: 14, stock: 20, description: 'Acero inoxidable, mantiene frío/calor', image: '', active: true },
  { name: 'Gorra MODO-GYM (negra)', category: 'Gorras', price: 10, stock: 30, description: 'Ajustable, bordado del logo', image: '', active: true },
  { name: 'Gorra MODO-GYM (roja)', category: 'Gorras', price: 10, stock: 20, description: 'Ajustable, bordado del logo', image: '', active: true },
  { name: 'Llavero MODO-GYM', category: 'Llaveros', price: 5, stock: 50, description: 'Metal con logo grabado', image: '', active: true },
  { name: 'Perfume MODO-GYM 100ml', category: 'Perfumes', price: 35, stock: 15, description: 'Fragancia deportiva', image: '', active: true },
  { name: 'Botella de agua MODO-GYM', category: 'Accesorios', price: 11, stock: 25, description: 'Botella 750ml con logo', image: '', active: true },
  { name: 'Kit entrada (llavero + taza)', category: 'Accesorios', price: 16, stock: 12, description: 'Combo de bienvenida', image: '', active: true },
];
