import type { Addon, Product } from "@/types/product";

type CsvRow = Record<string, string>;

export interface SheetProduct extends Product {
  badges: string[];
  priority: number;
  status: string;
  updated_at: string;
}

export interface SheetAddon extends Addon {}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function slugify(value: unknown): string {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
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

function parsePipeList(value: unknown): string[] {
  return cleanText(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCategories(value: unknown): string[] {
  return parsePipeList(value).map(slugify).filter(Boolean);
}

function parseBadges(value: unknown): string[] {
  return parsePipeList(value);
}

function parseAddons(value: unknown): string[] {
  return parsePipeList(value);
}

export function normalizeProduct(row: CsvRow): SheetProduct {
  const categories = parseCategories(row.category);
  const category = categories[0] || "";

  const price = parseRequiredNumber(row.price || row.price_1);
  const offerPrice = parseNumber(row.offer_price);

  return {
    id: cleanText(row.id),
    title: cleanText(row.title),
    description: cleanText(row.description),

    category,
    categories,

    price,
    offer_price: offerPrice,

    // Compatibilidad temporal
    price_1: price,
    price_3: null,
    price_12: null,
    price_50: null,
    price_100: null,

    addons: parseAddons(row.addons),

    stock: parseNumber(row.stock),
    img: cleanText(row.img),
    badges: parseBadges(row.badge),
    priority: parseRequiredNumber(row.priority),
    status: cleanText(row.status),
    updated_at: cleanText(row.updated_at),

    occasion: cleanText(row.occasion),
    message: cleanText(row.message),
    highlight: cleanText(row.highlight),
  };
}

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