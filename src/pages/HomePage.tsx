import { useEffect, useState } from "react";

import HeroSlider from "../components/home/HeroSlider";
import HomeNav from "@/components/home/HomeNav";
import CategoriesSection from "../components/home/CategoriesSection";
import FeaturedProductsSection from "../components/home/FeaturedProductsSection";
import HowToBuySection from "../components/home/HowToBuySection";
import StatsSection from "../components/home/StatsSection";
import ShippingSection from "../components/home/ShippingSection";
import CorporateSection from "../components/home/CorporateSection";
import BrandStorySection from "../components/home/BrandStorySection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import FinalCTASection from "../components/home/FinalCTASection";
import SocialSection from "../components/home/SocialSection";
import HomeFooter from "../components/home/HomeFooter";
import LocationSection from "../components/home/LocationSection";

import { FloatingButtons } from "@/components/FloatingButtons";
import { CartItem } from "@/types/product";

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadCart = () => {
    const storedCart = localStorage.getItem("wooly_cart");

    if (!storedCart) {
      setCart([]);
      return;
    }

    try {
      setCart(JSON.parse(storedCart));
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();

    const handleStorage = () => {
      loadCart();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadCart);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadCart);
    };
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const handleCartClick = () => {
    window.location.href = "/catalogo";
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-clip">
      <HeroSlider />

      <HomeNav cartCount={cartCount} onCartClick={handleCartClick} />

      <CategoriesSection />
      {/* <FeaturedProductsSection /> */}
      <HowToBuySection />
      <CorporateSection />
      <StatsSection />
      <ShippingSection />
      <LocationSection />
      <BrandStorySection />
      <TestimonialsSection />
      <FinalCTASection />
      <SocialSection />
      <HomeFooter />

      <FloatingButtons
        cartCount={cartCount}
        onCartClick={handleCartClick}
        variant="home"
      />
    </div>
  );
}