import { error } from '@sveltejs/kit';
import { getRecipe, MealDbError } from '$lib/api/mealdb';
import { isUserRecipeId } from '$lib/stores/userRecipes.svelte';
import type { PageLoad } from './$types';

/**
 * Load one recipe.
 *
 * User-created recipes live in `localStorage`, which `load` cannot reach on the
 * server, so those are flagged here and resolved from the store during render.
 * Anything else is fetched from TheMealDB and server-rendered.
 */
export const load: PageLoad = async ({ params, fetch }) => {
	if (isUserRecipeId(params.id)) {
		return { recipe: null, isUserRecipe: true as const, id: params.id };
	}

	try {
		const recipe = await getRecipe(params.id, fetch);

		if (!recipe) {
			error(404, 'That recipe does not exist.');
		}

		return { recipe, isUserRecipe: false as const, id: params.id };
	} catch (cause) {
		if (cause instanceof MealDbError) {
			error(503, cause.message);
		}
		throw cause;
	}
};
