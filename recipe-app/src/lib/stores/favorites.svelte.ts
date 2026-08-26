import { Persisted } from './persisted.svelte';
import type { RecipeSummary } from '$lib/types';

const STORAGE_KEY = 'rfmp:favorites';

/** Keyed by recipe id so membership checks in a grid stay O(1). */
type FavoriteMap = Record<string, RecipeSummary>;

/**
 * Discard anything that is not a usable summary. Stored data can predate a
 * schema change or have been edited by hand, and a half-populated card is
 * worse than a missing one.
 */
function revive(raw: unknown): FavoriteMap {
	if (!raw || typeof raw !== 'object') return {};

	const result: FavoriteMap = {};

	for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
		if (!value || typeof value !== 'object') continue;

		const entry = value as Partial<RecipeSummary>;
		if (typeof entry.id !== 'string' || typeof entry.name !== 'string') continue;

		result[id] = {
			id: entry.id,
			name: entry.name,
			thumbnail: typeof entry.thumbnail === 'string' ? entry.thumbnail : '',
			origin: entry.origin === 'user' ? 'user' : 'mealdb',
			...(entry.category ? { category: entry.category } : {}),
			...(entry.area ? { area: entry.area } : {})
		};
	}

	return result;
}

class FavoritesStore {
	#store = new Persisted<FavoriteMap>(STORAGE_KEY, {}, revive);

	/** Favourites in the order they were added, newest last. */
	get all(): RecipeSummary[] {
		return Object.values(this.#store.value);
	}

	get count(): number {
		return Object.keys(this.#store.value).length;
	}

	has(id: string): boolean {
		return id in this.#store.value;
	}

	add(recipe: RecipeSummary): void {
		this.#store.update((current) => ({ ...current, [recipe.id]: recipe }));
	}

	remove(id: string): void {
		this.#store.update((current) => {
			// Rebuild without the key rather than `delete`, so the assignment
			// hands `Persisted` a fresh object.
			const { [id]: _removed, ...rest } = current;
			return rest;
		});
	}

	/**
	 * Flip the favourite state.
	 *
	 * Takes the whole summary because a card can be favourited straight from a
	 * grid, where the app would otherwise have to refetch the recipe to know
	 * its name and thumbnail.
	 */
	toggle(recipe: RecipeSummary): void {
		if (this.has(recipe.id)) {
			this.remove(recipe.id);
		} else {
			this.add(recipe);
		}
	}

	clear(): void {
		this.#store.reset({});
	}
}

/**
 * Module-level singleton: favourites are global to the session, and a shared
 * instance keeps every route's heart icons in sync automatically.
 */
export const favorites = new FavoritesStore();
