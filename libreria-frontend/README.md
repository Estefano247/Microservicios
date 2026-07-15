# Librería Frontend

Frontend de la tienda online de libros, construido con **React 19 + Vite 8 + Tailwind CSS 4**.

## Características

- Catálogo de productos con búsqueda y filtrado por categorías
- Carrito de compras (sidebar lateral) con soporte para invitados (localStorage) y usuarios autenticados (API)
- Detalle de producto con descripción y tipo (Físico, Digital, Audiolibro)
- Autenticación JWT (registro, inicio de sesión)
- Perfil de usuario y gestión de pedidos
- Panel administrativo con layout de barra lateral (productos, inventario, usuarios, pedidos)
- Diseño responsive con Tailwind CSS

## Sistema de diseño

La interfaz sigue una identidad visual **editorial y cálida**, coherente en toda la app:

- **Paleta**: fondo tipo papel, verde bosque como color de marca y ámbar como acento (precios y llamados a la acción). Definida con tokens en `@theme` dentro de `src/index.css`.
- **Tipografía**: `Fraunces` (serif de display) para títulos e `Inter` para la interfaz.
- **Primitivos reutilizables** en `src/components/ui/`: `Button`, `Icon`, `Loader`, `EmptyState`, `Pagination`.
- **Clases de componente** (`.btn`, `.input`, `.card`, `.badge`, `.chip`) para mantener consistencia y evitar repetición.
- **Constantes compartidas** en `src/constants/catalog.js` (categorías, tipos, estados de pedido y formato de precio).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo (puerto 5173) |
| `npm run build` | Compilar para producción |
| `npm run preview` | Previsualizar compilación |
| `npm run lint` | Ejecutar ESLint |

## API

El frontend se comunica con el backend a través del API Gateway en `/api/v1/`. La configuración del proxy se define en `vite.config.js` para desarrollo.
