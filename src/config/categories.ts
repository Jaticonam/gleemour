import { Category } from "@/types/product";

/**
 * Categorías oficiales del catálogo.
 *
 * id:
 * - Identificador técnico interno.
 * - Se usa para rutas, filtros y lógica.
 *
 * sheetLabel:
 * - Texto humano permitido en Google Sheets.
 * - Facilita operación comercial sin usar slugs técnicos.
 */
export interface CatalogCategory extends Category {
  sheetLabel: string;
}

export const CATEGORIES: CatalogCategory[] = [
  {
    id: "todas",
    name: "Todos",
    sheetLabel: "Todos",
    icon: "✨",
    description: "Explora todos los detalles disponibles.",
  },
  {
    id: "para-enamorar",
    name: "Para enamorar",
    sheetLabel: "Para enamorar",
    icon: "💘",
    description: "Detalles para conquistar, emocionar o sorprender con amor.",
  },
  {
    id: "momentos-especiales",
    name: "Momentos especiales",
    sheetLabel: "Momentos especiales",
    icon: "✨",
    description:
      "Fechas importantes como Día de la Madre, Día de la Mujer y campañas especiales.",
  },
  {
    id: "para-sorprender",
    name: "Para sorprender",
    sheetLabel: "Para sorprender",
    icon: "🎁",
    description: "Detalles que llegan sin aviso y se recuerdan bonito.",
  },
  {
    id: "para-celebrar",
    name: "Para celebrar",
    sheetLabel: "Para celebrar",
    icon: "🎉",
    description: "Opciones para cumpleaños, logros y momentos felices.",
  },
  {
    id: "para-agradecer",
    name: "Para agradecer",
    sheetLabel: "Para agradecer",
    icon: "💌",
    description: "Un gesto elegante para decir gracias.",
  },
  {
    id: "pedir-perdon",
    name: "Pedir perdón",
    sheetLabel: "Pedir perdón",
    icon: "🌷",
    description: "Detalles sinceros para abrir una conversación.",
  },
  {
    id: "para-acompanar",
    name: "Para acompañar",
    sheetLabel: "Para acompañar",
    icon: "🤍",
    description: "Cuando quieres estar presente con un gesto cálido.",
  },
];

/**
 * Obtiene categoría por id técnico.
 */
export function getCategoryById(categoryId?: string | null) {
  if (!categoryId) return null;

  return (
    CATEGORIES.find((category) => category.id === categoryId) || null
  );
}

/**
 * Convierte texto humano de Google Sheets en id técnico.
 */
export function getCategoryIdFromSheetLabel(label?: string | null): string {
  if (!label) return "";

  const normalized = label.trim().toLowerCase();

  return (
    CATEGORIES.find(
      (category) =>
        category.sheetLabel.trim().toLowerCase() === normalized
    )?.id || ""
  );
}

/**
 * Obtiene nombre visible desde id técnico.
 */
export function getCategoryName(categoryId?: string | null) {
  return (
    getCategoryById(categoryId)?.name ||
    "Detalle especial"
  );
}