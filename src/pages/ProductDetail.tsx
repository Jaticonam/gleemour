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
} from "lucide-react";

import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import { getBadgePresentation, sortBadges } from "@/config/badgeRules";
import { useCart } from "@/hooks/use-cart";
import { fetchProducts, isProductAvailable } from "@/lib/products";
import { Product } from "@/types/product";

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
import { getProductPrice } from "@/lib/products";

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
  const isPreventa = (product?.status || "").trim().toLowerCase() === "preventa";
  const productPrice = product ? getProductPrice(product) : 0;

  const isOutOfStock =
    !!product && !isPreventa && productPrice > 0 && product.stock === 0;

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
  const total = productPrice * effectiveQty;

  const related = useMemo(() => {
    if (!product) return [];

    const sameCategory = products.filter(
      (item) => item.category === product.category && item.id !== product.id
    );

    const otherCategories = products.filter(
      (item) => item.category !== product.category && item.id !== product.id
    );

    return [...sameCategory.slice(0, 4), ...otherCategories.slice(0, 4)];
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

    const safeQty = Math.floor(parsed);
    setQty(safeQty);
    setQtyInput(String(safeQty));
  }, [qtyInput]);

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
      showNotification("Enlace copiado", "Comparte este detalle");
    }
  }, [product]);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;

    const statusText = isPreventa
      ? BRAND_CONFIG.productCard?.whatsappPreventa ||
        "Quiero consultar este detalle"
      : isOutOfStock
      ? BRAND_CONFIG.productCard?.whatsappRestock ||
        "Quiero saber si pueden preparar nuevamente este detalle"
      : BRAND_CONFIG.productCard?.whatsappDefault ||
        "Hola, quiero enviar este detalle";

    let message = `${statusText}:\n\n`;

    message += `Producto: ${product.title}\n`;
    message += `Código: ${product.id}\n`;
    message += `Precio: S/ ${productPrice.toFixed(2)}\n`;
    message += `Cantidad: ${effectiveQty}\n\n`;

    message += BRAND_CONFIG.checkout.closing;

    const url = `https://wa.me/${BRAND_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
  }, [product, productPrice, effectiveQty, isPreventa, isOutOfStock]);

  let stockText = "Próximo detalle";
  let stockClass = "product-detail-status-muted";
  let StockIcon = Clock;

  if (product) {
    if (isPreventa) {
      stockText = "Disponible en preventa";
      stockClass = "product-detail-status-preorder";
      StockIcon = Clock;
    } else if (!productPrice || productPrice <= 0 || product.stock === null || product.stock === undefined) {
      stockText = "Disponible pronto";
      stockClass = "product-detail-status-muted";
      StockIcon = Clock;
    } else if (product.stock === 0) {
      stockText = "Agotado temporalmente";
      stockClass = "product-detail-status-danger";
      StockIcon = XCircle;
    } else if (product.stock <= 3) {
      stockText = `Últimos disponibles: ${product.stock}`;
      stockClass = "product-detail-status-danger";
      StockIcon = AlertTriangle;
    } else if (product.stock <= 10) {
      stockText = "Pocas unidades disponibles";
      stockClass = "product-detail-status-warning";
      StockIcon = AlertTriangle;
    } else {
      stockText = "Disponible para sorprender hoy";
      stockClass = "product-detail-status-success";
      StockIcon = CheckCircle;
    }
  }

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="product-detail-empty">
        <p>Detalle no encontrado</p>
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
            <div>
              <p className="product-detail-kicker">Detalle especial</p>

              <h2 className="product-detail-title">{product.title}</h2>

              <p className="product-detail-description">
                {product.description ||
                  "Un detalle pensado para sorprender, emocionar y hacer que ese momento se sienta especial."}
              </p>
            </div>

            <div className="product-detail-meta-row">
              <div className={`product-detail-status ${stockClass}`}>
                <StockIcon className="w-4 h-4" />
                <span>{stockText}</span>
              </div>

              {available && (
                <div className="product-detail-viewers">
                  {viewers} personas viendo este detalle
                </div>
              )}
            </div>

            <div className="product-detail-price-box">
              <p>Precio</p>

              <div className="product-detail-price">
                <span>S/</span>
                <strong>{productPrice.toFixed(2)}</strong>
              </div>

              {effectiveQty > 1 && (
                <small>
                  Total del pedido: <strong>S/ {total.toFixed(2)}</strong>
                </small>
              )}

              {!isQtyInputValid && (
                <small className="product-detail-error">
                  Ingresa una cantidad válida para continuar
                </small>
              )}
            </div>

            {available && (
              <div className="product-detail-qty-block">
                <p>Cantidad</p>

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
                      ? `Agregar al pedido — S/ ${total.toFixed(2)}`
                      : "Ingresa una cantidad"}
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
                    ? "Consultar por WhatsApp"
                    : isOutOfStock
                    ? "Consultar disponibilidad"
                    : "Pedir por WhatsApp"}
                </span>
              </button>
            </div>

            <div className="product-detail-note">
              <p>{BRAND_CONFIG.modal.questionTitle}</p>
              <small>{BRAND_CONFIG.modal.questionDescription}</small>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="product-detail-related">
            <h3>Más ideas para regalar</h3>

            <div className="product-detail-related-grid">
              {related.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  cart={cart}
                  onAddToCart={(item) => {
                    addToCart(item, 1);
                    showNotification("Agregado al pedido", item.title);
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