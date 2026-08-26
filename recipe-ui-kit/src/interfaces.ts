/**
 * Public data contracts for the Recipe UI Kit.
 *
 * These are re-exported from the package root so consuming applications can
 * type the values they hand to the components.
 */

/** A single choice inside `<rk-filter-select>`. */
export interface RkFilterOption {
  /** Machine value emitted on change. */
  value: string;
  /** Human readable text shown in the dropdown. */
  label: string;
}

/** One line of an ingredient list rendered by `<rk-ingredient-list>`. */
export interface RkIngredient {
  /** Ingredient name, e.g. `"Basmati rice"`. */
  name: string;
  /** Free-form measure, e.g. `"200 g"`. Optional. */
  measure?: string;
}

/** Payload emitted when a recipe card's favourite button is pressed. */
export interface RkFavoriteToggleDetail {
  recipeId: string;
  /** The favourite state the host should move to. */
  favorite: boolean;
}

/** Payload emitted when a filter's selection changes. */
export interface RkFilterChangeDetail {
  /** Mirrors the component's `name` prop so one handler can serve many filters. */
  name: string;
  value: string;
}

/** Payload emitted by `<rk-meal-slot>` for assign / remove / open intents. */
export interface RkMealSlotDetail {
  /** Day key, e.g. `"monday"`. */
  day: string;
  /** Meal key, e.g. `"dinner"`. */
  meal: string;
  /** Present when the slot already holds a recipe. */
  recipeId?: string;
}
