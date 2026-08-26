/**
 * Domain types for the app.
 *
 * TheMealDB returns a wide, flat record with `strIngredient1…20` columns. We
 * normalise it at the API boundary (`$lib/api/mealdb.ts`) into the shapes below
 * so recipes fetched from the API and recipes created by the user are
 * interchangeable everywhere else in the app.
 */

/** Where a recipe came from. Drives whether it can be edited or deleted. */
export type RecipeOrigin = 'mealdb' | 'user';

export interface Ingredient {
	name: string;
	/** Free-form measure, e.g. `"200 g"`. */
	measure?: string;
}

/**
 * The light shape used in grids. TheMealDB's `filter.php` endpoint returns only
 * these fields, so anything richer would be a lie for filtered results.
 */
export interface RecipeSummary {
	id: string;
	name: string;
	thumbnail: string;
	origin: RecipeOrigin;
	category?: string;
	area?: string;
}

/** The full shape used on the details page. */
export interface Recipe extends RecipeSummary {
	category: string;
	area: string;
	instructions: string;
	ingredients: Ingredient[];
	tags: string[];
	youtube?: string;
	source?: string;
}

/** A recipe authored in the app and persisted locally. */
export interface UserRecipe extends Recipe {
	origin: 'user';
	/** ISO timestamp, used to sort "My recipes" newest-first. */
	createdAt: string;
	updatedAt: string;
}

/* ------------------------------------------------------------------ *
 * Meal planner
 * ------------------------------------------------------------------ */

export const DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
] as const;

export type Day = (typeof DAYS)[number];

export const MEALS = ['breakfast', 'lunch', 'dinner'] as const;

export type Meal = (typeof MEALS)[number];

/** The minimum we cache per planned meal so the planner renders without refetching. */
export interface PlannedMeal {
	recipeId: string;
	name: string;
	thumbnail: string;
	origin: RecipeOrigin;
}

/**
 * Sparse map of `day -> meal -> PlannedMeal`. Empty slots are simply absent,
 * which keeps the persisted JSON small.
 */
export type MealPlan = Partial<Record<Day, Partial<Record<Meal, PlannedMeal>>>>;

/** Title-cased label for a day or meal key. */
export function titleCase(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
