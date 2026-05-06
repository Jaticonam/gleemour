import type { Product } from "@/types/product";
import { isSoldOutStatus } from "@/config/statuses";
import { getProductPrice } from "@/lib/product/pricing";

/**
 * Determina si el producto puede venderse.
 */
export function isProductAvailable(product: Product): boolean {
  const price = getProductPrice(product);

  if (isSoldOutStatus(product.status)) return false;
  if (!price || price <= 0) return false;
  if (product.stock === null || product.stock === undefined) return false;
  if (product.stock <= 0) return false;

  return true;
}