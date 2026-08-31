/**
 * Thin client for TheMealDB (https://www.themealdb.com/api.php).
 *
 * Two things to know about the upstream API shape:
 *
 * 1. It answers "nothing found" with `{ "meals": null }` rather than an empty
 *    array or a 404, so every response needs a null guard.
 * 2. `filter.php` returns *only* id/name/thumbnail, while `search.php` and
 *    `lookup.php` return full records. Callers therefore get `RecipeSummary`
 *    from list operations and `Recipe` only from `getRecipe`.
 *
 * Every function takes an optional `fetch`. Pass SvelteKit's version from
 * `load` so requests are server-rendered and de-duplicated during hydration.
 */

import type { Ingredient, Recipe, RecipeSummary } from '$lib/types';

/** `1` is TheMealDB's documented public development key - no signup needed. */
const BASE = 'https://www.themealdb.com/api/json/v1/1';

type Fetch = typeof globalThis.fetch;

/** Raw meal record as returned by TheMealDB. Indexed access covers strIngredientN. */
interface RawMeal extends Record<string, string | null | undefined> {
	idMeal: string;
	strMeal: string;
	strMealThumb: string;
}

/** Thrown for network or non-2xx failures so `load` can surface a real message. */
export class MealDbError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'MealDbError';
	}
}

async function request<T>(path: string, fetchFn: Fetch): Promise<T> {
	let response: Response;

	try {
		response = await fetchFn(`${BASE}${path}`);
	} catch (cause) {
		throw new MealDbError('Could not reach TheMealDB. Check your connection and try again.', {
			cause
		});
	}

	if (!response.ok) {
		throw new MealDbError(`TheMealDB responded with ${response.status} ${response.statusText}.`);
	}

	return (await response.json()) as T;
}

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

/** Collapse `strIngredient1…20` / `strMeasure1…20` into a tidy array. */
function toIngredients(raw: RawMeal): Ingredient[] {
	const ingredients: Ingredient[] = [];

	for (let i = 1; i <= 20; i++) {
		const name = raw[`strIngredient${i}`]?.trim();
		// Upstream pads unused columns with "" or null; both mean "no ingredient".
		if (!name) continue;

		const measure = raw[`strMeasure${i}`]?.trim();
		ingredients.push(measure ? { name, measure } : { name });
	}

	return ingredients;
}

function toSummary(raw: RawMeal): RecipeSummary {
	return {
		id: raw.idMeal,
		name: raw.strMeal,
		thumbnail: raw.strMealThumb,
		origin: 'mealdb',
		...(raw.strCategory ? { category: raw.strCategory } : {}),
		...(raw.strArea ? { area: raw.strArea } : {})
	};
}

function toRecipe(raw: RawMeal): Recipe {
	return {
		id: raw.idMeal,
		name: raw.strMeal,
		thumbnail: raw.strMealThumb,
		origin: 'mealdb',
		category: raw.strCategory ?? 'Uncategorised',
		area: raw.strArea ?? 'Unknown',
		instructions: raw.strInstructions ?? '',
		ingredients: toIngredients(raw),
		tags:
			raw.strTags
				?.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean) ?? [],
		...(raw.strYoutube ? { youtube: raw.strYoutube } : {}),
		...(raw.strSource ? { source: raw.strSource } : {})
	};
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

/** Full-text search on recipe name. Returns `[]` when nothing matches. */
export async function searchRecipes(
	query: string,
	fetchFn: Fetch = fetch
): Promise<RecipeSummary[]> {
	const data = await request<{ meals: RawMeal[] | null }>(
		`/search.php?s=${encodeURIComponent(query)}`,
		fetchFn
	);
	return (data.meals ?? []).map(toSummary);
}

/**
 * Recipes in a category or cuisine. Note the light payload: results carry no
 * category/area of their own, so we stamp on the value we filtered by.
 */
export async function filterRecipes(
	kind: 'category' | 'area' | 'ingredient',
	value: string,
	fetchFn: Fetch = fetch
): Promise<RecipeSummary[]> {
	const param = { category: 'c', area: 'a', ingredient: 'i' }[kind];
	const data = await request<{ meals: RawMeal[] | null }>(
		`/filter.php?${param}=${encodeURIComponent(value)}`,
		fetchFn
	);

	return (data.meals ?? []).map((raw) => ({
		...toSummary(raw),
		...(kind === 'category' ? { category: value } : {}),
		...(kind === 'area' ? { area: value } : {})
	}));
}

/** Full details for one recipe, or `null` when the id is unknown. */
export async function getRecipe(id: string, fetchFn: Fetch = fetch): Promise<Recipe | null> {
	const data = await request<{ meals: RawMeal[] | null }>(
		`/lookup.php?i=${encodeURIComponent(id)}`,
		fetchFn
	);
	const raw = data.meals?.[0];
	return raw ? toRecipe(raw) : null;
}

/** A single random recipe, behind the discovery page's "Surprise me" button. */
export async function randomRecipe(fetchFn: Fetch = fetch): Promise<Recipe | null> {
	const data = await request<{ meals: RawMeal[] | null }>('/random.php', fetchFn);
	const raw = data.meals?.[0];
	return raw ? toRecipe(raw) : null;
}

async function listNames(
	param: 'c' | 'a',
	key: 'strCategory' | 'strArea',
	fetchFn: Fetch
): Promise<string[]> {
	const data = await request<{ meals: Array<Record<string, string>> | null }>(
		`/list.php?${param}=list`,
		fetchFn
	);

	const names = (data.meals ?? []).map((entry) => entry[key]).filter(Boolean);

	// Upstream really does return duplicates here - the area list ships
	// "Channel Islander" twice. Left in place they break keyed `{#each}` blocks
	// and Stencil's vdom, so de-duplicate at the boundary.
	return [...new Set(names)].sort();
}

/** All category names, for the category filter. */
export function listCategories(fetchFn: Fetch = fetch): Promise<string[]> {
	return listNames('c', 'strCategory', fetchFn);
}

/** All cuisine names, for the area filter. */
export function listAreas(fetchFn: Fetch = fetch): Promise<string[]> {
	return listNames('a', 'strArea', fetchFn);
}

/* ------------------------------------------------------------------ *
 * Discovery
 * ------------------------------------------------------------------ */

export interface DiscoverQuery {
	search?: string;
	category?: string;
	area?: string;
}

/**
 * Categories used for the no-query landing grid.
 *
 * Not the full `list.php?c=list` set on purpose: a few upstream categories hold
 * only a handful of recipes, which makes the landing grid look broken. These
 * eight are all well stocked. Browsing the complete set is a click away through
 * the category chips.
 */
const BROWSE_CATEGORIES = [
	'Chicken',
	'Beef',
	'Seafood',
	'Vegetarian',
	'Pasta',
	'Dessert',
	'Breakfast',
	'Lamb'
] as const;

/**
 * Pick the category to land on when the visitor has not asked for anything.
 *
 * Rotating rather than pinning one category means the landing page shows
 * something different each visit, which is the point of browsing. It is chosen
 * in `load`, so the server and the hydrating client agree on the result.
 */
export function pickBrowseCategory(): string {
	return BROWSE_CATEGORIES[Math.floor(Math.random() * BROWSE_CATEGORIES.length)];
}

/**
 * Resolve the discovery page's combined query.
 *
 * TheMealDB has no endpoint that accepts a search term *and* filters together,
 * so we pick the cheapest upstream call available and narrow the rest in
 * memory:
 *
 * - search term present -> `search.php` (full records), then filter locally.
 * - filters only        -> `filter.php` per filter, intersected by id.
 * - nothing at all      -> a rotating browse category so the grid is never empty.
 */
export async function discoverRecipes(
	query: DiscoverQuery,
	fetchFn: Fetch = fetch
): Promise<RecipeSummary[]> {
	const search = query.search?.trim() ?? '';
	const { category, area } = query;

	if (search) {
		const results = await searchRecipes(search, fetchFn);
		return results.filter(
			(recipe) =>
				(!category || recipe.category === category) && (!area || recipe.area === area)
		);
	}

	if (category && area) {
		// Two light calls in parallel, then keep the ids present in both.
		const [byCategory, byArea] = await Promise.all([
			filterRecipes('category', category, fetchFn),
			filterRecipes('area', area, fetchFn)
		]);
		const areaIds = new Set(byArea.map((recipe) => recipe.id));
		return byCategory.filter((recipe) => areaIds.has(recipe.id)).map((recipe) => ({ ...recipe, area }));
	}

	if (category) {
		return filterRecipes('category', category, fetchFn);
	}

	if (area) {
		return filterRecipes('area', area, fetchFn);
	}

	// Landing state. `load` normally picks the browse category itself so it can
	// label the grid; this branch is the fallback for a bare call.
	return filterRecipes('category', pickBrowseCategory(), fetchFn);
}
