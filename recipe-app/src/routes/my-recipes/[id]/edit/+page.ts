import { error } from '@sveltejs/kit';
import { listAreas, listCategories } from '$lib/api/mealdb';
import { isUserRecipeId } from '$lib/stores/userRecipes.svelte';
import type { PageLoad } from './$types';

/** Editing reads and writes `localStorage`, so this route is client-only. */
export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	// Only user-created recipes are editable; API recipes have no owner.
	if (!isUserRecipeId(params.id)) {
		error(403, 'Only recipes you created can be edited.');
	}

	const [categories, areas] = await Promise.all([
		listCategories(fetch).catch(() => []),
		listAreas(fetch).catch(() => [])
	]);

	return { id: params.id, categories, areas };
};
