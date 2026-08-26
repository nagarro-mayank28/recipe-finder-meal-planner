/**
 * Types the <rk-*> custom elements for svelte-check.
 *
 * Without this they're untyped unknown elements, so a misspelled prop or a
 * wrong event payload passes silently. Built from the Components.* interfaces
 * Stencil publishes, so these stay in step when the library is upgraded.
 *
 * Prop names are kebab-cased here to match what goes in the markup. Svelte uses
 * setAttribute until an element is upgraded and HTML lowercases attribute
 * names, so `recipeId` would be written as `recipeid` while Stencil observes
 * `recipe-id`. Arrays and objects can't go through an attribute at all - those
 * use the ceProps action.
 */

import type {
	Components,
	RkFavoriteToggleDetail,
	RkFilterChangeDetail,
	RkMealSlotDetail
} from '@mayank_singh28/recipe-ui-kit';

/** `recipeId` -> `recipe-id`, mirroring Stencil's default attribute naming. */
type Kebab<S extends string> = S extends `${infer Head}${infer Tail}`
	? Head extends Uppercase<Head>
		? // Digits and symbols are equal in both cases; only letters get a dash.
			Head extends Lowercase<Head>
			? `${Head}${Kebab<Tail>}`
			: `-${Lowercase<Head>}${Kebab<Tail>}`
		: `${Head}${Kebab<Tail>}`
	: S;

/** Attributes Svelte allows on any element. */
interface CommonAttributes {
	id?: string;
	class?: string;
	style?: string;
	slot?: string;
	title?: string;
	hidden?: boolean;
	role?: string;
	'aria-label'?: string;
}

/**
 * Stencil marks props without defaults as required (e.g. `recipeId`); in markup
 * everything is optional. Booleans may also arrive as attribute strings.
 */
type ElementProps<T> = {
	[K in keyof T as K extends string ? Kebab<K> : K]?: T[K] extends boolean
		? boolean | 'true' | 'false'
		: T[K];
};

type CustomElement<Props, Events = {}> = CommonAttributes & ElementProps<Props> & Events;

declare global {
	namespace svelteHTML {
		interface IntrinsicElements {
			'rk-badge': CustomElement<Components.RkBadge>;

			'rk-empty-state': CustomElement<Components.RkEmptyState>;

			'rk-filter-select': CustomElement<
				Components.RkFilterSelect,
				{ onrkFilterChange?: (event: CustomEvent<RkFilterChangeDetail>) => void }
			>;

			'rk-ingredient-list': CustomElement<Components.RkIngredientList>;

			'rk-meal-slot': CustomElement<
				Components.RkMealSlot,
				{
					onrkAssign?: (event: CustomEvent<RkMealSlotDetail>) => void;
					onrkRemove?: (event: CustomEvent<RkMealSlotDetail>) => void;
					onrkOpen?: (event: CustomEvent<RkMealSlotDetail>) => void;
				}
			>;

			'rk-modal': CustomElement<
				Components.RkModal,
				{ onrkClose?: (event: CustomEvent<void>) => void }
			>;

			'rk-recipe-card': CustomElement<
				Components.RkRecipeCard,
				{
					onrkFavoriteToggle?: (event: CustomEvent<RkFavoriteToggleDetail>) => void;
					onrkOpen?: (event: CustomEvent<string>) => void;
				}
			>;

			'rk-search-bar': CustomElement<
				Components.RkSearchBar,
				{
					onrkSearch?: (event: CustomEvent<string>) => void;
					onrkSearchSubmit?: (event: CustomEvent<string>) => void;
				}
			>;
		}
	}
}

export {};
