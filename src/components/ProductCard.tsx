import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  MessageCircle,
  Eye,
} from "lucide-react";

import { BRAND_CONFIG } from "@/config/brand";
import { getBadgePresentation, sortBadges } from "@/config/badgeRules";
import { CartItem, Product } from "@/types/product";
import { getProductPrice, isProductAvailable } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  cart?: CartItem[];
  onAddToCart: (product: Product) => void;
  onImageClick?: (src: string, title: string) => void;
}

const getEmotionalHint = (product: Product) => {
  if (product.highlight) return product.highlight;
  if (product.message) return product.message;
  if (product.occasion) return `Ideal para ${product.occasion}`;

  const category = product.category.toLowerCase();

  if (category.includes("enamorar")) return "Para decirlo bonito, sin dar tantas vueltas.";
  if (category.includes("especiales")) return "Ideal para fechas que no se pueden dejar pasar.";
  if (category.includes("sorprender")) return "Para llegar bonito y sin aviso.";
  if (category.includes("celebrar")) return "Perfecto para hacer especial el momento.";
  if (category.includes("agradecer")) return "Un gesto cálido para decir gracias.";
  if (category.includes("perdon") || category.includes("perdón")) return "Un detalle para abrir conversación.";
  if (category.includes("acompa")) return "Cuando las palabras no alcanzan.";

  return "Un detalle listo para sorprender.";
};

export function ProductCard({
  product: p,
  cart = [],
  onAddToCart,
}: ProductCardProps) {
  const navigate = useNavigate();

  const available = isProductAvailable(p);
  const isPreventa = (p.status || "").trim().toLowerCase() === "preventa";
  const price = getProductPrice(p);

  const isOutOfStock = !isPreventa && price > 0 && p.stock === 0;
  const showWhatsAppButton = isPreventa || isOutOfStock;

  const cartItem = cart.find((item) => item.id === p.id);
  const qtyInCart = cartItem?.qty ?? 0;
  const isInCart = qtyInCart > 0;

  const [viewers, setViewers] = useState(Math.floor(Math.random() * 8) + 6);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 8) + 6);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const goToDetail = () => {
    navigate(`/catalogo/producto.html?id=${p.id}&cat=${p.category}`);
  };

  const handleAdd = () => {
    if (!available || isPreventa) return;
    onAddToCart(p);
  };

  const handleWhatsApp = () => {
    const statusText = isPreventa
      ? "Hola, quiero consultar este detalle"
      : isOutOfStock
      ? "Hola, quiero saber si pueden preparar nuevamente este detalle"
      : "Hola, quiero enviar este detalle";

    const message =
      `${statusText}:%0A%0A` +
      `Producto: ${p.title}%0A` +
      `Código: ${p.id}%0A` +
      `Categoría: ${p.category}%0A` +
      `Precio: S/ ${price.toFixed(2)}%0A%0A` +
      `Quisiera coordinar dedicatoria y entrega.`;

    window.open(
      `https://wa.me/${BRAND_CONFIG.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  let stockText = "Disponible hoy";
  let StockIcon = CheckCircle;
  let stockClass = "product-card-status product-card-status-success";

  if (isPreventa) {
    stockText = "Preventa";
    StockIcon = Clock;
    stockClass = "product-card-status product-card-status-preorder";
  } else if (!price || price <= 0 || p.stock === null || p.stock === undefined) {
    stockText = "Próximamente";
    StockIcon = Clock;
    stockClass = "product-card-status product-card-status-muted";
  } else if (p.stock === 0) {
    stockText = "Agotado temporalmente";
    StockIcon = XCircle;
    stockClass = "product-card-status product-card-status-danger";
  } else if (p.stock <= 3) {
    stockText = `Últimos ${p.stock}`;
    StockIcon = AlertTriangle;
    stockClass = "product-card-status product-card-status-danger";
  } else if (p.stock <= 10) {
    stockText = "Pocas unidades";
    StockIcon = AlertTriangle;
    stockClass = "product-card-status product-card-status-warning";
  }

  return (
    <article className="product-card-gleemour">
      <div className="product-card-image-wrap">
        <img
          src={p.img || "/placeholder.svg"}
          alt={p.title}
          onClick={goToDetail}
          loading="lazy"
          className={`product-card-image ${
            !available && !isPreventa ? "product-card-image-disabled" : ""
          }`}
        />

        {p.badges && p.badges.length > 0 && (
          <div className="product-card-badges">
            {sortBadges(p.badges)
              .slice(0, 2)
              .map((badge, index) => {
                const presentation = getBadgePresentation(badge);

                return (
                  <span
                    key={`${p.id}-badge-${index}`}
                    className={[
                      "product-card-badge",
                      presentation.className,
                      presentation.animation,
                    ].join(" ")}
                  >
                    {badge}
                  </span>
                );
              })}
          </div>
        )}

        {isInCart && (
          <div className="product-card-cart-badge">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{qtyInCart} en pedido</span>
          </div>
        )}

        {available && !isPreventa && (
          <div className="product-card-ready-badge">
            Listo para regalar
          </div>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{p.id}</span>
          <span>{p.category}</span>
        </div>

        <h3 onClick={goToDetail} className="product-card-title">
          {p.title}
        </h3>

        <p className="product-card-description">
          {p.description || getEmotionalHint(p)}
        </p>

        <p className="product-card-hint">
          {getEmotionalHint(p)}
        </p>

        <div className="product-card-price-block">
          {isPreventa ? (
            <>
              <span className="product-card-preorder">Consultar</span>
              <small>Te orientamos por WhatsApp</small>
            </>
          ) : (
            <>
              <div className="product-card-price">
                <span>S/</span>
                <strong>{price.toFixed(2)}</strong>
              </div>
              <small>Precio del detalle</small>
            </>
          )}
        </div>

        <div className={stockClass}>
          <StockIcon className="w-3.5 h-3.5" />
          <span>{stockText}</span>
        </div>

        {(available || isPreventa) && (
          <div className="product-card-viewers">
            <Eye className="w-3.5 h-3.5" />
            <span>{viewers} viendo ahora</span>
          </div>
        )}

        <button
          onClick={showWhatsAppButton ? handleWhatsApp : handleAdd}
          disabled={!available && !showWhatsAppButton}
          className={[
            "product-card-button",
            showWhatsAppButton
              ? "product-card-button-whatsapp"
              : available
              ? "product-card-button-primary"
              : "product-card-button-disabled",
          ].join(" ")}
        >
          {showWhatsAppButton ? (
            <>
              <MessageCircle className="w-4 h-4" />
              <span>{isPreventa ? "Consultar" : "Consultar disponibilidad"}</span>
            </>
          ) : available ? (
            isInCart ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Agregar más</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Agregar al pedido</span>
              </>
            )
          ) : (
            <span>Agotado</span>
          )}
        </button>
      </div>
    </article>
  );
}