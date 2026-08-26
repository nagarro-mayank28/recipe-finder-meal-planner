/**
 * @fileoverview Public entry point for the Recipe UI Kit.
 *
 * Only types and helpers live here. Components are registered as custom
 * elements - import `defineCustomElements` from `<package>/loader` (lazy, whole
 * kit) or a single component from `<package>/components/<tag>.js` (tree-shaken).
 * See the README for both patterns.
 */

// Data contracts for the values hosts pass into the components.
export type {
  RkFavoriteToggleDetail,
  RkFilterChangeDetail,
  RkFilterOption,
  RkIngredient,
  RkMealSlotDetail,
} from './interfaces';

// Generated element + prop interfaces, e.g. `HTMLRkRecipeCardElement`.
export type * from './components.d.ts';
