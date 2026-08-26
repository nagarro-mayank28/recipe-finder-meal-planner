<script lang="ts">
	import { goto } from '$app/navigation';

	import PlanSlotDialog from '$lib/components/PlanSlotDialog.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { mealPlan } from '$lib/stores/mealPlan.svelte';
	import type { RecipeSummary } from '$lib/types';
	import type { RkFavoriteToggleDetail } from '@mayank_singh28/recipe-ui-kit';

	let planTarget = $state<RecipeSummary | null>(null);
	let planOpen = $state(false);

	let plannedIds = $derived(mealPlan.plannedRecipeIds);

	function handleFavoriteToggle(event: CustomEvent<RkFavoriteToggleDetail>) {
		// Every card here is already a favourite, so this can only ever remove.
		if (!event.detail.favorite) {
			favorites.remove(event.detail.recipeId);
		}
	}

	function openPlanDialog(recipe: RecipeSummary) {
		planTarget = recipe;
		planOpen = true;
	}
</script>

<svelte:head>
	<title>Favourites · Recipe Finder</title>
</svelte:head>

<div class="page stack">
	<div class="page-head">
		<div>
			<h1 class="page-title">Favourites</h1>
			<p class="page-subtitle">
				{favorites.count === 0
					? 'Recipes you save will appear here.'
					: `${favorites.count} saved ${favorites.count === 1 ? 'recipe' : 'recipes'}.`}
			</p>
		</div>

		{#if favorites.count > 0}
			<a class="btn btn--ghost" href="/planner">Open planner</a>
		{/if}
	</div>

	{#if favorites.count === 0}
		<rk-empty-state
			icon="♡"
			heading="No favourites yet"
			message="Tap the heart on any recipe to save it here for later."
		>
			<a class="btn btn--primary" href="/">Browse recipes</a>
		</rk-empty-state>
	{:else}
		<ul class="recipe-grid">
			{#each favorites.all as recipe (recipe.id)}
				<li>
					<rk-recipe-card
						recipe-id={recipe.id}
						name={recipe.name}
						thumbnail={recipe.thumbnail}
						favorite={true}
						onrkFavoriteToggle={handleFavoriteToggle}
						onrkOpen={(event) => goto(`/recipes/${event.detail}`)}
					>
						{#if recipe.category}
							<rk-badge slot="meta" variant="primary" label={recipe.category}></rk-badge>
						{/if}
						{#if recipe.area}
							<rk-badge slot="meta" label={recipe.area}></rk-badge>
						{/if}
						{#if plannedIds.has(recipe.id)}
							<rk-badge slot="meta" variant="danger" label="In your week"></rk-badge>
						{/if}

						<!-- Projected into the card's `actions` slot. -->
						<button
							slot="actions"
							class="btn btn--ghost btn--sm"
							type="button"
							title="Add to meal plan"
							onclick={() => openPlanDialog(recipe)}
						>
							+ Plan
						</button>
					</rk-recipe-card>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<PlanSlotDialog recipe={planTarget} bind:open={planOpen} />
