import type { Action } from 'svelte/action';

/**
 * Sets object/array values on a custom element as properties.
 *
 * Svelte falls back to setAttribute on unknown elements, so arrays and objects
 * would be stringified. Assigning before the element is upgraded doesn't work
 * either - it creates an own property that shadows Stencil's prototype
 * accessor. So we wait for whenDefined and then assign.
 *
 * Primitive props don't need this; they go in the markup as kebab-case
 * attributes, which Stencil reads during initialisation.
 *
 * Usage:
 *   <rk-filter-select name="category" use:ceProps={{ options }} />
 */
export const ceProps: Action<HTMLElement, Record<string, unknown>> = (node, props) => {
	let current = props ?? {};
	let upgraded = false;

	const apply = () => {
		if (!upgraded) return;

		for (const [key, value] of Object.entries(current)) {
			(node as unknown as Record<string, unknown>)[key] = value;
		}
	};

	customElements.whenDefined(node.localName).then(() => {
		upgraded = true;
		apply();
	});

	return {
		update(next) {
			current = next ?? {};
			apply();
		}
	};
};
