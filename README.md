# Bistro Digital - Landing de Menu y Ruteo

## Identificacion

Proyecto: **Bistro Digital - Menu Landing y Router**  
Modalidad: **trabajo individual**  
Repositorio publico: https://github.com/gfertonani535/App-restaurante

## Descripcion tecnica

Bistro Digital es la base frontend de una carta digital mobile-first para restaurantes. Esta etapa resuelve la presentacion estatica del menu principal y suma una arquitectura de ruteo SPA con React Router DOM, permitiendo validar flujos de navegacion antes de avanzar con logica de negocio, pedidos o administracion.

El perfil de usuario principal es el comensal que consulta productos desde un dispositivo movil dentro del restaurante. La interfaz prioriza lectura rapida, contraste alto, tarjetas con fotografia gastronomica y navegacion inferior simple.

## Alcance de esta entrega

- Landing page del menu digital basada en la maqueta provista.
- Header fijo, hero de bienvenida, filtro horizontal de categorias, cards de productos y bottom navigation.
- Design System basado en Tailwind CSS y componentes estilo shadcn/ui.
- Catalogo conectado a Supabase para categorias, productos y menu publico.
- Router SPA con rutas estaticas, rutas dinamicas y layout anidado de administracion.
- Componentes de pagina representativos para cada ruta identificada en el prototipo.
- Backoffice unificado bajo `AdminLayout` con sidebar unico para Dashboard, Cierre de Caja, Ordenes, Productos y Settings.

## Arquitectura

```txt
public/
  favicon.svg           # Favicon servido por Vite desde la raiz publica
src/
  assets/
    hero-menu.jpg       # Recurso visual reservado para el hero
    productos/          # Fotografias locales de productos
  components/
    backoffice/         # Sidebar unico y contenido interno del backoffice
    common/             # Bloques compartidos de bajo acoplamiento
    landing/            # Secciones propias de la landing
    layouts/            # Estructuras generales de pantalla
    navbar/             # Navegacion superior e inferior
    products/           # Componentes de producto, incluido CardProducts.jsx
    ui/                 # Componentes base estilo shadcn/ui
  lib/                  # Utilidades compartidas
  pages/                # Paginas renderizables de la app y backoffice
  services/             # Acceso centralizado a Supabase
  utils/                # Helpers de imagenes y resolucion publica
  App.jsx               # Composicion principal
  index.css             # Tailwind, tokens y estilos globales
  main.jsx              # Entrada de React
  routes.jsx            # Punto central de rutas de la aplicacion
```

La organizacion separa datos publicos, assets, layout, navegacion, componentes de producto, componentes UI y paginas. El archivo `src/routes.jsx` concentra el mapa de navegacion con `BrowserRouter`, `Routes`, `Route`, `Navigate`, rutas anidadas y parametros de URL.

El menu publico se mantiene separado en `AppShell`. Todo el backoffice vive bajo `AdminLayout`, que renderiza un unico `BackofficeSidebar`, un header administrativo comun y el contenido dinamico mediante `Outlet`.

La carpeta `dist/` no forma parte del codigo fuente: Vite la genera automaticamente al ejecutar `npm run build` como salida de produccion. Por eso esta ignorada por Git y puede borrarse sin perder trabajo.

## Deploy SPA

`vercel.json` redirige las rutas internas al `index.html` para evitar 404 al recargar URLs de React Router en producción.

## Mapa de rutas

| Ruta | Tipo | Vista |
| --- | --- | --- |
| `/` | Redireccion | Redirige a `/menu` |
| `/menu` | Estatica | Landing del menu digital |
| `/cuenta` | Redireccion | Redirige a `/admin/productos` |
| `/account` | Redireccion | Redirige a `/admin/productos` |
| `/producto/:productId` | Dinamica | Detalle futuro de producto |
| `/admin` | Redireccion | Redirige a `/admin/dashboard` |
| `/admin/dashboard` | Estatica | Dashboard backoffice |
| `/admin/cierre-de-caja` | Estatica | Cierre de caja |
| `/admin/cierre-caja` | Redireccion | Alias hacia `/admin/cierre-de-caja` |
| `/admin/pedidos` | Estatica | Ordenes activas |
| `/admin/pedidos/:orderId` | Dinamica | Detalle futuro de pedido |
| `/admin/productos` | Estatica | Catalogo de productos |
| `/admin/productos/nuevo` | Estatica | Alta de producto |
| `/admin/productos/:productId/editar` | Dinamica | Edicion de producto |
| `/admin/settings` | Estatica | Settings |
| `/admin/configuracion` | Redireccion | Alias hacia `/admin/settings` |
| `*` | Fallback | Ruta no encontrada |

## Objetivos alcanzados

- Validar stack React + Vite sin TypeScript.
- Integrar Tailwind CSS v4 como base del sistema visual.
- Incorporar una estructura compatible con shadcn/ui mediante `components.json`, `cn()` y componentes UI versionados en el repositorio.
- Replicar la identidad visual neutral/minimalista de la maqueta.
- Agregar ESLint con configuracion flat para React y JSX.
- Implementar React Router DOM con rutas estaticas, dinamicas y layout anidado para backoffice.
- Preparar parametros `productId` y `orderId` para futura integracion con APIs.
- Mantener la landing del menu enfocada solo en la carta visible para clientes.
- Centralizar sidebar/header administrativo para evitar duplicacion en Ordenes y Productos.

## Tecnologias

- React 19
- Vite
- JavaScript JSX
- Tailwind CSS v4
- shadcn/ui style components
- class-variance-authority
- clsx
- tailwind-merge
- lucide-react
- React Router DOM
- ESLint
- Work Sans

## Instalacion y ejecucion local

```bash
git clone <https://github.com/gfertonani535/App-restaurante>
cd <carpeta-del-proyecto>
npm install
npm run dev
```

Para revisar calidad estatica del codigo:

```bash
npm run lint
```

Para generar una build de produccion:

```bash
npm run build
```

Para previsualizar la build:

```bash
npm run preview
```
