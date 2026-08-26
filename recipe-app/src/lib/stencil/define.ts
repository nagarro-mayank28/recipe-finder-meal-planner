import { browser } from '$app/environment';

/**
 * Registers the <rk-*> custom elements from the component library.
 *
 * We import the `components/*` entry points instead of `/loader`. The loader
 * fetches each component from a sibling rk-*.entry.js file relative to its own
 * URL, which Vite can't reproduce after bundling, so the tags upgrade but stay
 * empty in a production build. The `components/*` modules are self-contained
 * and register themselves on import.
 *
 * Imports are dynamic and browser-only because each module extends HTMLElement
 * at module scope, which doesn't exist during SSR.
 */
let registration: Promise<void> | null = null;

export function defineRecipeUiKit(): Promise<void> {
	if (!browser) {
		return Promise.resolve();
	}

	registration ??= Promise.all([
		import('@mayank_singh28/recipe-ui-kit/components/rk-badge'),
		import('@mayank_singh28/recipe-ui-kit/components/rk-empty-state'),
		import('@mayank_singh28/recipe-ui-kit/components/rk-filter-select'),
		import('@mayank_singh28/recipe-ui-kit/components/rk-ingredient-list'),
		import('@mayank_singh28/recipe-ui-kit/components/rk-meal-slot'),
		import('@mayank_singh28/recipe-ui-kit/components/rk-modal'),
		import('@mayank_singh28/recipe-ui-kit/components/rk-recipe-card'),
		import('@mayank_singh28/recipe-ui-kit/components/rk-search-bar')
	])
		.then(() => undefined)
		.catch((error: unknown) => {
			console.error('[recipe-ui-kit] Failed to register custom elements.', error);
			// Reset so a later navigation can retry.
			registration = null;
			throw error;
		});

	return registration;
}
