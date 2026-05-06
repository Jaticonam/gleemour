import type { Product } from "@/types/product";
import { BRAND_CONFIG } from "@/config/brand";

const CACHE_KEY = `${BRAND_CONFIG.slug}_products_cache`;
const CACHE_DURATION = 10 * 1000; // 10 segundos

interface CacheEntry {
  data: Product[];
  timestamp: number;
  source: "sheets" | "fallback";
}

function getCached(): Product[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const entry: CacheEntry = JSON.parse(raw);

    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log(`Productos cargados desde caché (${entry.source})`);
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(data: Product[], source: CacheEntry["source"]) {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      source,
    };

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}

function ensureCatalogProduct(product: Product): Product {
  const price = product.price ?? product.price_1 ?? 0;

  return {
    ...product,

    // Precio base
    price,

    // Compatibilidad temporal con estructura antigua
    price_1: price,

    // Nuevo sistema
    offer_price: product.offer_price ?? null,
    categories: product.categories ?? [product.category].filter(Boolean),
    addons: product.addons ?? [],
  };
}

function normalizeProducts(products: Product[]): Product[] {
  return products.map(ensureCatalogProduct);
}

export async function fetchProducts(): Promise<Product[]> {
  const cached = getCached();
  if (cached) return normalizeProducts(cached);

  try {
    const { loadAllProducts } = await import("@/lib/sheets/fetchSheets");
    const products = normalizeProducts(await loadAllProducts());

    if (!products || products.length === 0) {
      console.warn("Sheets vacío o sin productos publicados. Usando fallback local.");

      const { FALLBACK_PRODUCTS } = await import("@/data/fallback-products");
      const fallback = normalizeProducts(FALLBACK_PRODUCTS);

      setCache(fallback, "fallback");
      return fallback;
    }

    console.log(`Catálogo cargado desde Sheets: ${products.length} productos`);

    setCache(products, "sheets");
    return products;
  } catch (error) {
    console.error("Error cargando catálogo desde Sheets:", error);

    const { FALLBACK_PRODUCTS } = await import("@/data/fallback-products");
    const fallback = normalizeProducts(FALLBACK_PRODUCTS);

    setCache(fallback, "fallback");
    return fallback;
  }
}

export function clearProductsCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function getProductPrice(product: Product): number {
  return product.offer_price ?? product.price ?? product.price_1 ?? 0;
}

export function getOriginalProductPrice(product: Product): number {
  return product.price ?? product.price_1 ?? 0;
}

export function hasOfferPrice(product: Product): boolean {
  const originalPrice = getOriginalProductPrice(product);
  const offerPrice = product.offer_price ?? null;

  return (
    offerPrice !== null &&
    Number.isFinite(offerPrice) &&
    offerPrice > 0 &&
    originalPrice > 0 &&
    offerPrice < originalPrice
  );
}

export function getEffectivePrice(item: Product & { qty: number }): number {
  return getProductPrice(item);
}

export function getMinPrice(product: Product): number {
  return getProductPrice(product);
}

export function productBelongsToCategory(
  product: Product,
  categoryId: string
): boolean {
  if (categoryId === "todas") return true;

  const categories = product.categories ?? [product.category].filter(Boolean);

  return categories.includes(categoryId);
}

export function isProductAvailable(product: Product): boolean {
  const price = getProductPrice(product);

  if (!price || price <= 0) return false;
  if (product.stock === 0) return false;
  if (product.stock === null || product.stock === undefined) return false;

  return true;
}