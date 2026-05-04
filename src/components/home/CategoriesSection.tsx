import { Link } from "react-router-dom";
import { ArrowRight, Building2, Flower2, Music, Sparkles } from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";

const categories = [
  {
    name: "Naturales",
    tag: "Frescos",
    slug: "naturales",
    description: "Arreglos frescos que emocionan.",
    icon: Flower2,
  },
  {
    name: "Artificiales",
    tag: "Duraderos",
    slug: "artificiales",
    description: "Detalles que permanecen en el tiempo.",
    icon: Sparkles,
  },
  {
    name: "Corporativos",
    tag: "Profesional",
    slug: "corporativos",
    description: "Gestos elegantes para empresas.",
    icon: Building2,
  },
];

export default function CategoriesSection() {
  return (
    <section id="catalogo" className="home-section">
      
      {/* HEADER */}
      <div className="mb-12 text-center">
        <HomeSectionHeader
          icon={Music}
          kicker="Categorías Gleemour"
          title="Sinfonías que florecen"
          description="Elige el tipo de detalle según el momento que quieres crear."
          align="center"
        />

        {/* Línea decorativa (ÚNICA) */}
        <div className="mx-auto mt-7 h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--w-highlight)] via-[var(--w-secondary)] to-[var(--w-primary)]" />
      </div>

      {/* GRID */}
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <Link
              key={cat.slug}
              to={`/catalogo/categoria.html?cat=${cat.slug}`}
              className="group relative overflow-hidden rounded-[30px] border border-[var(--w-border)] bg-white/90 p-7 shadow-[var(--w-shadow-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[var(--w-secondary)] hover:shadow-[var(--w-shadow-medium)]"
            >
              {/* Glow decorativo */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--w-secondary)]/10 blur-2xl transition-all duration-500 group-hover:bg-[var(--w-highlight)]/20" />

              <div className="relative z-10">
                
                {/* ICONO */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--w-primary-soft)] text-[var(--w-primary)] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--w-primary)] group-hover:text-white">
                  <Icon size={30} strokeWidth={1.8} />
                </div>

                {/* TAG */}
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[var(--w-secondary)]">
                  {cat.tag}
                </span>

                {/* TÍTULO */}
                <h3 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-[var(--w-heading)]">
                  {cat.name}
                </h3>

                {/* DESCRIPCIÓN */}
                <p className="mb-6 text-sm leading-snug text-[var(--w-muted)]">
                  {cat.description}
                </p>

                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-sm font-black text-[var(--w-primary)] transition-all duration-300 group-hover:gap-3 group-hover:text-[var(--w-secondary)]">
                  Ver detalles
                  <ArrowRight size={17} />
                </div>

              </div>
            </Link>
          );
        })}
      </div>

    </section>
  );
}