import type { Product } from "@/types/product";
import { BRAND_CONFIG } from "@/config/brand";
import { createCatalogCache } from "@/lib/product/cache";
import { normalizeProducts } from "@/lib/product";

const CACHE_KEY = `${BRAND_CONFIG.slug}_products_cache`;
const CACHE_DURATION = 10 * 1000;

const catalogCache = createCatalogCache<Product>(
  CACHE_KEY,
  CACHE_DURATION
);
  
/**
 * Obtiene catálogo desde Google Sheets.
 */
export async function fetchProducts(): Promise<Product[]> {
  const cached = catalogCache.get();

  if (cached) {
    return normalizeProducts(cached);
  }

  try {
    const { loadAllProducts } = await import("@/lib/sheets/fetchSheets");

    const products = normalizeProducts(await loadAllProducts());

    console.log(`Catálogo cargado desde Sheets: ${products.length} productos`);

    catalogCache.set(products);

    return products;
  } catch (error) {
    console.error("Error cargando catálogo desde Sheets:", error);
    return [];
  }
}

/**
 * Limpia caché local del catálogo.
 */
export function clearProductsCache() {
  catalogCache.clear();
}

/**
 * Re-export temporal para mantener compatibilidad
 * mientras migramos imports antiguos.
 */
export * from "@/lib/product";