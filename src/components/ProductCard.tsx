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

import { getEmotionalHint } from "@/lib/product/emotional";
import { getBadgePresentation, sortBadges } from "@/config/badgeRules";
import { getCategoryName } from "@/config/categories";

import { CartItem, Product } from "@/types/product";

import {
  getProductPrice,
  getOriginalProductPrice,
  hasOfferPrice,
  isProductAvailable,
  getProductState,
  buildProductWhatsAppUrl,
  } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  cart?: CartItem[];
  onAddToCart: (product: Product) => void;
  onImageClick?: (src: string, title: string) => void;
}

export function ProductCard({
  product,
  cart = [],
  onAddToCart,
}: ProductCardProps) {
  const navigate = useNavigate();

  const available = isProductAvailable(product);

  const productState = getProductState(product);

  const isPreventa = productState.type === "preorder";

  const showWhatsAppButton =
    productState.type === "preorder" ||
    productState.type === "sold-out";

  const price = getProductPrice(product);

  const originalPrice = getOriginalProductPrice(product);

  const hasOffer = hasOfferPrice(product);

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
    const url = buildProductWhatsAppUrl({
      product,
      qty: 1,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  let StockIcon = CheckCircle;

  let stockClass =
    "product-card-status product-card-status-success";

  switch (productState.type) {
    case "preorder":
      StockIcon = Clock;
      stockClass =
        "product-card-status product-card-status-preorder";
      break;

    case "sold-out":
      StockIcon = XCircle;
      stockClass =
        "product-card-status product-card-status-danger";
      break;

    case "last-units":
      StockIcon = AlertTriangle;
      stockClass =
        "product-card-status product-card-status-danger";
      break;

    case "limited":
      StockIcon = AlertTriangle;
      stockClass =
        "product-card-status product-card-status-warning";
      break;

    case "unavailable":
      StockIcon = Clock;
      stockClass =
        "product-card-status product-card-status-muted";
      break;
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
            !available && !isPreventa
              ? "product-card-image-disabled"
              : ""
          }`}
        />

        {product.badges && product.badges.length > 0 && (
          <div className="product-card-badges">
            {sortBadges(product.badges)
              .slice(0, 2)
              .map((badge, index) => {
                const presentation =
                  getBadgePresentation(badge);

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

          <span>
            {getCategoryName(product.category)}
          </span>
        </div>

        <h3
          onClick={goToDetail}
          className="product-card-title"
        >
          {product.title}
        </h3>

        <p className="product-card-description">
          {product.description ||
            getEmotionalHint(product)}
        </p>

        <p className="product-card-hint">
          {getEmotionalHint(product)}
        </p>

        <div className="product-card-price-block">
          {isPreventa ? (
            <>
              <span className="product-card-preorder">
                Consultar
              </span>

              <small>
                Te orientamos por WhatsApp
              </small>
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

                <strong>
                  {price.toFixed(2)}
                </strong>
              </div>

              {hasOffer ? (
                <small className="product-card-offer-text">
                  Oferta especial disponible
                </small>
              ) : (
                <small>
                  Precio del detalle
                </small>
              )}
            </div>
          )}
        </div>

        <div className={stockClass}>
          <StockIcon className="w-3.5 h-3.5" />

          <span>{productState.label}</span>
        </div>

        {(available || isPreventa) && (
          <div className="product-card-viewers">
            <Eye className="w-3.5 h-3.5" />

            <span>
              {viewers} viendo ahora
            </span>
          </div>
        )}

        <button
          onClick={
            showWhatsAppButton
              ? handleWhatsApp
              : handleAdd
          }
          disabled={
            !available && !showWhatsAppButton
          }
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
                {isPreventa
                  ? "Consultar"
                  : "Consultar disponibilidad"}
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

                <span>
                  Agregar al pedido
                </span>
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