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
import {
  getProductPrice,
  getOriginalProductPrice,
  hasOfferPrice,
  isProductAvailable,
} from "@/lib/products";

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

  const categories = product.categories ?? [product.category];
  const categoryText = categories.join(" ").toLowerCase();

  if (categoryText.includes("enamorar")) {
    return "Para decirlo bonito, sin dar tantas vueltas.";
  }

  if (categoryText.includes("especiales")) {
    return "Ideal para fechas que no se pueden dejar pasar.";
  }

  if (categoryText.includes("sorprender")) {
    return "Para llegar bonito y sin aviso.";
  }

  if (categoryText.includes("celebrar")) {
    return "Perfecto para hacer especial el momento.";
  }

  if (categoryText.includes("agradecer")) {
    return "Un gesto cálido para decir gracias.";
  }

  if (categoryText.includes("perdon") || categoryText.includes("perdón")) {
    return "Un detalle para abrir conversación.";
  }

  if (categoryText.includes("acompa")) {
    return "Cuando las palabras no alcanzan.";
  }

  return "Un detalle listo para sorprender.";
};

export function ProductCard({
  product,
  cart = [],
  onAddToCart,
}: ProductCardProps) {
  const navigate = useNavigate();

  const available = isProductAvailable(product);
  const isPreventa =
    (product.status || "").trim().toLowerCase() === "preventa";

  const price = getProductPrice(product);
  const originalPrice = getOriginalProductPrice(product);
  const hasOffer = hasOfferPrice(product);

  const isOutOfStock =
    !isPreventa && price > 0 && product.stock === 0;

  const showWhatsAppButton = isPreventa || isOutOfStock;

  const cartItem = cart.find((item) => item.id === product.id);
  const qtyInCart = cartItem?.qty ?? 0;
  const isInCart = qtyInCart > 0;

  const [viewers, setViewers] = useState(
    Math.floor(Math.random() * 8) + 6
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 8) + 6);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const goToDetail = () => {
    navigate(
      `/catalogo/producto.html?id=${product.id}&cat=${product.category}`
    );
  };

  const handleAdd = () => {
    if (!available || isPreventa) return;
    onAddToCart(product);
  };

  const handleWhatsApp = () => {
    const statusText = isPreventa
      ? BRAND_CONFIG.productCard.whatsappPreventa
      : isOutOfStock
      ? BRAND_CONFIG.productCard.whatsappRestock
      : BRAND_CONFIG.productCard.whatsappDefault;

    const message =
      `${statusText}:%0A%0A` +
      `Producto: ${product.title}%0A` +
      `Código: ${product.id}%0A` +
      `Categoría: ${product.category}%0A` +
      `Precio: S/ ${price.toFixed(2)}%0A%0A` +
      `${BRAND_CONFIG.checkout.closing}`;

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
  } else if (
    !price ||
    price <= 0 ||
    product.stock === null ||
    product.stock === undefined
  ) {
    stockText = "Próximamente";
    StockIcon = Clock;
    stockClass = "product-card-status product-card-status-muted";
  } else if (product.stock === 0) {
    stockText = "Agotado temporalmente";
    StockIcon = XCircle;
    stockClass = "product-card-status product-card-status-danger";
  } else if (product.stock <= 3) {
    stockText = `Últimos ${product.stock}`;
    StockIcon = AlertTriangle;
    stockClass = "product-card-status product-card-status-danger";
  } else if (product.stock <= 10) {
    stockText = "Pocas unidades";
    StockIcon = AlertTriangle;
    stockClass = "product-card-status product-card-status-warning";
  }

  return (
    <article className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={product.img || "/placeholder.svg"}
          alt={product.title}
          onClick={goToDetail}
          loading="lazy"
          className={`product-card-image ${
            !available && !isPreventa ? "product-card-image-disabled" : ""
          }`}
        />

        {product.badges && product.badges.length > 0 && (
          <div className="product-card-badges">
            {sortBadges(product.badges)
              .slice(0, 2)
              .map((badge, index) => {
                const presentation = getBadgePresentation(badge);

                return (
                  <span
                    key={`${product.id}-badge-${index}`}
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
          <span>{product.id}</span>
          <span>{product.category}</span>
        </div>

        <h3 onClick={goToDetail} className="product-card-title">
          {product.title}
        </h3>

        <p className="product-card-description">
          {product.description || getEmotionalHint(product)}
        </p>

        <p className="product-card-hint">
          {getEmotionalHint(product)}
        </p>

        <div className="product-card-price-block">
          {isPreventa ? (
            <>
              <span className="product-card-preorder">Consultar</span>
              <small>Te orientamos por WhatsApp</small>
            </>
          ) : (
            <div className="product-card-price-wrap">
              {hasOffer && (
                <div className="product-card-price-old">
                  S/ {originalPrice.toFixed(2)}
                </div>
              )}

              <div className="product-card-price">
                <span>S/</span>
                <strong>{price.toFixed(2)}</strong>
              </div>

              {hasOffer ? (
                <small className="product-card-offer-text">
                  Oferta especial disponible
                </small>
              ) : (
                <small>Precio del detalle</small>
              )}
            </div>
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
              <span>
                {isPreventa ? "Consultar" : "Consultar disponibilidad"}
              </span>
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