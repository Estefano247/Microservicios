# Librería Frontend

Frontend de la tienda online de libros, construido con **React 19 + Vite 8 + Tailwind CSS 4**.

## Características

- Catálogo de productos con búsqueda y filtrado por categorías
- Carrito de compras (sidebar lateral) con soporte para invitados (localStorage) y usuarios autenticados (API)
- Detalle de producto con descripción y tipo (Físico, Digital, Audiolibro)
- Autenticación JWT (registro, inicio de sesión)
- Perfil de usuario y gestión de pedidos
- Panel administrativo (gestión de productos, inventario, usuarios, pedidos)
- Diseño responsive con Tailwind CSS

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo (puerto 5173) |
| `npm run build` | Compilar para producción |
| `npm run preview` | Previsualizar compilación |
| `npm run lint` | Ejecutar ESLint |

## API

El frontend se comunica con el backend a través del API Gateway en `/api/v1/`. La configuración del proxy se define en `vite.config.js` para desarrollo.
