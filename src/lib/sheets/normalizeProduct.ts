import type { Product } from "@/types/product";
import type { SheetCategory } from "./sheetsConfig";

type CsvRow = Record<string, string>;

export interface SheetProduct extends Product {
  badges: string[];
  priority: number;
  status: string;
  updated_at: string;
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown): number | null {
  const cleaned = cleanText(value)
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!cleaned) return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseRequiredNumber(value: unknown): number {
  return parseNumber(value) ?? 0;
}

function parseBadges(value: unknown): string[] {
  return cleanText(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapCategoryToGleemour(category: string): string {
  const cat = cleanText(category).toLowerCase();

  if (cat.includes("flores")) return "para-enamorar";
  if (cat.includes("peluche")) return "para-sorprender";
  if (cat.includes("globos")) return "para-celebrar";
  if (cat.includes("cajas")) return "para-agradecer";
  if (cat.includes("papel")) return "momentos-especiales";
  if (cat.includes("cintas")) return "para-celebrar";
  if (cat.includes("accesorios")) return "para-sorprender";
  if (cat.includes("hotwheels")) return "para-sorprender";

  return "para-sorprender";
}

export function normalizeProduct(
  row: CsvRow,
  categoryFromConfig: SheetCategory
): SheetProduct {
  const price = parseRequiredNumber(row.price || row.price_1);
  const mappedCategory = mapCategoryToGleemour(categoryFromConfig);

  return {
    id: cleanText(row.id),
    title: cleanText(row.title),
    description: cleanText(row.description),

    // ✅ Categoría emocional Gleemour
    category: mappedCategory,

    // ✅ Precio principal Gleemour
    price,

    // ⚠️ Compatibilidad temporal Wooly
    price_1: price,
    price_3: parseNumber(row.price_3),
    price_12: parseNumber(row.price_12),
    price_50: parseNumber(row.price_50),
    price_100: parseNumber(row.price_100),

    stock: parseNumber(row.stock),
    img: cleanText(row.img),
    badges: parseBadges(row.badge),
    priority: parseRequiredNumber(row.priority),
    status: cleanText(row.status),
    updated_at: cleanText(row.updated_at),

    // ✅ Campos emocionales futuros
    occasion: cleanText(row.occasion),
    message: cleanText(row.message),
    highlight: cleanText(row.highlight),
  };
}