# Recipe Finder & Meal Planner

Assignment solution: a recipe discovery and weekly meal-planning app built with **Svelte 5** and **SvelteKit**, consuming a reusable **StencilJS** web-component library that is published to npm.

| | |
| --- | --- |
| **Live app** | https://recipe-finder-meal-planner-tawny.vercel.app |
| **npm package** | https://www.npmjs.com/package/@mayank_singh28/recipe-ui-kit |
| **Recipe data** | [TheMealDB](https://www.themealdb.com) — free, no API key |

## Repository layout

```
recipe-app/        SvelteKit 2 + Svelte 5 application  →  see recipe-app/README.md
recipe-ui-kit/     StencilJS component library (published to npm)  →  see recipe-ui-kit/readme.md
```

The two are independent npm projects. The app does **not** import the library from source — it depends on the published package, exactly as any other consumer would:

```jsonc
"dependencies": { "@mayank_singh28/recipe-ui-kit": "^1.0.1" }
```

## Quick start

```bash
# the app
cd recipe-app
npm install
npm run dev          # http://localhost:5173

# the component library (only needed to change the components)
cd recipe-ui-kit
npm install
npm start            # component gallery at http://localhost:3333
npm test             # component tests in a real browser
```

Requires Node 20.19+ or 22.12+.

## What's where

| Looking for | Read |
| --- | --- |
| Setup, dev server, assumptions, architecture | [`recipe-app/README.md`](recipe-app/README.md) |
| How SvelteKit consumes the web components (props, events, slots) | [`recipe-app/README.md`](recipe-app/README.md#consuming-the-stencil-library) |
| Component API, theming tokens, publishing and versioning | [`recipe-ui-kit/readme.md`](recipe-ui-kit/readme.md) |
| Per-component prop/event/slot tables | `recipe-ui-kit/src/components/<tag>/readme.md` |

## The eight components

`rk-search-bar` · `rk-filter-select` · `rk-recipe-card` · `rk-ingredient-list` · `rk-meal-slot` · `rk-modal` · `rk-empty-state` · `rk-badge`

All shadow-DOM encapsulated, themable through `--rk-*` CSS custom properties, and typed — Stencil publishes `.d.ts` files that the app reuses so `svelte-check` validates every prop and event payload.

## Deployment

The app deploys to Vercel from this repository. Because both projects live here, Vercel's **Root Directory** setting must point at `recipe-app`. No environment variables are required.

## Licence

MIT
