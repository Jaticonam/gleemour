import { useMemo, useState } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BRAND_CONFIG } from "@/config/brand";
import type { Product } from "@/types/product";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  products?: Product[];
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  products = [],
  placeholder = BRAND_CONFIG.search.placeholder,
}: SearchInputProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasValue = value.trim().length > 0;

  const suggestions = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return [];

    return products
      .filter((p) => {
        const title = p.title?.toLowerCase() ?? "";
        const id = p.id?.toLowerCase() ?? "";
        const category = p.category?.toLowerCase() ?? "";
        const description = p.description?.toLowerCase() ?? "";
        const occasion = p.occasion?.toLowerCase() ?? "";
        const message = p.message?.toLowerCase() ?? "";
        const highlight = p.highlight?.toLowerCase() ?? "";

        return (
          title.includes(term) ||
          id.includes(term) ||
          category.includes(term) ||
          description.includes(term) ||
          occasion.includes(term) ||
          message.includes(term) ||
          highlight.includes(term)
        );
      })
      .slice(0, 6);
  }, [value, products]);

  const goToProduct = (product: Product) => {
    const currentSearch = value.trim();

    onChange("");
    setActiveIndex(-1);

    navigate(`/catalogo/producto.html?id=${product.id}&cat=${product.category}`, {
      state: {
        fromSearch: true,
        searchQuery: currentSearch,
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setActiveIndex(-1);
      onChange("");
      return;
    }

    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      goToProduct(suggestions[activeIndex]);
    }
  };

  return (
    <div className="search-input-wrap">
      <div className="search-input-box">
        <Search className="search-input-icon" />

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input-field"
        />

        {hasValue && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setActiveIndex(-1);
            }}
            className="search-input-clear"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((p, index) => (
            <button
              key={p.id}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => goToProduct(p)}
              className={[
                "search-suggestion-item",
                activeIndex === index ? "search-suggestion-item-active" : "",
              ].join(" ")}
            >
              <img
                src={p.img || "/placeholder.svg"}
                alt={p.title}
                loading="lazy"
              />

              <div>
                <p>{p.title}</p>
                <span>{p.category} · {p.id}</span>
              </div>

              <Sparkles className="search-suggestion-action" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}