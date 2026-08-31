<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { randomRecipe } from '$lib/api/mealdb';
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

	/** Browse mode: nothing was asked for, so `+page.ts` chose a category for us. */
	let browsing = $derived(Boolean(data.browseCategory));

	let surprising = $state(false);
	let surpriseError = $state<string | null>(null);

	/** "Surprise me" — jump straight to a random recipe's details page. */
	async function surpriseMe() {
		surprising = true;
		surpriseError = null;

		try {
			const recipe = await randomRecipe();

			if (recipe) {
				await goto(`/recipes/${recipe.id}`);
			} else {
				surpriseError = 'TheMealDB returned no recipe. Try again.';
			}
		} catch (cause) {
			surpriseError = cause instanceof Error ? cause.message : 'Could not fetch a random recipe.';
		} finally {
			surprising = false;
		}
	}

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
				Search by name, browse a category, or narrow things down by cuisine.
			</p>
		</div>
		<div class="head-actions">
			<button class="btn btn--ghost" type="button" onclick={surpriseMe} disabled={surprising}>
				{surprising ? 'Finding…' : '🎲 Surprise me'}
			</button>
			<a class="btn btn--ghost" href="/my-recipes/new">+ Add your own</a>
		</div>
	</div>

	{#if surpriseError}
		<p class="panel error" role="alert">{surpriseError}</p>
	{/if}

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

	<!--
		Browsing, as opposed to searching. Plain links rather than buttons: each
		category is a real, shareable, server-rendered URL, and the loader already
		reads `?category=` — so browsing costs no extra client state.
	-->
	{#if !data.search && data.categories.length > 0}
		<nav class="chips" aria-label="Browse by category">
			{#each data.categories as name (name)}
				<a
					class="chip"
					class:chip--active={data.category === name}
					href="/?category={encodeURIComponent(name)}"
					aria-current={data.category === name ? 'page' : undefined}
				>
					{name}
				</a>
			{/each}
		</nav>
	{/if}

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
			{#if browsing}
				Browsing <strong>{data.browseCategory}</strong> · {data.recipes.length}
				{data.recipes.length === 1 ? 'recipe' : 'recipes'} · pick another category above or search
			{:else}
				{data.recipes.length}
				{data.recipes.length === 1 ? 'recipe' : 'recipes'}
				{#if hasFilters}found{/if}
			{/if}
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

	.head-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip {
		padding: 0.35rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--rk-color-muted);
		background: var(--rk-color-surface);
		border: 1px solid var(--rk-color-border);
		border-radius: var(--rk-radius-pill);
	}

	.chip:hover:not(.chip--active) {
		color: var(--rk-color-primary);
		border-color: var(--rk-color-primary);
	}

	.chip:focus-visible {
		outline: none;
		box-shadow: var(--rk-focus-ring);
	}

	.chip--active {
		color: var(--rk-color-on-primary);
		background: var(--rk-color-primary);
		border-color: var(--rk-color-primary);
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
