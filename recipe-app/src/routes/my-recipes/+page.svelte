<script lang="ts">
	import { goto } from '$app/navigation';

	import PlanSlotDialog from '$lib/components/PlanSlotDialog.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { mealPlan } from '$lib/stores/mealPlan.svelte';
	import { userRecipes } from '$lib/stores/userRecipes.svelte';
	import type { RecipeSummary, UserRecipe } from '$lib/types';
	import type { RkFavoriteToggleDetail } from '@mayank_singh28/recipe-ui-kit';

	let query = $state('');

	/** Local search over the user's own recipes - name, category, cuisine and tags. */
	let visible = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return userRecipes.all;

		return userRecipes.all.filter((recipe) =>
			[recipe.name, recipe.category, recipe.area, ...recipe.tags]
				.join(' ')
				.toLowerCase()
				.includes(needle)
		);
	});

	let planTarget = $state<RecipeSummary | null>(null);
	let planOpen = $state(false);

	let pendingDelete = $state<UserRecipe | null>(null);

	function toSummary(recipe: UserRecipe): RecipeSummary {
		return {
			id: recipe.id,
			name: recipe.name,
			thumbnail: recipe.thumbnail,
			origin: 'user',
			category: recipe.category,
			area: recipe.area
		};
	}

	function handleFavoriteToggle(event: CustomEvent<RkFavoriteToggleDetail>, recipe: UserRecipe) {
		if (event.detail.favorite) {
			favorites.add(toSummary(recipe));
		} else {
			favorites.remove(event.detail.recipeId);
		}
	}

	function confirmDelete() {
		if (!pendingDelete) return;

		// Remove every trace: the recipe, its favourite entry, and any planned slot.
		favorites.remove(pendingDelete.id);
		mealPlan.removeRecipe(pendingDelete.id);
		userRecipes.remove(pendingDelete.id);
		pendingDelete = null;
	}
</script>

<svelte:head>
	<title>My recipes · Recipe Finder</title>
</svelte:head>

<div class="page stack">
	<div class="page-head">
		<div>
			<h1 class="page-title">My recipes</h1>
			<p class="page-subtitle">
				{userRecipes.count === 0
					? 'Recipes you create are saved in this browser.'
					: `${userRecipes.count} ${userRecipes.count === 1 ? 'recipe' : 'recipes'} you created.`}
			</p>
		</div>
		<a class="btn btn--primary" href="/my-recipes/new">+ New recipe</a>
	</div>

	{#if userRecipes.count === 0}
		<rk-empty-state
			icon="📝"
			heading="No recipes yet"
			message="Add your own recipes to keep them alongside everything you discover."
		>
			<a class="btn btn--primary" href="/my-recipes/new">Create your first recipe</a>
		</rk-empty-state>
	{:else}
		<!--
			`rk-search-bar` reused here as a local filter. Nothing is fetched — the
			debounced event just narrows the list in memory.
		-->
		<rk-search-bar
			value={query}
			placeholder="Filter your recipes…"
			label="Filter your recipes"
			debounce={150}
			onrkSearch={(event) => (query = event.detail)}
			onrkSearchSubmit={(event) => (query = event.detail)}
		></rk-search-bar>

		{#if visible.length === 0}
			<rk-empty-state
				icon="🔍"
				heading="Nothing matched"
				message={`None of your recipes match “${query}”.`}
			>
				<button class="btn btn--ghost" type="button" onclick={() => (query = '')}>
					Clear filter
				</button>
			</rk-empty-state>
		{:else}
			<ul class="recipe-grid">
				{#each visible as recipe (recipe.id)}
					<li>
						<rk-recipe-card
							recipe-id={recipe.id}
							name={recipe.name}
							thumbnail={recipe.thumbnail}
							favorite={favorites.has(recipe.id)}
							action-label="View"
							onrkFavoriteToggle={(event) => handleFavoriteToggle(event, recipe)}
							onrkOpen={(event) => goto(`/recipes/${event.detail}`)}
						>
							<rk-badge slot="meta" variant="primary" label={recipe.category}></rk-badge>
							<rk-badge slot="meta" label={recipe.area}></rk-badge>

							<!-- Owner-only actions, projected into the card's `actions` slot. -->
							<a
								slot="actions"
								class="btn btn--ghost btn--sm"
								href={`/my-recipes/${recipe.id}/edit`}
								title="Edit recipe"
							>
								Edit
							</a>
							<button
								slot="actions"
								class="btn btn--ghost btn--sm"
								type="button"
								title="Add to meal plan"
								onclick={() => {
									planTarget = toSummary(recipe);
									planOpen = true;
								}}
							>
								+ Plan
							</button>
							<button
								slot="actions"
								class="btn btn--danger btn--sm"
								type="button"
								title="Delete recipe"
								onclick={() => (pendingDelete = recipe)}
							>
								Delete
							</button>
						</rk-recipe-card>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<PlanSlotDialog recipe={planTarget} bind:open={planOpen} />

<rk-modal
	open={pendingDelete !== null}
	heading="Delete this recipe?"
	onrkClose={() => (pendingDelete = null)}
>
	<p>
		<strong>{pendingDelete?.name}</strong> will be removed from your recipes and favourites. This
		cannot be undone.
	</p>

	<div slot="footer" class="row">
		<button class="btn btn--ghost" type="button" onclick={() => (pendingDelete = null)}>
			Keep it
		</button>
		<button class="btn btn--danger" type="button" onclick={confirmDelete}>Delete recipe</button>
	</div>
</rk-modal>
