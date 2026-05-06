import type { Product } from "@/types/product";

/**
 * Evalúa si un producto pertenece a una categoría.
 */
export function productBelongsToCategory(
  product: Product,
  categoryId: string
): boolean {
  if (categoryId === "todas") return true;

  return product.categories.includes(categoryId);
}