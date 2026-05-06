import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { fetchProducts } from "@/lib/products";
import { searchProducts } from "@/lib/search";
import { sortByCommercialPriority } from "@/lib/sort";
import { Product } from "@/types/product";
import { BRAND_CONFIG } from "@/config/brand";

import { CountdownTimer } from "@/components/CountdownTimer";
import { HeaderBar } from "@/components/HeaderBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { FloatingButtons } from "@/components/FloatingButtons";
import { RecentActivity } from "@/components/RecentActivity";
import { ImageZoomModal } from "@/components/ImageZoomModal";
import { AddToCartModal } from "@/components/AddToCartModal";
import { CatalogSkeleton } from "@/components/skeletons/CatalogSkeleton";

const TOP_PRIORITY = 100;
const STRONG_PRIORITY = 80;
const HIGHLIGHT_PRIORITY = 50;

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const navigate = useNavigate();

  const {
    cart,
    addToCart,
    totalItems,
    totalPrice,
    savings,
    removeFromCart,
    changeQty,
    setExactQty,
    setItemNote,
    clearCart,
  } = useCart();

  useEffect(() => {
    fetchProducts().then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const handleCategorySelect = useCallback(
    (id: string) => {
      if (id === "todas") {
        navigate("/catalogo");
      } else {
        navigate(`/catalogo/categoria.html?cat=${encodeURIComponent(id)}`);
      }
    },
    [navigate]
  );

  const handleAddToCart = useCallback(
    (p: Product) => {
      addToCart(p, 1);
      setSelectedProduct(p);
      setAddModalOpen(true);
    },
    [addToCart]
  );

  const handleAddExtra = useCallback(
    (qty: number) => {
      if (!selectedProduct || qty <= 0) return;
      addToCart(selectedProduct, qty);
    },
    [addToCart, selectedProduct]
  );

  const currentQtyInCart = selectedProduct
    ? cart.find((item) => item.id === selectedProduct.id)?.qty ?? 0
    : 0;

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim();

    if (activeCategory === "todas") {
      return term ? searchProducts(products, term) : products;
    }

    const categoryProducts = products.filter((p) => p.category === activeCategory);

    if (!term) return categoryProducts;

    const inside = searchProducts(categoryProducts, term);

    if (inside.length > 0) return inside;

    return searchProducts(products, term);
  }, [products, activeCategory, searchQuery]);

  const showPriorityBlocks = activeCategory === "todas" && !searchQuery.trim();

  const topProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];

    return sortByCommercialPriority(
      products.filter((p) => (p.priority || 0) >= TOP_PRIORITY)
    );
  }, [products, showPriorityBlocks]);

  const strongProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];

    return sortByCommercialPriority(
      products.filter(
        (p) =>
          (p.priority || 0) >= STRONG_PRIORITY &&
          (p.priority || 0) < TOP_PRIORITY
      )
    );
  }, [products, showPriorityBlocks]);

  const highlightProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];

    return sortByCommercialPriority(
      products.filter(
        (p) =>
          (p.priority || 0) >= HIGHLIGHT_PRIORITY &&
          (p.priority || 0) < STRONG_PRIORITY
      )
    );
  }, [products, showPriorityBlocks]);

  const regularProducts = useMemo(() => {
    if (!showPriorityBlocks) return sortByCommercialPriority(filteredProducts);

    return sortByCommercialPriority(
      filteredProducts.filter((p) => (p.priority || 0) < HIGHLIGHT_PRIORITY)
    );
  }, [filteredProducts, showPriorityBlocks]);

  const renderGrid = (items: Product[]) => (
    <div className="catalog-grid">
      {items.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          cart={cart}
          onAddToCart={handleAddToCart}
          onImageClick={(src, title) => setZoomImage({ src, title })}
        />
      ))}
    </div>
  );

  if (loading) return <CatalogSkeleton />;

  return (
    <div className="catalog-page">
      <header className="catalog-sticky-header">
        <CountdownTimer />
        <HeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          products={products}
        />
      </header>

      <main className="catalog-main">
        <section className="catalog-hero">
          <p className="catalog-kicker">Catálogo Gleemour</p>
          <h1>Elige el detalle perfecto</h1>
          <p>
            Encuentra regalos listos para sorprender, agradecer, celebrar o decir eso que a veces cuesta poner en palabras.
          </p>
        </section>

        <CategoryFilter
          categories={BRAND_CONFIG.categories}
          active={activeCategory}
          onSelect={handleCategorySelect}
        />

        {filteredProducts.length === 0 ? (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">
              <SearchX className="w-10 h-10" />
            </div>
            <p>Sin resultados</p>
            <small>Prueba con otra palabra o elige una categoría emocional.</small>
          </div>
        ) : (
          <div className="catalog-sections">
            {showPriorityBlocks && topProducts.length > 0 && (
              <section className="catalog-section">
                <div className="catalog-section-header">
                  <h2>Favoritos para sorprender hoy</h2>
                  <p>Detalles con mayor intención de compra. Bonitos, rápidos y sin drama logístico.</p>
                </div>
                {renderGrid(topProducts)}
              </section>
            )}

            {showPriorityBlocks && strongProducts.length > 0 && (
              <section className="catalog-section">
                <div className="catalog-section-header">
                  <h2>Recomendados por ocasión</h2>
                  <p>Opciones pensadas para elegir rápido según el momento.</p>
                </div>
                {renderGrid(strongProducts)}
              </section>
            )}

            {showPriorityBlocks && highlightProducts.length > 0 && (
              <section className="catalog-section">
                <div className="catalog-section-header">
                  <h2>Ideas bonitas para regalar</h2>
                  <p>Detalles con ese punto emocional que convierte un día normal en historia.</p>
                </div>
                {renderGrid(highlightProducts)}
              </section>
            )}

            {regularProducts.length > 0 && (
              <section className="catalog-section">
                <div className="catalog-section-header">
                  <h2>{showPriorityBlocks ? "Todo el catálogo" : "Resultados"}</h2>
                  <p>
                    {showPriorityBlocks
                      ? "Explora todos los detalles disponibles."
                      : "Detalles encontrados según tu búsqueda."}
                  </p>
                </div>
                {renderGrid(regularProducts)}
              </section>
            )}
          </div>
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
        onClearCart={clearCart}
      />

      <ImageZoomModal
        src={zoomImage?.src ?? null}
        title={zoomImage?.title ?? ""}
        onClose={() => setZoomImage(null)}
      />

      <AddToCartModal
        open={addModalOpen}
        product={selectedProduct}
        currentQty={currentQtyInCart}
        onClose={() => setAddModalOpen(false)}
        onAddExtra={handleAddExtra}
        onOpenCart={() => {
          setAddModalOpen(false);
          setCartOpen(true);
        }}
      />
    </div>
  );
};

export default Index;