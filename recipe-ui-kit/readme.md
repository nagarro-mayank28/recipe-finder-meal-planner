# @mayank_singh28/recipe-ui-kit

Framework-agnostic web components for recipe discovery and meal-planning UIs, built with [StencilJS](https://stenciljs.com).

Because the output is standard custom elements, the kit works in Svelte, React, Vue, Angular or plain HTML with no wrapper layer. It is consumed by the [Recipe Finder & Meal Planner](https://github.com/nagarro-mayank28/recipe-finder-meal-planner/tree/main/recipe-app) SvelteKit app in the same repository.

- **npm:** https://www.npmjs.com/package/@mayank_singh28/recipe-ui-kit
- **Source:** https://github.com/nagarro-mayank28/recipe-finder-meal-planner
- **8 components**, all shadow-DOM encapsulated
- **Themable** through `--rk-*` CSS custom properties
- **Typed** — Stencil ships `.d.ts` files for every prop and event

---

## Install

```bash
npm install @mayank_singh28/recipe-ui-kit
```

## Usage

### With a bundler (Vite, Rollup, webpack) — recommended

Import the components you need. Each module is self-contained, registers its own tag on import, and tree-shakes:

```js
import '@mayank_singh28/recipe-ui-kit/components/rk-recipe-card';
import '@mayank_singh28/recipe-ui-kit/components/rk-badge';
```

Optionally load the design tokens once, so the kit picks up the shared palette:

```js
import '@mayank_singh28/recipe-ui-kit/tokens.css';
```

> **Do not use `/loader` behind a bundler.** The lazy loader fetches each component from a sibling `rk-*.entry.js` file at runtime, resolved relative to its own URL. A bundler rewrites the loader into a hashed chunk and never emits those files, so tags upgrade but render empty — and only in a production build. Use the `components/*` entry points instead.

### Served as static files (plain HTML, CDN)

Here the lazy loader is the right choice — one small script registers every tag and fetches component code on demand:

```html
<script
	type="module"
	src="https://unpkg.com/@mayank_singh28/recipe-ui-kit/dist/recipe-ui-kit/recipe-ui-kit.esm.js"
></script>
```

Or explicitly, from `node_modules`:

```js
import { defineCustomElements } from '@mayank_singh28/recipe-ui-kit/loader';

defineCustomElements();
```

---

## Passing data in

Primitive props travel as attributes. Stencil kebab-cases multi-word prop names, so use the attribute form in markup:

```html
<rk-recipe-card recipe-id="52772" name="Teriyaki Chicken" favorite="true"></rk-recipe-card>
```

| Prop           | Attribute        |
| -------------- | ---------------- |
| `recipeId`     | `recipe-id`      |
| `hideFavorite` | `hide-favorite`  |
| `actionLabel`  | `action-label`   |

Object and array props (`options`, `items`) cannot be serialised into an attribute, so assign them as **properties**, after the element is defined:

```js
await customElements.whenDefined('rk-filter-select');
document.querySelector('rk-filter-select').options = [{ value: 'Chicken', label: 'Chicken' }];
```

As a convenience for server-rendered markup, both props also accept a JSON string.

---

## Components

| Tag                   | Purpose                                | Key events                                 | Slots              |
| --------------------- | -------------------------------------- | ------------------------------------------ | ------------------ |
| `rk-search-bar`       | Debounced search input                 | `rkSearch`, `rkSearchSubmit`               | `filters`          |
| `rk-filter-select`    | Labelled dropdown filter               | `rkFilterChange`                           | —                  |
| `rk-recipe-card`      | Recipe card with favourite toggle      | `rkFavoriteToggle`, `rkOpen`               | `meta`, `actions`  |
| `rk-ingredient-list`  | Tickable ingredient checklist          | —                                          | `header`           |
| `rk-meal-slot`        | One planner cell, empty or filled      | `rkAssign`, `rkRemove`, `rkOpen`           | default            |
| `rk-modal`            | Controlled accessible dialog           | `rkClose`                                  | default, `footer`  |
| `rk-empty-state`      | Placeholder for empty lists            | —                                          | default            |
| `rk-badge`            | Category / cuisine pill                | —                                          | default            |

Full prop tables live in each component's folder, generated from source on every build — for example [`rk-recipe-card`](https://github.com/nagarro-mayank28/recipe-finder-meal-planner/blob/main/recipe-ui-kit/src/components/rk-recipe-card/readme.md).

### Events

All events bubble and are composed, so a single listener on an ancestor works. Names are camelCase, which is what Stencil emits and what Svelte 5's `on<EventName>` attribute form expects:

```svelte
<rk-recipe-card onrkFavoriteToggle={handleToggle} />
```

```js
element.addEventListener('rkFavoriteToggle', (event) => {
	console.log(event.detail); // { recipeId: '52772', favorite: true }
});
```

---

## Theming

Every component reads its colours and radii through `var(--rk-*, <fallback>)`, so the kit looks correct even without the token stylesheet. Override any token on `:root` to retheme globally, or on a wrapper element to retheme a subtree:

```css
:root {
	--rk-color-primary: #2563eb;
	--rk-color-primary-soft: #eff6ff;
	--rk-radius-lg: 8px;
}
```

Tokens: `--rk-font-sans`, `--rk-color-{surface,surface-alt,border,text,muted,primary,primary-hover,primary-soft,on-primary,danger,danger-soft}`, `--rk-radius-{sm,md,lg,pill}`, `--rk-shadow-{sm,md,lg}`, `--rk-focus-ring`.

---

## Local development

```bash
npm install
npm start          # build + watch + serve the gallery at localhost:3333
npm run build      # production build into dist/ and loader/
npm test           # component tests in a real browser (Playwright)
```

`npm start` serves `src/index.html` — a gallery of every component with a live event log, useful for checking a change without running the full app.

### Project layout

```
src/
  components/<tag>/     one folder per component: .tsx, .css, readme.md, tests
  global/tokens.css     design tokens, emitted as dist/…/recipe-ui-kit.css
  interfaces.ts         public event-payload and data types
  index.ts              package entry point (types only)
  index.html            local gallery
```

### Output targets

| Target                  | Used for                                                        |
| ----------------------- | --------------------------------------------------------------- |
| `dist`                  | the lazy `/loader` entry, for static hosting                     |
| `dist-custom-elements`  | `components/*` entry points, for bundlers — tree-shakeable       |
| `docs-readme`           | keeps each component's readme in sync with its source            |
| `www`                   | the local gallery (not published)                                |

---

## Publishing

```bash
npm run build
npm pack --dry-run          # check what will ship
npm publish                 # access:public is set in publishConfig
```

`prepublishOnly` rebuilds automatically, so `dist/` can never fall behind the source in a published version.

### Versioning

[Semantic versioning](https://semver.org):

- **patch** — bug fix, styling tweak, no contract change
- **minor** — new component, new optional prop, new event
- **major** — renamed or removed prop/event/slot, or changed event payload

Consumers should pin a caret range (`^1.0.0`) so they receive fixes without breaking changes.

## Licence

MIT
