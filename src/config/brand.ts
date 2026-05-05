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

  modal: {
    addedTitle: "Detalle listo",
    addedDescription: "Ya tienes este detalle en tu pedido",
    questionTitle: "¿Quieres hacerlo más especial?",
    questionDescription:
      "Puedes agregar una dedicatoria o coordinar entrega desde tu pedido.",
    primaryCta: "Ver mi pedido",
    secondaryCta: "Seguir explorando",
  },

  productCard: {
    whatsappDefault: "Hola, quiero enviar este detalle",
    whatsappPreventa: "Hola, quiero consultar este detalle",
    whatsappRestock: "Hola, quiero saber si pueden preparar nuevamente este detalle",
  },

  assets: {
    logo: "https://gleemour.com/logo_color.png",
  },

  search: {
    placeholder: "Busca por ocasión, detalle o emoción...",
  },

  floating: {
    cartLabel: "Mi pedido",
    catalogLabel: "Ver catálogo",
    whatsappLabel: "Te ayudamos",
  },
  
  activity: {
    label: "Alguien sorprendió hace poco",
  },

  categories: [
    {
      id: "todas",
      name: "Todos",
      icon: "✨",
      description: "Explora todos los detalles disponibles.",
    },
    {
      id: "para-enamorar",
      name: "Para enamorar",
      icon: "💘",
      description: "Detalles para conquistar, emocionar o sorprender con amor.",
    },
    {
      id: "momentos-especiales",
      name: "Momentos especiales",
      icon: "✨",
      description: "Fechas importantes como Día de la Madre, Día de la Mujer y campañas especiales.",
    },
    {
      id: "para-sorprender",
      name: "Para sorprender",
      icon: "🎁",
      description: "Detalles que llegan sin aviso y se recuerdan bonito.",
    },
    {
      id: "para-celebrar",
      name: "Para celebrar",
      icon: "🎉",
      description: "Opciones para cumpleaños, logros y momentos felices.",
    },
    {
      id: "para-agradecer",
      name: "Para agradecer",
      icon: "💌",
      description: "Un gesto elegante para decir gracias.",
    },
    {
      id: "para-pedir-perdon",
      name: "Para pedir perdón",
      icon: "🌷",
      description: "Detalles sinceros para abrir una conversación.",
    },
    {
      id: "para-acompanar",
      name: "Para acompañar",
      icon: "🤍",
      description: "Cuando quieres estar presente con un gesto cálido.",
    },
  ],

} as const;