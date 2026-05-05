import { WHATSAPP_NUMBER } from "@/config/contact";

export const BRAND_CONFIG = {
  slug: "gleemour",
  name: "Gleemour",

  contact: {
    whatsapp: WHATSAPP_NUMBER,
  },

  catalog: {
    title: "Elige el detalle perfecto",
    description:
      "Encuentra regalos listos para sorprender, agradecer, celebrar o decir eso que a veces cuesta poner en palabras.",
    kicker: "Catálogo emocional",
  },

  checkout: {
    whatsappTitle: "*✨ Pedido Gleemour*",
    intro: "Hola, quiero enviar este detalle:",
    closing:
      "Quisiera coordinar dedicatoria, horario y entrega. Gracias 💐",
  },

  cart: {
    title: "Mi Pedido",
    emptyTitle: "Aún no has elegido tu detalle",
    emptyDescription:
      "Explora el catálogo y agrega algo bonito para sorprender.",
    cta: "Enviar pedido por WhatsApp",
    totalLabel: "Total a pagar hoy",
  },
} as const;