import { discoverRecipes, listAreas, listCategories, MealDbError } from '$lib/api/mealdb';
import type { RecipeSummary } from '$lib/types';
import type { PageLoad } from './$types';

/**
 * Discovery data.
 *
 * Search state lives in the URL (`?q=`, `?category=`, `?area=`) rather than in a
 * component, which means results are server-rendered, shareable, and survive a
 * refresh or a back-navigation for free.
 */
export const load: PageLoad = async ({ fetch, url }) => {
	const search = url.searchParams.get('q')?.trim() ?? '';
	const category = url.searchParams.get('category') ?? '';
	const area = url.searchParams.get('area') ?? '';

	// Filter choices are independent of the results, so fetch all three together.
	const [recipesResult, categoriesResult, areasResult] = await Promise.allSettled([
		discoverRecipes({ search, category, area }, fetch),
		listCategories(fetch),
		listAreas(fetch)
	]);

	let recipes: RecipeSummary[] = [];
	let error: string | null = null;

	if (recipesResult.status === 'fulfilled') {
		recipes = recipesResult.value;
	} else {
		const reason = recipesResult.reason;
		error =
			reason instanceof MealDbError
				? reason.message
				: 'Something went wrong while loading recipes.';
	}

	return {
		recipes,
		error,
		search,
		category,
		area,
		// A failed filter list is not worth failing the page over - the filter
		// simply renders disabled.
		categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
		areas: areasResult.status === 'fulfilled' ? areasResult.value : []
	};
};
