import { WHATSAPP_NUMBER } from "@/config/contact";
import { CATEGORIES } from "@/config/categories";

import { CATALOG_CONFIG } from "@/config/catalog";
import { CHECKOUT_CONFIG } from "@/config/checkout";
import { CART_CONFIG } from "@/config/cart";
import { MODAL_CONFIG } from "@/config/modal";
import { ASSETS_CONFIG } from "@/config/assets";
import { UI_CONFIG } from "@/config/ui";
import { ACTIVITY_CONFIG } from "@/config/activity";

/**
 * Configuración principal de marca.
 * Este archivo actúa como agregador central para que los componentes
 * consuman una sola fuente: BRAND_CONFIG.
 */
export const BRAND_CONFIG = {
  slug: "gleemour",
  name: "Gleemour",

  contact: {
    whatsapp: WHATSAPP_NUMBER,
  },

  catalog: CATALOG_CONFIG,
  checkout: CHECKOUT_CONFIG,
  cart: CART_CONFIG,
  modal: MODAL_CONFIG,
  productCard: {
    whatsappDefault: "Hola, quiero enviar este detalle",
    whatsappPreventa: "Hola, quiero consultar este detalle",
    whatsappRestock: "Hola, quiero saber si pueden preparar nuevamente este detalle",
  },
  assets: ASSETS_CONFIG,
  search: UI_CONFIG.search,
  floating: UI_CONFIG.floating,
  activity: ACTIVITY_CONFIG,
  categories: CATEGORIES,
} as const;