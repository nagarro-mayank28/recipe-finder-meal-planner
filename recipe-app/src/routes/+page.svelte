<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { ceProps } from '$lib/stencil/ceProps';
	import { favorites } from '$lib/stores/favorites.svelte';
	import type { RecipeSummary } from '$lib/types';
	import type { RkFavoriteToggleDetail, RkFilterChangeDetail, RkFilterOption } from '@mayank_singh28/recipe-ui-kit';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/** `rk-filter-select` takes `{ value, label }` objects, so map the plain names. */
	const toOptions = (names: string[]): RkFilterOption[] =>
		names.map((name) => ({ value: name, label: name }));

	let categoryOptions = $derived(toOptions(data.categories));
	let areaOptions = $derived(toOptions(data.areas));

	let hasFilters = $derived(Boolean(data.search || data.category || data.area));

	/**
	 * Push the new query into the URL and let `+page.ts` re-run.
	 *
	 * `keepFocus` stops the search input from losing focus mid-typing, and
	 * `replaceState` keeps a session of keystrokes out of the history stack.
	 */
	function applyQuery(patch: Record<string, string>) {
		const params = new URLSearchParams(page.url.searchParams);

		for (const [key, value] of Object.entries(patch)) {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		}

		const query = params.toString();
		goto(query ? `/?${query}` : '/', { keepFocus: true, noScroll: true, replaceState: true });
	}

	function handleSearch(event: CustomEvent<string>) {
		applyQuery({ q: event.detail });
	}

	function handleFilterChange(event: CustomEvent<RkFilterChangeDetail>) {
		const { name, value } = event.detail;
		applyQuery({ [name]: value });
	}

	function handleFavoriteToggle(event: CustomEvent<RkFavoriteToggleDetail>, recipe: RecipeSummary) {
		// Act on the state the card asked for rather than flipping our own copy, so
		// a double-fired event can't undo itself.
		if (event.detail.favorite) {
			favorites.add(recipe);
		} else {
			favorites.remove(event.detail.recipeId);
		}
	}

	function openRecipe(event: CustomEvent<string>) {
		goto(`/recipes/${event.detail}`);
	}

	function clearAll() {
		goto('/');
	}
</script>

<svelte:head>
	<title>
		{data.search ? `"${data.search}" · ` : ''}Discover recipes · Recipe Finder
	</title>
	<meta
		name="description"
		content="Search thousands of recipes by name, category and cuisine, then save favourites and plan your week."
	/>
</svelte:head>

<div class="page stack">
	<div class="page-head">
		<div>
			<h1 class="page-title">Discover recipes</h1>
			<p class="page-subtitle">
				Search by name, then narrow things down by category or cuisine.
			</p>
		</div>
		<a class="btn btn--ghost" href="/my-recipes/new">+ Add your own</a>
	</div>

	<!--
		`rk-search-bar` from the published library. Primitive props are plain
		attributes; the two filters are projected into its `filters` slot so they
		render inside the search surface.
	-->
	<rk-search-bar
		value={data.search}
		placeholder="Try “chicken”, “pasta”, “biryani”…"
		onrkSearch={handleSearch}
		onrkSearchSubmit={handleSearch}
	>
		<div slot="filters" class="filters">
			<rk-filter-select
				name="category"
				label="Category"
				placeholder="All categories"
				value={data.category}
				disabled={data.categories.length === 0}
				use:ceProps={{ options: categoryOptions }}
				onrkFilterChange={handleFilterChange}
			></rk-filter-select>

			<rk-filter-select
				name="area"
				label="Cuisine"
				placeholder="All cuisines"
				value={data.area}
				disabled={data.areas.length === 0}
				use:ceProps={{ options: areaOptions }}
				onrkFilterChange={handleFilterChange}
			></rk-filter-select>
		</div>
	</rk-search-bar>

	{#if data.error}
		<div class="panel error" role="alert">
			<strong>Couldn’t load recipes.</strong>
			<p class="muted">{data.error}</p>
			<button class="btn btn--ghost btn--sm" type="button" onclick={() => location.reload()}>
				Try again
			</button>
		</div>
	{:else if data.recipes.length === 0}
		<rk-empty-state
			icon="🔍"
			heading="No recipes matched"
			message={hasFilters
				? 'Try a different search term, or loosen the category and cuisine filters.'
				: 'Search for a dish to get started.'}
		>
			{#if hasFilters}
				<button class="btn btn--primary" type="button" onclick={clearAll}>
					Clear search and filters
				</button>
			{/if}
		</rk-empty-state>
	{:else}
		<p class="muted count-line" aria-live="polite">
			{data.recipes.length}
			{data.recipes.length === 1 ? 'recipe' : 'recipes'}
			{#if hasFilters}found{/if}
		</p>

		<ul class="recipe-grid">
			{#each data.recipes as recipe (recipe.id)}
				<li>
					<!--
						`favorite` is driven by the store, and the card's event handler
						writes back to it — the component itself stays stateless.
					-->
					<rk-recipe-card
						recipe-id={recipe.id}
						name={recipe.name}
						thumbnail={recipe.thumbnail}
						favorite={favorites.has(recipe.id)}
						onrkFavoriteToggle={(event) => handleFavoriteToggle(event, recipe)}
						onrkOpen={openRecipe}
					>
						{#if recipe.category}
							<rk-badge slot="meta" variant="primary" label={recipe.category}></rk-badge>
						{/if}
						{#if recipe.area}
							<rk-badge slot="meta" label={recipe.area}></rk-badge>
						{/if}
					</rk-recipe-card>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.count-line {
		margin-top: -0.4rem;
		font-size: 0.85rem;
	}

	.error {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		border-color: var(--rk-color-danger);
		background: var(--rk-color-danger-soft);
	}
</style>
