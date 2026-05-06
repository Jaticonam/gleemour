import type { Addon, Product } from "@/types/product";
import { getCategoryIdFromSheetLabel } from "@/config/categories";

type CsvRow = Record<string, string>;

/**
 * Producto normalizado desde Google Sheets.
 * Debe cumplir el contrato final del frontend.
 */
export type SheetProduct = Product;

/**
 * Addon normalizado desde Google Sheets.
 */
export type SheetAddon = Addon;

/**
 * Limpia textos provenientes de Sheets.
 */
function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Convierte texto visible en id técnico.
 * Ejemplo: "Para enamorar" -> "para-enamorar"
 */
function slugify(value: unknown): string {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

/**
 * Convierte valores numéricos de Sheets.
 * Soporta coma decimal.
 */
function parseNumber(value: unknown): number | null {
  const cleaned = cleanText(value).replace(/\s/g, "").replace(",", ".");

  if (!cleaned) return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * Número obligatorio.
 * Si está vacío o inválido, devuelve 0.
 */
function parseRequiredNumber(value: unknown): number {
  return parseNumber(value) ?? 0;
}

/**
 * Convierte listas separadas por "|".
 * Ejemplo: "Nuevo|Oferta" -> ["Nuevo", "Oferta"]
 */
function parsePipeList(value: unknown): string[] {
  return cleanText(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Normaliza categorías adicionales.
 * Ejemplo: "momentos-especiales|para-sorprender"
 */
function parseCategories(value: unknown): string[] {
  return parsePipeList(value)
    .map(getCategoryIdFromSheetLabel)
    .filter(Boolean);
}

/**
 * Normaliza badges comerciales.
 */
function parseBadges(value: unknown): string[] {
  return parsePipeList(value);
}

/**
 * Normaliza addons permitidos para el producto.
 */
function parseAddons(value: unknown): string[] {
  return parsePipeList(value).map(slugify).filter(Boolean);
}

/**
 * Normaliza un producto desde una fila de Google Sheets.
 *
 * Regla:
 * category   = categoría principal
 * categories = categorías adicionales
 */
export function normalizeProduct(row: CsvRow): SheetProduct {
  const primaryCategory = getCategoryIdFromSheetLabel(row.category);
  const extraCategories = parseCategories(row.categories);

  const categories = Array.from(
    new Set([primaryCategory, ...extraCategories].filter(Boolean))
  );

  return {
    id: cleanText(row.id),
    title: cleanText(row.title),
    description: cleanText(row.description),

    category: primaryCategory,
    categories,

    price: parseRequiredNumber(row.price),
    offer_price: parseNumber(row.offer_price),

    addons: parseAddons(row.addons),

    stock: parseNumber(row.stock),
    img: cleanText(row.img),

    status: cleanText(row.status),
    badges: parseBadges(row.badge),
    priority: parseRequiredNumber(row.priority),

    occasion: cleanText(row.occasion),
    message: cleanText(row.message),
    highlight: cleanText(row.highlight),
    updated_at: cleanText(row.updated_at),
  };
}

/**
 * Normaliza un addon desde una fila de Google Sheets.
 */
export function normalizeAddon(row: CsvRow): SheetAddon {
  return {
    id: cleanText(row.id),
    title: cleanText(row.title),
    price: parseRequiredNumber(row.price),
    img: cleanText(row.img),
    category: slugify(row.category),
    status: cleanText(row.status),
    priority: parseRequiredNumber(row.priority),
  };
}