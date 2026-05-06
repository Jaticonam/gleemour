export interface BadgeRule {
  id: string;
  label: string;
  keywords: string[];
  className: string;
  animation?: string;
  priority: number;
}

/**
 * Badges comerciales oficiales.
 * Se usan en catálogo, product detail, campañas y recomendaciones.
 */
export const BADGE_RULES: BadgeRule[] = [
  {
    id: "oferta",
    label: "Oferta",
    keywords: ["oferta", "promo", "promocion", "promoción", "descuento"],
    className: "bg-red-600 text-white",
    priority: 1,
  },
  {
    id: "mas-vendido",
    label: "Más vendido",
    keywords: ["mas vendido", "más vendido", "top ventas", "top", "destacado"],
    className: "bg-amber-500 text-white",
    priority: 2,
  },
  {
    id: "nuevo",
    label: "Nuevo",
    keywords: ["nuevo", "new"],
    className: "bg-purple-600 text-white",
    animation: "animate-pulse",
    priority: 3,
  },
  {
    id: "preventa",
    label: "Preventa",
    keywords: ["preventa", "pre venta", "lanzamiento"],
    className: "bg-green-500 text-white",
    animation: "animate-pulse",
    priority: 4,
  },
  {
    id: "edicion-especial",
    label: "Edición especial",
    keywords: ["edicion especial", "edición especial", "especial", "exclusivo"],
    className: "bg-slate-800 text-white",
    priority: 5,
  },
  {
    id: "ultimas-unidades",
    label: "Últimas unidades",
    keywords: ["ultimas unidades", "últimas unidades", "ultimos", "últimos"],
    className: "bg-rose-600 text-white",
    priority: 6,
  },
  {
    id: "premium",
    label: "Premium",
    keywords: ["premium", "vip", "elegante"],
    className: "bg-neutral-900 text-white",
    priority: 7,
  },
];

/**
 * Normaliza texto de badge.
 */
export function normalizeBadgeText(badge: string): string {
  return badge
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Obtiene configuración visual de un badge.
 */
export function getBadgePresentation(badge: string) {
  const value = normalizeBadgeText(badge);

  const matchedRule = BADGE_RULES.find((rule) =>
    rule.keywords.some((keyword) =>
      value.includes(normalizeBadgeText(keyword))
    )
  );

  if (matchedRule) {
    return {
      className: matchedRule.className,
      animation: matchedRule.animation || "",
      priority: matchedRule.priority,
    };
  }

  return {
    className: "bg-black/80 text-white",
    animation: "",
    priority: 999,
  };
}

/**
 * Ordena badges según prioridad visual.
 */
export function sortBadges(badges: string[]): string[] {
  return [...badges].sort((a, b) => {
    const aPriority = getBadgePresentation(a).priority;
    const bPriority = getBadgePresentation(b).priority;

    return aPriority - bPriority;
  });
}