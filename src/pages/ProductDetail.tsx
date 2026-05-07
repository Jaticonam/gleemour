import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  ZoomIn,
  Minus,
  Plus,
  Share2,
  MessageCircle,
  Heart,
} from "lucide-react";

import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import { getBadgePresentation, sortBadges } from "@/config/badgeRules";
import { useCart } from "@/hooks/use-cart";
import { fetchProducts } from "@/lib/products";

import {
  isProductAvailable,
  getProductPrice,
  getOriginalProductPrice,
  hasOfferPrice,
  getProductState,
  buildProductWhatsAppUrl,
  getCatalogUrl,
  getCategoryUrl,
  getRelatedProducts,
  getLiveViewers,
} from "@/lib/product";

import { FloatingButtons } from "@/components/FloatingButtons";
import { CartSidebar } from "@/components/CartSidebar";
import { NotificationStack, showNotification } from "@/components/NotificationStack";
import { RecentActivity } from "@/components/RecentActivity";
import { ImageZoomModal } from "@/components/ImageZoomModal";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ProductCard } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/skeletons/ProductSkeleton";
import { AddToCartModal } from "@/components/AddToCartModal";
import { BRAND_CONFIG } from "@/config/brand";
import { getCategoryName } from "@/config/categories";
import { PRODUCT_DETAIL_CONFIG } from "@/config/productDetail";

const ProductDetailPage = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get("cat") || "";
  const id = searchParams.get("id") || paramId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const [qty, setQty] = useState(1);
  const [qtyInput, setQtyInput] = useState("1");
  const [modalQty, setModalQty] = useState(0);

  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 8) + 6);

  const {
    cart,
    addToCart,
    removeFromCart,
    changeQty,
    setExactQty,
    setItemNote,
    totalItems,
    totalPrice,
    savings,
  } = useCart();

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 8) + 6);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setQty(1);
    setQtyInput("1");
    setModalQty(0);
    setAddModalOpen(false);
  }, [id]);

  const product = useMemo(
    () => products.find((item) => item.id === id),
    [products, id]
  );

  const available = product ? isProductAvailable(product) : false;

  const originalPrice = product
    ? getOriginalProductPrice(product)
    : 0;
  const finalPrice = product
    ? getProductPrice(product)
    : 0;

  const hasOffer = product
    ? hasOfferPrice(product)
    : false;

  const currentCartQty = useMemo(() => {
    if (!product) return 0;
    return cart.find((item) => item.id === product.id)?.qty ?? 0;
  }, [cart, product]);

  const parsedQtyInput =
    qtyInput.trim() !== "" && /^\d+$/.test(qtyInput)
      ? parseInt(qtyInput, 10)
      : null;

  const isQtyInputValid = parsedQtyInput !== null && parsedQtyInput >= 1;
  const effectiveQty = isQtyInputValid ? parsedQtyInput : qty;
  const total = finalPrice * effectiveQty;

  const related = useMemo(() => {
    if (!product) return [];

    return getRelatedProducts(product, products, 4);
  }, [products, product]);

  const updateQty = useCallback((newQty: number) => {
    const safeQty = Math.max(1, Math.floor(newQty));
    setQty(safeQty);
    setQtyInput(String(safeQty));
  }, []);

  const handleQtyInputChange = useCallback((value: string) => {
    if (value === "") {
      setQtyInput("");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setQtyInput(value);

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      setQty(parsed);
    }
  }, []);

  const handleQtyInputBlur = useCallback(() => {
    if (qtyInput === "") return;

    const parsed = parseInt(qtyInput, 10);

    if (isNaN(parsed) || parsed < 1) {
      setQtyInput("");
      return;
    }

    updateQty(parsed);
  }, [qtyInput, updateQty]);

  const handleQtyInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") e.currentTarget.blur();

      if (e.key === "ArrowUp") {
        e.preventDefault();
        updateQty(effectiveQty + 1);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        updateQty(Math.max(1, effectiveQty - 1));
      }
    },
    [effectiveQty, updateQty]
  );

  const handleAddToCart = useCallback(() => {
    if (!product || !available || !isQtyInputValid || parsedQtyInput === null) return;

    const nextQtyInCart = currentCartQty + parsedQtyInput;

    addToCart(product, parsedQtyInput);
    setModalQty(nextQtyInCart);
    setAddModalOpen(true);
  }, [
    product,
    available,
    isQtyInputValid,
    parsedQtyInput,
    currentCartQty,
    addToCart,
  ]);

  const handleAddExtraFromModal = useCallback(
    (extraQty: number) => {
      if (!product || extraQty <= 0) return;

      const nextQty = modalQty + extraQty;

      addToCart(product, extraQty);
      setModalQty(nextQty);
      setQty(nextQty);
      setQtyInput(String(nextQty));
    },
    [product, modalQty, addToCart]
  );

  const handleShare = useCallback(() => {
    if (!product) return;

    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification(
        PRODUCT_DETAIL_CONFIG.notifications.linkCopiedTitle,
        PRODUCT_DETAIL_CONFIG.notifications.linkCopiedDescription
      );
    }
  }, [product]);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;

    const url = buildProductWhatsAppUrl({
      product,
      qty: effectiveQty,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  }, [product, effectiveQty]);

  const productState = product
  ? getProductState(product)
  : {
      type: "unavailable",
      label: "No disponible",
      available: false,
    };
  
  const isPreventa = productState.type === "preorder";
  const isOutOfStock = productState.type === "sold-out";
    

let stockClass = "product-detail-status-muted";
let StockIcon = Clock;

switch (productState.type) {
  case "available":
    stockClass = "product-detail-status-success";
    StockIcon = CheckCircle;
    break;

  case "preorder":
    stockClass = "product-detail-status-preorder";
    StockIcon = Clock;
    break;

  case "sold-out":
    stockClass = "product-detail-status-danger";
    StockIcon = XCircle;
    break;

  case "last-units":
    stockClass = "product-detail-status-danger";
    StockIcon = AlertTriangle;
    break;

  case "limited":
    stockClass = "product-detail-status-warning";
    StockIcon = AlertTriangle;
    break;

  default:
    stockClass = "product-detail-status-muted";
    StockIcon = Clock;
}

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="product-detail-empty">
        <p>{PRODUCT_DETAIL_CONFIG.empty.title}</p>
        <button
          onClick={() =>
            navigate(
              currentCategory
                ? `/catalogo/categoria.html?cat=${encodeURIComponent(currentCategory)}`
                : "/catalogo"
            )
          }
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <NotificationStack />

      <header className="product-detail-header">
        <CountdownTimer />

        <div className="product-detail-header-inner">
          <button onClick={() => navigate(-1)} className="product-detail-icon-button">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="product-detail-header-title">
            <h1>{product.title}</h1>
            <p>{product.id}</p>
          </div>

          <button onClick={handleShare} className="product-detail-icon-button">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="product-detail-main">
        <section className="product-detail-grid">
          <div className="product-detail-gallery">
            <div
              className="product-detail-image-wrap"
              onClick={() => setZoomImage({ src: product.img, title: product.title })}
            >
              <img
                src={product.img}
                alt={product.title}
                className={`product-detail-image ${
                  !available ? "product-detail-image-disabled" : ""
                }`}
              />

              {product.badges && product.badges.length > 0 && (
                <div className="product-detail-badges">
                  {sortBadges(product.badges)
                    .slice(0, 3)
                    .map((badge, index) => {
                      const presentation = getBadgePresentation(badge);

                      return (
                        <span
                          key={`${product.id}-detail-image-badge-${index}`}
                          className={[
                            "product-detail-badge",
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

              <div className="product-detail-zoom">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="product-detail-info">
            <div className="product-detail-heading">
              <div className="product-detail-topline">
                <span className="product-detail-kicker">
                  {getCategoryName(product.category)}
                </span>
                <span className="product-detail-code">{product.id}</span>
              </div>

              <h2 className="product-detail-title">{product.title}</h2>

              <p className="product-detail-description">
                {product.description ||
                  PRODUCT_DETAIL_CONFIG.description.fallback}
              </p>
            </div>

            <div className="product-detail-meta-row">
              <div className={`product-detail-status ${stockClass}`}>
                <StockIcon className="w-4 h-4" />
                <span>{productState.label}</span>
              </div>

              {available && (
                <div className="product-detail-viewers">
                  <span />
                  {viewers} viendo ahora
                </div>
              )}
            </div>

            <div className="product-detail-buy-box">
              <div className="product-detail-price-box">
                <p>{PRODUCT_DETAIL_CONFIG.price.label}</p>

                <div className="product-detail-price">
                  <span>S/</span>
                  <strong>{finalPrice.toFixed(2)}</strong>
                </div>

                {hasOffer && (
                  <small className="product-detail-price-old">
                    {PRODUCT_DETAIL_CONFIG.price.oldPricePrefix} {originalPrice.toFixed(2)}
                  </small>
                )}

                {effectiveQty > 1 && (
                  <small>
                    {PRODUCT_DETAIL_CONFIG.price.totalLabel}: <strong>S/ {total.toFixed(2)}</strong>
                  </small>
                )}

                {!isQtyInputValid && (
                  <small className="product-detail-error">
                    {PRODUCT_DETAIL_CONFIG.quantity.invalidMessage}
                  </small>
                )}
              </div>

              {available && (
                <div className="product-detail-qty-block">
                  <p>{PRODUCT_DETAIL_CONFIG.quantity.label}</p>

                  <div className="product-detail-qty">
                    <button
                      type="button"
                      onClick={() => updateQty(effectiveQty - 1)}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={qtyInput}
                      onChange={(e) => handleQtyInputChange(e.target.value)}
                      onBlur={handleQtyInputBlur}
                      onKeyDown={handleQtyInputKeyDown}
                      placeholder="1"
                      aria-label="Cantidad"
                    />

                    <button
                      type="button"
                      onClick={() => updateQty(effectiveQty + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="product-detail-actions">
                {available && (
                  <button
                    onClick={handleAddToCart}
                    disabled={!isQtyInputValid}
                    className={[
                      "product-detail-button",
                      isQtyInputValid
                        ? "product-detail-button-primary"
                        : "product-detail-button-disabled",
                    ].join(" ")}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>
                      {isQtyInputValid
                        ? `${PRODUCT_DETAIL_CONFIG.actions.addToCart} — S/ ${total.toFixed(2)}`
                        : PRODUCT_DETAIL_CONFIG.actions.invalidQty
                      }
                    </span>
                  </button>
                )}

                <button
                  onClick={handleWhatsApp}
                  className="product-detail-button product-detail-button-whatsapp"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>
                    {isPreventa
                      ? PRODUCT_DETAIL_CONFIG.actions.whatsappPreorder
                      : isOutOfStock
                      ? PRODUCT_DETAIL_CONFIG.actions.whatsappSoldOut
                      : PRODUCT_DETAIL_CONFIG.actions.whatsappDefault}
                  </span>
                </button>
              </div>
            </div>

            <div className="product-detail-note">
              <Heart className="w-5 h-5" />
              <div>
                <p>{BRAND_CONFIG.modal.questionTitle}</p>
                <small>{BRAND_CONFIG.modal.questionDescription}</small>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="product-detail-related">
            <h3>{PRODUCT_DETAIL_CONFIG.related.title}</h3>

            <div className="product-detail-related-grid">
              {related.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  cart={cart}
                  onAddToCart={(item) => {
                    addToCart(item, 1);
                    showNotification(
                      PRODUCT_DETAIL_CONFIG.notifications.addedToCartTitle,
                      item.title
                    );
                  }}
                  onImageClick={(src, title) => setZoomImage({ src, title })}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <FloatingButtons cartCount={totalItems} onCartClick={() => setCartOpen(true)} />
      <RecentActivity products={products} />

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        savings={savings}
        onRemove={removeFromCart}
        onChangeQty={changeQty}
        onSetQty={setExactQty}
        onChangeNote={setItemNote}
      />

      <AddToCartModal
        open={addModalOpen}
        product={product}
        currentQty={modalQty}
        onClose={() => setAddModalOpen(false)}
        onAddExtra={handleAddExtraFromModal}
        onOpenCart={() => {
          setAddModalOpen(false);
          setCartOpen(true);
        }}
        secondaryActionLabel="Seguir explorando"
        onSecondaryAction={() => {
          setAddModalOpen(false);
          navigate("/catalogo");
        }}
      />

      <ImageZoomModal
        src={zoomImage?.src ?? null}
        title={zoomImage?.title ?? ""}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
};

export default ProductDetailPage;