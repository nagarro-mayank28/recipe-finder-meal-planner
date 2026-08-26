# Recipe Finder & Meal Planner

A recipe discovery and weekly meal-planning app built with **Svelte 5**, **SvelteKit** and a **StencilJS** component library that is published to npm and consumed from the registry.

| | |
| --- | --- |
| **Live app** | _TBD — Vercel URL_ |
| **npm package** | https://www.npmjs.com/package/@mayank_singh28/recipe-ui-kit |
| **GitHub repo** | https://github.com/nagarro-mayank28/recipe-finder-meal-planner |
| **Recipe data** | [TheMealDB](https://www.themealdb.com) (free, no API key) |

---

## What it does

**Recipe discovery** — Search TheMealDB by name and narrow results by category and cuisine. Search state lives in the URL (`/?q=chicken&category=Chicken`), so results are server-rendered, shareable and survive a refresh.

**Recipe details** — A dedicated page per recipe with the full ingredient list, numbered instructions, tags, and links to the original source and video.

**Recipe management** — Create, edit and delete your own recipes, with validation on every field before saving. Your recipes live alongside API recipes everywhere in the app: they can be favourited, planned, and opened at the same `/recipes/<id>` route.

**Favourites** — Save any recipe with one tap; a live count sits in the nav.

**Weekly meal planner** — A 7-day × 3-meal grid. Assign recipes from your favourites, your own recipes, or a fresh search; replace or remove any planned meal.

---

## Setup

Requires **Node 20.19+ or 22.12+** (SvelteKit 2 / Vite 8) and npm 10+.

```bash
git clone https://github.com/nagarro-mayank28/recipe-finder-meal-planner.git
cd recipe-app
npm install
```

`npm install` pulls the component library from npm — nothing needs to be built or linked from source.

### Starting the development server

```bash
npm run dev
```

The app is served at **http://localhost:5173**. Add `-- --open` to open a browser automatically.

### Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot module reload |
| `npm run build` | Production build (Vercel adapter) |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check with `svelte-check` — currently 0 errors, 0 warnings |

> Verify a change against `npm run preview`, not just `npm run dev`. Bundled and unbundled builds resolve the web components differently, and one class of failure only appears in the production build — see [Consuming the Stencil library](#consuming-the-stencil-library).

---

## Consuming the Stencil library

The app never imports component source. It depends on the published package:

```jsonc
// package.json
"dependencies": {
  "@mayank_singh28/recipe-ui-kit": "^1.0.0"
}
```

### Registration

`src/lib/stencil/define.ts` registers all eight tags once, on the client:

```ts
import('@mayank_singh28/recipe-ui-kit/components/rk-recipe-card');
// …one per component
```

Called from the root layout's `onMount`. Two decisions worth knowing about:

**Why `components/*` and not `/loader`.** The package ships both. `/loader` is the lazy build: it registers the tags, then fetches each component's code from a sibling `rk-*.entry.js` file resolved relative to the loader's own URL. Under a bundler that breaks — Vite emits the loader as a hashed chunk and never emits the `.entry.js` files, so the tags upgrade but render nothing. It works in `npm run dev` (Vite serves the package as-is) and fails in `npm run build`. The `components/*` modules are self-contained and self-registering, so the bundler can follow them normally — and they tree-shake.

**Why the imports are dynamic and browser-guarded.** Each component module subclasses `HTMLElement` at module scope, which does not exist during server rendering.

### Passing data in — props

Primitive props are plain attributes, in the **kebab-case** form Stencil observes:

```svelte
<rk-recipe-card recipe-id={recipe.id} name={recipe.name} favorite={favorites.has(recipe.id)} />
```

The kebab form matters. Svelte writes values on an unknown element with `setAttribute` until the element has been upgraded, and HTML lowercases attribute names — so `recipeId={…}` is serialised as `recipeid`, while Stencil observes `recipe-id`. The prop would silently never arrive, and the server-rendered markup would be wrong. `src/lib/stencil/elements.d.ts` derives the kebab names from Stencil's own published interfaces, so `svelte-check` catches a wrong prop name.

Object and array props cannot survive an attribute at all. Those go through the `ceProps` action (`src/lib/stencil/ceProps.ts`), which waits for `customElements.whenDefined` and then assigns a real property:

```svelte
<rk-filter-select name="category" use:ceProps={{ options: categoryOptions }} />
```

Waiting matters in both directions: assign too early and the value becomes an own property that permanently shadows the accessor Stencil installs on the prototype.

### Handling events out

Stencil emits camelCase events; Svelte 5's `on<EventName>` attribute preserves the case, so they bind directly with no adapter and no deprecated `on:` directive:

```svelte
<rk-recipe-card
	onrkFavoriteToggle={(event) => favorites.toggle(event.detail)}
	onrkOpen={(event) => goto(`/recipes/${event.detail}`)}
/>
```

Handlers act on `event.detail` — the state the component *asked* for — rather than flipping the app's own copy, so a double-fired event cannot undo itself.

### Slots

| Component | Slot | Used for |
| --- | --- | --- |
| `rk-search-bar` | `filters` | Category and cuisine dropdowns, inside the search surface |
| `rk-recipe-card` | `meta` | Category / cuisine / "in your week" badges |
| `rk-recipe-card` | `actions` | Owner-only Edit / Delete, and "+ Plan" |
| `rk-modal` | default, `footer` | Dialog body and its action row |
| `rk-ingredient-list` | `header` | Ingredient-count badge |
| `rk-meal-slot` | default | "Yours" badge on user recipes |
| `rk-empty-state` | default | The call-to-action button |

---

## Architecture

```
src/
  lib/
    api/mealdb.ts            typed TheMealDB client + normalisation
    components/              app-level Svelte components (form, dialogs)
    stencil/
      define.ts              registers the custom elements
      ceProps.ts             assigns object props as real properties
      elements.d.ts          types the <rk-*> tags for svelte-check
    stores/
      persisted.svelte.ts    generic $state mirrored into localStorage
      favorites.svelte.ts    favourites
      userRecipes.svelte.ts  user recipe CRUD
      mealPlan.svelte.ts     the weekly plan
    types.ts                 domain types
    validation.ts            form rules (no Svelte, no browser APIs)
  routes/
    +page.svelte             discovery          (SSR)
    recipes/[id]/            details            (SSR for API recipes)
    favorites/               favourites         (client-only)
    my-recipes/              list, new, [id]/edit  (client-only)
    planner/                 weekly planner     (client-only)
```

### State

Svelte 5 runes, no store library. Each domain gets a class holding a `$state` field mirrored into `localStorage` by `Persisted`, exported as a module-level singleton — so the nav's favourite count and a card's heart icon stay in sync with no wiring.

Reads are defensive: a `revive` function per store drops entries that no longer match the current shape, because hand-edited or stale JSON should not white-screen the app. Writes are defensive too — Safari private mode and a full quota both throw on `setItem`, and losing persistence beats losing the session.

### Rendering strategy

| Route | Rendering | Why |
| --- | --- | --- |
| `/`, `/recipes/<numeric-id>` | SSR | Data comes from the API — server-renderable, indexable, shareable |
| `/favorites`, `/my-recipes`, `/planner`, `/recipes/user-…` | `ssr = false` | Data lives only in `localStorage`; SSR would render an empty state and then flash the real content in |

### TheMealDB quirks handled at the boundary

- **`{ "meals": null }` for no results** rather than an empty array or a 404 — every response is null-guarded.
- **`strIngredient1…20` / `strMeasure1…20` columns** are collapsed into an `Ingredient[]`.
- **No endpoint combines a search term with filters.** `discoverRecipes` picks the cheapest upstream call and narrows the rest in memory; category + cuisine together means two parallel `filter.php` calls intersected by id.
- **`filter.php` returns only id/name/thumbnail**, so list results are typed `RecipeSummary` and only `getRecipe` returns a full `Recipe`.
- **The cuisine list contains a duplicate** ("Channel Islander" twice), which breaks keyed `{#each}` blocks — de-duplicated in `listAreas`.

---

## Assumptions made

1. **No backend or authentication.** The assignment asked for a frontend, so favourites, user recipes and the meal plan are per-browser `localStorage` state. There is one implicit anonymous user. Clearing site data resets everything, and nothing syncs across devices.
2. **TheMealDB over Spoonacular.** It needs no API key, so the deployed app has no secret to leak or rate limit to hit while it is being assessed. The trade-off is no nutrition data and no diet filters.
3. **User recipes are not part of API discovery.** The discovery page queries TheMealDB only; "My recipes" has its own filter. Mixing a `localStorage` list into a server-rendered page would mean either giving up SSR or a hydration mismatch on the first paint.
4. **Only user-created recipes are editable or deletable.** API recipes have no owner, so `/my-recipes/<id>/edit` returns 403 for a non-user id. User ids are prefixed `user-` to guarantee they never collide with TheMealDB's numeric ids.
5. **One meal plan, one week.** The planner is a single Monday–Sunday grid with breakfast / lunch / dinner, not a dated calendar — so it never needs rolling over or archiving.
6. **Ingredient measures are free text** (`"200 g"`, `"2 tbsp"`), matching TheMealDB's own format rather than a parsed quantity + unit.
7. **Instructions are newline-separated steps.** TheMealDB stores one text blob; the details page splits on newlines and strips any leading "1." or "STEP 2" the source already included.
8. **Ticking an ingredient is not persisted.** It is a transient shopping aid within one page visit.
9. **English only**, and no dark theme — both are reachable through the library's `--rk-*` tokens but were out of scope.

---

## Testing

The component library carries its own tests, run in a real browser via Playwright:

```bash
cd ../recipe-ui-kit && npm test     # 9 passing
```

The app is type-checked with `npm run check` (0 errors, 0 warnings). During development every functional requirement was also walked through in a headless browser against both the dev server and the production build — discovery, filtering, details, favourites, the full create/edit/delete cycle with validation, planner assign/remove, persistence across reloads, and the 404 path.

---

## Deployment

Deployed on Vercel with `@sveltejs/adapter-vercel`. The adapter is named explicitly rather than using `adapter-auto`, so a local `npm run build` produces the same output as CI.

Because this repository holds both projects, Vercel's **Root Directory** must be set to `recipe-app`.

No environment variables are needed.

---

## Licence

MIT
