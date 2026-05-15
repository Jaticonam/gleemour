# CSS Standards — Gleemour

## Arquitectura General

- `index.css` funciona únicamente como orquestador de imports.
- No escribir clases CSS directamente en `index.css`.
- No importar CSS dentro de componentes React.
- Toda la carga global pasa por `src/index.css`.

---

# Estructura Oficial

## Base

styles/base/

Contiene:

- tokens
- reset/base
- animations
- utilities

---

## Layout

styles/layout/

Contiene estructura global:

- navbar
- layout
- wrappers
- shells

---

## Components

styles/components/

Contiene componentes reutilizables:

- buttons
- cards
- modals
- notifications
- forms
- productcard
- cartsidebar

---

## Sections

styles/sections/

Contiene secciones visuales específicas:

- hero
- categories
- stats
- testimonials
- benefits

---

## Pages

styles/pages/

Contiene estilos exclusivos de páginas completas:

- catalog
- category
- productdetail
- home

---

# Naming Convention

## Componentes

Usar:

```css
.product-card {}
.cart-sidebar {}
.search-input {}