import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import HomePage from "@/pages/HomePage";
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";
import ProductDetail from "@/pages/ProductDetail";
import NotFound from "@/pages/NotFound";

/* =========================================================
   GLOBAL SHORTCUTS
========================================================= */

function AppShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBackNavigation = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "Backspace" && !isTyping) {
        event.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleBackNavigation);

    return () => {
      window.removeEventListener(
        "keydown",
        handleBackNavigation
      );
    };
  }, [navigate]);

  return null;
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppShortcuts />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/catalogo" element={<Index />} />

        <Route
          path="/catalogo/categoria.html"
          element={<CategoryPage />}
        />

        <Route
          path="/catalogo/producto.html"
          element={<ProductDetail />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}