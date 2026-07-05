# IlSupremo Ventas

Frontend del modulo de ventas y stock de `IlSupremo`.

Es una SPA construida con `React + Vite + Tailwind` para operar un negocio con foco en:

- ventas
- productos y stock
- dashboard de ventas
- gastos

## Stack

- `React 19`
- `React Router 7`
- `Vite 7`
- `TailwindCSS 3`
- `ESLint 9`

## Modulos

- `/ventas`: punto de venta con carrito y soporte para productos por unidad o por kilo
- `/productos`: alta, edicion y baja de productos
- `/dashboard`: resumen de ventas, filtros por fecha y categoria, paginacion
- `/gastos`: registro y consulta de gastos con comprobante

## Requisitos

- `Node.js 20+` recomendado
- `npm`

## Instalacion

```bash
npm install
```

## Variables De Entorno

Crear un archivo `.env` en la raiz del proyecto.

Ejemplo:

```env
VITE_API_URL=/api
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

Descripcion:

- `VITE_API_URL`: endpoint base del backend. En desarrollo y Netlify se recomienda `/api` para aprovechar el proxy configurado.
- `VITE_CLOUDINARY_CLOUD_NAME`: nombre del cloud de Cloudinary.
- `VITE_CLOUDINARY_UPLOAD_PRESET`: preset unsigned usado para subir imagenes.

## Scripts

- `npm run dev`: levanta el servidor de desarrollo
- `npm run build`: genera la build de produccion en `dist/`
- `npm run preview`: sirve la build localmente
- `npm run lint`: ejecuta ESLint
- `npm run test`: ejecuta la suite de tests una vez
- `npm run test:watch`: ejecuta Vitest en modo watch

## Desarrollo Local

```bash
npm run dev
```

Por defecto Vite queda disponible en `http://localhost:5173`.

## Backend

Este repositorio no incluye backend propio.

El frontend consume un `Google Apps Script` que expone acciones HTTP. La capa centralizada vive en `src/api.js`.

Acciones usadas actualmente:

- `products`
- `product_upsert`
- `product_delete`
- `sale_create`
- `sales`
- `expense_create`
- `expenses`

## Cloudinary

La subida de imagenes se centraliza en `src/lib/cloudinary.js`.

Usos actuales:

- productos: carpeta `ilsupremo/productos`
- gastos: carpeta `ilsupremo/gastos`

## Proxy Y Deploy

### Vite

En desarrollo, `vite.config.js` redirige `/api` al backend remoto de Google Apps Script.

### Netlify

El proyecto incluye configuracion para deploy en Netlify:

- build command: `npm run build`
- publish directory: `dist`
- redirects en `netlify.toml`
- fallback SPA en `public/_redirects`

## Estructura

```text
src/
  api.js
  components/
    products/
    sales/
  hooks/
  layout/
  lib/
  pages/
  uploadCloudinary.js
```

Descripcion rapida:

- `src/api.js`: acceso al backend
- `src/pages/`: pantallas principales
- `src/components/products/`: UI reutilizable de productos
- `src/components/sales/`: UI reutilizable de ventas
- `src/lib/`: utilidades compartidas (`format`, `date`, `ui`, `cloudinary`)
- `src/layout/`: shell de la aplicacion y navegacion

## Estado Actual

- navegacion con `sidebar` en desktop y drawer en mobile
- API centralizada para productos, ventas y gastos
- helpers compartidos para formato, fechas y UI
- componentes grandes parcialmente divididos
- base de tests montada con `Vitest`

## Verificacion Manual Recomendada

Antes de publicar cambios, revisar al menos:

1. crear una venta
2. crear y editar un producto
3. registrar un gasto con comprobante
4. filtrar dashboard por fecha y categoria
5. probar mobile y desktop

## Deuda Tecnica Pendiente

- documentar contrato completo del backend
- agregar tests de utilidades y capa API
- extender tests a flujos de interfaz y pantallas criticas
- seguir reduciendo complejidad de `Sales.jsx`
- limpieza final de detalles visuales y consistencia de UX
