/**
 * Validation for the add / edit recipe form.
 *
 * Kept free of Svelte and browser APIs so the same rules can run in a unit test
 * or on a server if the app ever grows one.
 */

import type { Ingredient } from '$lib/types';

/** The form's working shape. Strings mirror `<input>` values exactly. */
export interface RecipeDraft {
	name: string;
	category: string;
	area: string;
	thumbnail: string;
	instructions: string;
	/** Comma-separated in the form; split on save. */
	tags: string;
	ingredients: Ingredient[];
}

/** Field name -> message. Empty object means the draft is valid. */
export type ValidationErrors = Partial<Record<keyof RecipeDraft, string>>;

export const NAME_MIN = 3;
export const NAME_MAX = 80;
export const INSTRUCTIONS_MIN = 20;

/** A blank draft, used when opening the "new recipe" form. */
export function emptyDraft(): RecipeDraft {
	return {
		name: '',
		category: '',
		area: '',
		thumbnail: '',
		instructions: '',
		tags: '',
		// Start with one blank row so the form has something to type into.
		ingredients: [{ name: '', measure: '' }]
	};
}

/** Rows the user left completely blank are ignored rather than rejected. */
export function meaningfulIngredients(ingredients: Ingredient[]): Ingredient[] {
	return ingredients
		.map((item) => ({ name: item.name.trim(), measure: item.measure?.trim() ?? '' }))
		.filter((item) => item.name.length > 0)
		.map((item) => (item.measure ? item : { name: item.name }));
}

function isHttpUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

/**
 * Check a draft and collect one message per offending field.
 *
 * All fields are checked on every call (rather than bailing at the first
 * error) so the form can show every problem at once.
 */
export function validateDraft(draft: RecipeDraft): ValidationErrors {
	const errors: ValidationErrors = {};

	const name = draft.name.trim();
	if (!name) {
		errors.name = 'Recipe name is required.';
	} else if (name.length < NAME_MIN) {
		errors.name = `Use at least ${NAME_MIN} characters.`;
	} else if (name.length > NAME_MAX) {
		errors.name = `Keep it under ${NAME_MAX} characters.`;
	}

	if (!draft.category.trim()) {
		errors.category = 'Pick a category.';
	}

	if (!draft.area.trim()) {
		errors.area = 'Pick a cuisine.';
	}

	// Optional field: only validated when the user typed something.
	if (draft.thumbnail.trim() && !isHttpUrl(draft.thumbnail.trim())) {
		errors.thumbnail = 'Enter a full image URL starting with http:// or https://';
	}

	const instructions = draft.instructions.trim();
	if (!instructions) {
		errors.instructions = 'Instructions are required.';
	} else if (instructions.length < INSTRUCTIONS_MIN) {
		errors.instructions = `Add a little more detail — at least ${INSTRUCTIONS_MIN} characters.`;
	}

	if (meaningfulIngredients(draft.ingredients).length === 0) {
		errors.ingredients = 'Add at least one ingredient.';
	}

	return errors;
}

export function isValid(errors: ValidationErrors): boolean {
	return Object.keys(errors).length === 0;
}
