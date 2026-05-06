export interface Product {
  id: string;
  title: string;
  description: string;

  // Categoría principal para compatibilidad
  category: string;

  // Nuevo sistema: múltiples categorías
  categories?: string[];

  // Precio principal
  price: number;

  // Precio oferta opcional
  offer_price?: number | null;

  // Compatibilidad temporal con Wooly
  price_1?: number;
  price_3?: number | null;
  price_12?: number | null;
  price_50?: number | null;
  price_100?: number | null;

  // IDs de addons permitidos
  addons?: string[];

  stock: number | null;
  img: string;
  priority: number;
  status?: string;
  badges?: string[];

  // Campos emocionales
  occasion?: string;
  message?: string;
  highlight?: string;

  updated_at?: string;
}

export interface Addon {
  id: string;
  title: string;
  price: number;
  img: string;
  category: string;
  status: string;
  priority: number;
}

export interface CartItem extends Product {
  qty: number;
  note?: string;

  // Para fase 2: addons seleccionados dentro del carrito
  selectedAddons?: Addon[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}