export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;

  // ✅ Precio principal Gleemour
  price: number;

  // ⚠️ Compatibilidad temporal con estructura heredada de Wooly
  price_1?: number;
  price_3?: number | null;
  price_12?: number | null;
  price_50?: number | null;
  price_100?: number | null;

  stock: number | null;
  img: string;
  priority: number;
  status?: string;
  badges?: string[];

  // ✅ Campos emocionales para Gleemour
  occasion?: string;
  message?: string;
  highlight?: string;
}

export interface CartItem extends Product {
  qty: number;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES = [
  { id: "todas", name: "Todos", icon: "✨" },

  { id: "para-enamorar", name: "Para enamorar", icon: "💘" },
  { id: "momentos-especiales", name: "Momentos especiales", icon: "✨" },
  { id: "para-sorprender", name: "Para sorprender", icon: "🎁" },
  { id: "para-celebrar", name: "Para celebrar", icon: "🎉" },
  { id: "para-agradecer", name: "Para agradecer", icon: "💌" },
  { id: "para-pedir-perdon", name: "Para pedir perdón", icon: "🌷" },
  { id: "para-acompanar", name: "Para acompañar", icon: "🤍" },
];