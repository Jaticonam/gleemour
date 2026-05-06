import type { Addon, Product } from "@/types/product";
import { SHEETS_CONFIG, type SheetSource } from "./sheetsConfig";
import { normalizeAddon, normalizeProduct } from "./normalizeProduct";
import { validateProducts } from "./validateProducts";

type CsvRow = Record<string, string>;

const PRODUCT_REQUIRED_HEADERS = [
  "id",
  "title",
  "description",
  "category",
  "price",
  "offer_price",
  "addons",
  "stock",
  "img",
  "status",
  "badge",
  "priority",
  "occasion",
  "message",
  "highlight",
  "updated_at",
] as const;

const ADDON_REQUIRED_HEADERS = [
  "id",
  "title",
  "price",
  "img",
  "category",
  "status",
  "priority",
] as const;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0]).map((header) => header.trim());

  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = (values[index] ?? "").trim();
    });

    return row;
  });

  return { headers, rows };
}

function getMeaningfulRows(rows: CsvRow[]) {
  return rows.filter((row) =>
    Object.values(row).some((value) => (value ?? "").trim() !== "")
  );
}

function validateHeaders(
  headers: string[],
  requiredHeaders: readonly string[],
  sourceName: string,
  source: SheetSource
) {
  const normalizedHeaders = headers.map((header) =>
    header.trim().toLowerCase()
  );

  const missing = requiredHeaders.filter(
    (required) => !normalizedHeaders.includes(required.toLowerCase())
  );

  if (missing.length > 0) {
    throw new Error(
      `La hoja "${sourceName}" docId="${source.docId}" gid="${source.gid}" no cumple el schema. Faltan columnas: ${missing.join(
        ", "
      )}`
    );
  }
}

async function loadSheetRows(
  sourceName: keyof typeof SHEETS_CONFIG
): Promise<CsvRow[]> {
  const source = SHEETS_CONFIG[sourceName];

  const url = `https://docs.google.com/spreadsheets/d/${source.docId}/export?format=csv&gid=${source.gid}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Error cargando hoja "${sourceName}" docId="${source.docId}" gid="${source.gid}": HTTP ${response.status}`
    );
  }

  const csvText = await response.text();
  const { headers, rows } = parseCSV(csvText);

  validateHeaders(
    headers,
    sourceName === "products" ? PRODUCT_REQUIRED_HEADERS : ADDON_REQUIRED_HEADERS,
    sourceName,
    source
  );

  return getMeaningfulRows(rows);
}

export async function loadAllProducts(): Promise<Product[]> {
  const rows = await loadSheetRows("products");

  const normalized = rows.map(normalizeProduct);

  return validateProducts(normalized)
    .sort((a, b) => b.priority - a.priority)
    .map(({ updated_at, ...product }) => product);
}

export async function loadAllAddons(): Promise<Addon[]> {
  const rows = await loadSheetRows("addons");

  return rows
    .map(normalizeAddon)
    .filter((addon) => addon.status.trim().toLowerCase() === "publicado")
    .sort((a, b) => b.priority - a.priority);
}