import type { SheetProduct } from "./normalizeProduct";

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

function hasValidPrice(product: SheetProduct): boolean {
  const price = product.offer_price ?? product.price;
  return Number.isFinite(price) && price > 0;
}

export function validateProducts(products: SheetProduct[]): SheetProduct[] {
  const seen = new Set<string>();

  // Solo estos se muestran en la web
  const visibleStatuses = new Set(["publicado", "preventa"]);

  return products.filter((product) => {
    const status = normalizeStatus(product.status);

    if (!product.id) {
      console.warn("Producto descartado: sin id", {
        title: product.title,
        status: product.status,
      });
      return false;
    }

    if (seen.has(product.id)) {
      console.warn("Producto descartado: id duplicado ->", product.id);
      return false;
    }

    if (!product.title) {
      console.warn("Producto descartado: sin title ->", product.id);
      return false;
    }

    if (!visibleStatuses.has(status)) {
      return false;
    }

    if (status === "publicado") {
      if (!hasValidPrice(product)) {
        console.warn("Producto publicado descartado: precio inválido ->", product.id);
        return false;
      }

      if (!product.img) {
        console.warn("Producto publicado descartado: sin imagen ->", product.id);
        return false;
      }

      if (!product.categories || product.categories.length === 0) {
        console.warn("Producto publicado descartado: sin categoría ->", product.id);
        return false;
      }
    }

    seen.add(product.id);
    return true;
  });
}