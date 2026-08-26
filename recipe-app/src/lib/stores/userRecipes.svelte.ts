import { Persisted } from './persisted.svelte';
import { meaningfulIngredients, type RecipeDraft } from '$lib/validation';
import type { Ingredient, UserRecipe } from '$lib/types';

const STORAGE_KEY = 'rfmp:user-recipes';

/**
 * User recipes get a prefixed id so they can never collide with a TheMealDB id
 * (which is always numeric). Routes use the prefix to decide which source to
 * load a recipe from.
 */
export const USER_ID_PREFIX = 'user-';

export function isUserRecipeId(id: string): boolean {
	return id.startsWith(USER_ID_PREFIX);
}

function newId(): string {
	// `crypto.randomUUID` needs a secure context; the timestamp form is a fine
	// fallback for ids that only ever live in this browser.
	const unique =
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

	return `${USER_ID_PREFIX}${unique}`;
}

function reviveIngredients(raw: unknown): Ingredient[] {
	if (!Array.isArray(raw)) return [];

	return raw
		.filter((item): item is Ingredient => !!item && typeof (item as Ingredient).name === 'string')
		.map((item) => (item.measure ? { name: item.name, measure: item.measure } : { name: item.name }));
}

/** Drop stored entries that no longer satisfy the `UserRecipe` contract. */
function revive(raw: unknown): UserRecipe[] {
	if (!Array.isArray(raw)) return [];

	return raw.flatMap((value) => {
		if (!value || typeof value !== 'object') return [];

		const entry = value as Partial<UserRecipe>;
		if (typeof entry.id !== 'string' || typeof entry.name !== 'string') return [];

		const now = new Date().toISOString();

		return [
			{
				id: entry.id,
				name: entry.name,
				thumbnail: entry.thumbnail ?? '',
				origin: 'user',
				category: entry.category ?? 'Uncategorised',
				area: entry.area ?? 'Unknown',
				instructions: entry.instructions ?? '',
				ingredients: reviveIngredients(entry.ingredients),
				tags: Array.isArray(entry.tags) ? entry.tags.filter((t) => typeof t === 'string') : [],
				createdAt: entry.createdAt ?? now,
				updatedAt: entry.updatedAt ?? entry.createdAt ?? now
			} satisfies UserRecipe
		];
	});
}

/** Turn the form's comma-separated tag string into a clean array. */
function parseTags(input: string): string[] {
	return input
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);
}

class UserRecipeStore {
	#store = new Persisted<UserRecipe[]>(STORAGE_KEY, [], revive);

	/** Newest first - the order people expect in a "my recipes" list. */
	get all(): UserRecipe[] {
		return [...this.#store.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}

	get count(): number {
		return this.#store.value.length;
	}

	get(id: string): UserRecipe | undefined {
		return this.#store.value.find((recipe) => recipe.id === id);
	}

	/**
	 * Persist a new recipe and return it, so the caller can navigate straight to
	 * its details page.
	 *
	 * Assumes the draft has already passed `validateDraft`.
	 */
	create(draft: RecipeDraft): UserRecipe {
		const now = new Date().toISOString();

		const recipe: UserRecipe = {
			id: newId(),
			name: draft.name.trim(),
			thumbnail: draft.thumbnail.trim(),
			origin: 'user',
			category: draft.category.trim(),
			area: draft.area.trim(),
			instructions: draft.instructions.trim(),
			ingredients: meaningfulIngredients(draft.ingredients),
			tags: parseTags(draft.tags),
			createdAt: now,
			updatedAt: now
		};

		this.#store.update((current) => [...current, recipe]);
		return recipe;
	}

	/** Overwrite an existing recipe. Returns the updated copy, or `undefined` if the id is unknown. */
	update(id: string, draft: RecipeDraft): UserRecipe | undefined {
		const existing = this.get(id);
		if (!existing) return undefined;

		const updated: UserRecipe = {
			...existing,
			name: draft.name.trim(),
			thumbnail: draft.thumbnail.trim(),
			category: draft.category.trim(),
			area: draft.area.trim(),
			instructions: draft.instructions.trim(),
			ingredients: meaningfulIngredients(draft.ingredients),
			tags: parseTags(draft.tags),
			updatedAt: new Date().toISOString()
		};

		this.#store.update((current) =>
			current.map((recipe) => (recipe.id === id ? updated : recipe))
		);

		return updated;
	}

	/** Returns `true` when something was actually removed. */
	remove(id: string): boolean {
		const before = this.#store.value.length;
		this.#store.update((current) => current.filter((recipe) => recipe.id !== id));
		return this.#store.value.length < before;
	}

	/** Pre-fill the edit form from a stored recipe. */
	toDraft(recipe: UserRecipe): RecipeDraft {
		return {
			name: recipe.name,
			category: recipe.category,
			area: recipe.area,
			thumbnail: recipe.thumbnail,
			instructions: recipe.instructions,
			tags: recipe.tags.join(', '),
			ingredients:
				recipe.ingredients.length > 0
					? recipe.ingredients.map((item) => ({ name: item.name, measure: item.measure ?? '' }))
					: [{ name: '', measure: '' }]
		};
	}
}

export const userRecipes = new UserRecipeStore();
