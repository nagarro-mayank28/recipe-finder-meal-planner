import { listAreas, listCategories } from '$lib/api/mealdb';
import type { PageLoad } from './$types';

/**
 * The form writes to `localStorage`, so it only ever runs in the browser.
 *
 * Category and cuisine suggestions are still fetched from TheMealDB so
 * hand-written recipes use the same vocabulary as the discovery filters, which
 * keeps them findable there later.
 */
export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const [categories, areas] = await Promise.all([
		listCategories(fetch).catch(() => []),
		listAreas(fetch).catch(() => [])
	]);

	return { categories, areas };
};
