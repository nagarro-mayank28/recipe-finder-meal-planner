<script lang="ts">
	/**
	 * "Pick a recipe for this slot" dialog used by the planner.
	 *
	 * Offers three sources: the user's favourites, their own recipes, and a live
	 * search against TheMealDB - so an empty planner is still usable on day one.
	 */
	import { searchRecipes } from '$lib/api/mealdb';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { userRecipes } from '$lib/stores/userRecipes.svelte';
	import { titleCase, type Day, type Meal, type RecipeSummary } from '$lib/types';

	let {
		target,
		open = $bindable(false),
		onpick
	}: {
		/** Target slot. `null` keeps the dialog closed. */
		target: { day: Day; meal: Meal } | null;
		open?: boolean;
		onpick: (recipe: RecipeSummary) => void;
	} = $props();

	type Source = 'favorites' | 'mine' | 'search';

	let source = $state<Source>('favorites');
	let query = $state('');
	let searchResults = $state<RecipeSummary[]>([]);
	let searching = $state(false);
	let searchError = $state<string | null>(null);

	let ownRecipes = $derived<RecipeSummary[]>(
		userRecipes.all.map((recipe) => ({
			id: recipe.id,
			name: recipe.name,
			thumbnail: recipe.thumbnail,
			origin: 'user' as const,
			category: recipe.category,
			area: recipe.area
		}))
	);

	let list = $derived<RecipeSummary[]>(
		source === 'favorites' ? favorites.all : source === 'mine' ? ownRecipes : searchResults
	);

	/**
	 * Search is fired from the input's own debounce rather than an effect, so
	 * switching tabs or reopening the dialog never re-triggers a network call.
	 */
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function runSearch(term: string) {
		query = term;
		clearTimeout(debounceTimer);

		if (!term.trim()) {
			searchResults = [];
			searchError = null;
			return;
		}

		debounceTimer = setTimeout(async () => {
			searching = true;
			searchError = null;

			try {
				searchResults = await searchRecipes(term);
			} catch (cause) {
				searchResults = [];
				searchError = cause instanceof Error ? cause.message : 'Search failed.';
			} finally {
				searching = false;
			}
		}, 350);
	}

	function close() {
		open = false;
	}

	function pick(recipe: RecipeSummary) {
		onpick(recipe);
		close();
	}

	const tabs: Array<{ id: Source; label: string }> = [
		{ id: 'favorites', label: 'Favourites' },
		{ id: 'mine', label: 'My recipes' },
		{ id: 'search', label: 'Search' }
	];
</script>

<rk-modal
	open={open}
	heading={target ? `Add to ${titleCase(target.day)} ${target.meal}` : 'Add a recipe'}
	onrkClose={close}
>
	<div class="body">
		<div class="tabs" role="tablist" aria-label="Recipe source">
			{#each tabs as tab (tab.id)}
				<button
					class="tab"
					class:tab--active={source === tab.id}
					type="button"
					role="tab"
					aria-selected={source === tab.id}
					onclick={() => (source = tab.id)}
				>
					{tab.label}
					{#if tab.id === 'favorites' && favorites.count > 0}
						<span class="tab-count">{favorites.count}</span>
					{:else if tab.id === 'mine' && ownRecipes.length > 0}
						<span class="tab-count">{ownRecipes.length}</span>
					{/if}
				</button>
			{/each}
		</div>

		{#if source === 'search'}
			<input
				class="search"
				type="search"
				placeholder="Search TheMealDB…"
				value={query}
				oninput={(event) => runSearch(event.currentTarget.value)}
				aria-label="Search recipes"
			/>
		{/if}

		{#if source === 'search' && searching}
			<p class="muted note">Searching…</p>
		{:else if searchError}
			<p class="note note--error" role="alert">{searchError}</p>
		{:else if list.length === 0}
			<p class="muted note">
				{#if source === 'favorites'}
					No favourites yet — save a few recipes and they'll show up here.
				{:else if source === 'mine'}
					You haven't created any recipes yet.
				{:else if query.trim()}
					Nothing matched “{query}”.
				{:else}
					Type a dish name to search.
				{/if}
			</p>
		{:else}
			<ul class="options">
				{#each list as recipe (recipe.id)}
					<li>
						<button class="option" type="button" onclick={() => pick(recipe)}>
							{#if recipe.thumbnail}
								<img class="thumb" src={recipe.thumbnail} alt="" loading="lazy" />
							{:else}
								<span class="thumb thumb--empty" aria-hidden="true">🍽️</span>
							{/if}

							<span class="option-text">
								<span class="option-name">{recipe.name}</span>
								{#if recipe.category || recipe.area}
									<span class="option-meta">
										{[recipe.category, recipe.area].filter(Boolean).join(' · ')}
									</span>
								{/if}
							</span>

							<span class="option-cta" aria-hidden="true">Add</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div slot="footer" class="row">
		<button class="btn btn--ghost" type="button" onclick={close}>Close</button>
	</div>
</rk-modal>

<style>
	.body {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.tabs {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--rk-color-surface-alt);
		border-radius: var(--rk-radius-pill);
	}

	.tab {
		flex: 1 1 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.45rem 0.6rem;
		font: inherit;
		font-size: 0.84rem;
		font-weight: 600;
		cursor: pointer;
		color: var(--rk-color-muted);
		background: transparent;
		border: none;
		border-radius: var(--rk-radius-pill);
	}

	.tab--active {
		color: var(--rk-color-primary);
		background: var(--rk-color-surface);
		box-shadow: var(--rk-shadow-sm);
	}

	.tab:focus-visible {
		outline: none;
		box-shadow: var(--rk-focus-ring);
	}

	.tab-count {
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		opacity: 0.75;
	}

	.search {
		width: 100%;
		padding: 0.55rem 0.75rem;
		font: inherit;
		font-size: 0.9rem;
		background: var(--rk-color-surface);
		border: 1px solid var(--rk-color-border);
		border-radius: var(--rk-radius-md);
	}

	.search:focus-visible {
		outline: none;
		box-shadow: var(--rk-focus-ring);
	}

	.note {
		margin: 0;
		padding: 1.25rem 0;
		font-size: 0.88rem;
		text-align: center;
	}

	.note--error {
		color: var(--rk-color-danger);
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		max-height: 22rem;
		overflow-y: auto;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.option {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		width: 100%;
		padding: 0.5rem;
		font: inherit;
		text-align: left;
		cursor: pointer;
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--rk-radius-md);
	}

	.option:hover {
		background: var(--rk-color-surface-alt);
		border-color: var(--rk-color-border);
	}

	.option:focus-visible {
		outline: none;
		box-shadow: var(--rk-focus-ring);
	}

	.thumb {
		flex: none;
		width: 2.75rem;
		height: 2.75rem;
		object-fit: cover;
		border-radius: var(--rk-radius-sm);
	}

	.thumb--empty {
		display: grid;
		place-items: center;
		background: var(--rk-color-surface-alt);
	}

	.option-text {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-width: 0;
	}

	.option-name {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.option-meta {
		font-size: 0.78rem;
		color: var(--rk-color-muted);
	}

	.option-cta {
		flex: none;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--rk-color-primary);
	}
</style>
