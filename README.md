# Bistro Digital - Landing de Menu

## Identificacion

Proyecto: **Bistro Digital - Menu Landing**  
Modalidad: **trabajo individual**  
Repositorio publico: github:giulianofertonani

## Descripcion tecnica

Bistro Digital es la base frontend de una carta digital mobile-first para restaurantes. Esta primera etapa resuelve la presentacion estatica del menu principal, permitiendo validar identidad visual, arquitectura de componentes y consistencia UI antes de avanzar con logica de negocio, pedidos o administracion.

El perfil de usuario principal es el comensal que consulta productos desde un dispositivo movil dentro del restaurante. La interfaz prioriza lectura rapida, contraste alto, tarjetas con fotografia gastronomica y navegacion inferior simple.

## Alcance de esta entrega

- Landing page del menu digital basada en la maqueta provista.
- Header fijo, hero de bienvenida, filtro horizontal de categorias, cards de productos y bottom navigation.
- Design System basado en Tailwind CSS y componentes estilo shadcn/ui.
- Catalogo estatico de componentes reutilizables al final de la landing: botones, input, cards, modal y alertas.
- Datos JSON e imagenes estaticas para validar estructura y presentacion.

## Arquitectura

```txt
data/
  categorias.json       # Categorias visibles en el filtro horizontal
  productos.json        # Productos estaticos de la carta digital
public/
  favicon.svg           # Favicon servido por Vite desde la raiz publica
src/
  assets/
    hero/               # Recurso visual reservado para el hero
    productos/          # Fotografias locales de productos
  components/
    common/             # Bloques compartidos de bajo acoplamiento
    landing/            # Secciones propias de la landing
    layouts/            # Estructuras generales de pantalla
    navbar/             # Navegacion superior e inferior
    products/           # Componentes de producto, incluido CardProducts.jsx
    ui/                 # Componentes base estilo shadcn/ui
  lib/                  # Utilidades compartidas
  pages/                # Paginas renderizables de la app
  App.jsx               # Composicion principal
  index.css             # Tailwind, tokens y estilos globales
  main.jsx              # Entrada de React
  routes.jsx            # Punto central de rutas de la aplicacion
```

La organizacion separa datos, assets, layout, navegacion, componentes de producto y componentes UI. Los datos viven fuera de `src` para mantenerlos desacoplados de la capa visual y facilitar un reemplazo posterior por una API sin reescribir las tarjetas.

La carpeta `dist/` no forma parte del codigo fuente: Vite la genera automaticamente al ejecutar `npm run build` como salida de produccion. Por eso esta ignorada por Git y puede borrarse sin perder trabajo.

## Objetivos alcanzados

- Validar stack React + Vite sin TypeScript.
- Integrar Tailwind CSS v4 como base del sistema visual.
- Incorporar una estructura compatible con shadcn/ui mediante `components.json`, `cn()` y componentes UI versionados en el repositorio.
- Replicar la identidad visual neutral/minimalista de la maqueta.
- Agregar ESLint con configuracion flat para React y JSX.
- Mantener la entrega enfocada unicamente en la pagina principal del menu.

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
- ESLint
- Work Sans

## Instalacion y ejecucion local

```bash
git clone <url-del-repositorio>
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
