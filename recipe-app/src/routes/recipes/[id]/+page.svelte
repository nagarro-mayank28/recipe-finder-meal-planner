<script lang="ts">
	import { goto } from '$app/navigation';

	import PlanSlotDialog from '$lib/components/PlanSlotDialog.svelte';
	import { ceProps } from '$lib/stencil/ceProps';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { mealPlan } from '$lib/stores/mealPlan.svelte';
	import { userRecipes } from '$lib/stores/userRecipes.svelte';
	import type { Recipe, RecipeSummary } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/**
	 * API recipes arrive from `load`; user recipes come from the store because
	 * `localStorage` is unavailable during server rendering.
	 */
	let recipe = $derived<Recipe | undefined>(
		data.isUserRecipe ? userRecipes.get(data.id) : (data.recipe ?? undefined)
	);

	/**
	 * A user recipe that resolves to nothing was deleted, or belongs to another
	 * browser. Distinguished from "still hydrating" so we don't flash a 404.
	 */
	let hydrated = $state(false);
	$effect(() => {
		hydrated = true;
	});

	let summary = $derived<RecipeSummary | null>(
		recipe
			? {
					id: recipe.id,
					name: recipe.name,
					thumbnail: recipe.thumbnail,
					origin: recipe.origin,
					category: recipe.category,
					area: recipe.area
				}
			: null
	);

	let isFavorite = $derived(recipe ? favorites.has(recipe.id) : false);

	let planOpen = $state(false);
	let confirmDeleteOpen = $state(false);

	/** TheMealDB stores instructions as one blob with newlines; split for readability. */
	let steps = $derived(
		(recipe?.instructions ?? '')
			.split(/\r?\n+/)
			.map((step) => step.replace(/^\s*(?:STEP\s*)?\d+[.)]?\s*/i, '').trim())
			.filter(Boolean)
	);

	function toggleFavorite() {
		if (!summary) return;
		favorites.toggle(summary);
	}

	function confirmDelete() {
		if (!recipe) return;

		// Clear every reference before navigating away.
		favorites.remove(recipe.id);
		mealPlan.removeRecipe(recipe.id);
		userRecipes.remove(recipe.id);

		confirmDeleteOpen = false;
		goto('/my-recipes');
	}
</script>

<svelte:head>
	<title>{recipe ? `${recipe.name} · Recipe Finder` : 'Recipe · Recipe Finder'}</title>
	{#if recipe}
		<meta name="description" content={`${recipe.name} — a ${recipe.area} ${recipe.category} recipe.`} />
	{/if}
</svelte:head>

<div class="page">
	{#if !recipe}
		{#if hydrated}
			<rk-empty-state
				icon="🥲"
				heading="Recipe not found"
				message="This recipe may have been deleted, or it was created in a different browser."
			>
				<a class="btn btn--primary" href="/my-recipes">Back to my recipes</a>
			</rk-empty-state>
		{:else}
			<p class="muted">Loading recipe…</p>
		{/if}
	{:else}
		<nav class="breadcrumb" aria-label="Breadcrumb">
			<a href="/">Discover</a>
			<span aria-hidden="true">/</span>
			<span class="muted">{recipe.name}</span>
		</nav>

		<article class="layout">
			<header class="hero">
				{#if recipe.thumbnail}
					<img class="hero-image" src={recipe.thumbnail} alt={recipe.name} />
				{:else}
					<div class="hero-image hero-image--empty" aria-hidden="true">🍽️</div>
				{/if}

				<div class="hero-body">
					<h1 class="page-title">{recipe.name}</h1>

					<div class="row badges">
						<rk-badge variant="primary" label={recipe.category}></rk-badge>
						<rk-badge label={recipe.area}></rk-badge>
						{#if recipe.origin === 'user'}
							<rk-badge variant="danger" label="Your recipe"></rk-badge>
						{/if}
						{#each recipe.tags as tag (tag)}
							<rk-badge label={tag}></rk-badge>
						{/each}
					</div>

					<div class="row actions">
						<button class="btn btn--ghost" type="button" onclick={toggleFavorite}>
							{isFavorite ? '♥ Saved to favourites' : '♡ Save to favourites'}
						</button>

						<button class="btn btn--primary" type="button" onclick={() => (planOpen = true)}>
							Add to meal plan
						</button>

						{#if recipe.origin === 'user'}
							<a class="btn btn--ghost" href={`/my-recipes/${recipe.id}/edit`}>Edit</a>
							<button
								class="btn btn--danger"
								type="button"
								onclick={() => (confirmDeleteOpen = true)}
							>
								Delete
							</button>
						{/if}
					</div>

					{#if recipe.youtube || recipe.source}
						<p class="links">
							{#if recipe.youtube}
								<a class="link" href={recipe.youtube} target="_blank" rel="noreferrer noopener">
									Watch on YouTube ↗
								</a>
							{/if}
							{#if recipe.source}
								<a class="link" href={recipe.source} target="_blank" rel="noreferrer noopener">
									Original source ↗
								</a>
							{/if}
						</p>
					{/if}
				</div>
			</header>

			<div class="columns">
				<!--
					`items` is an object array, so it is assigned as a real property via
					the `ceProps` action rather than an attribute. The servings badge is
					projected into the component's `header` slot.
				-->
				<rk-ingredient-list
					heading="Ingredients"
					use:ceProps={{ items: recipe.ingredients }}
				>
					<rk-badge
						slot="header"
						label={`${recipe.ingredients.length} ${recipe.ingredients.length === 1 ? 'item' : 'items'}`}
					></rk-badge>
				</rk-ingredient-list>

				<section class="panel instructions">
					<h2 class="section-title">Instructions</h2>
					{#if steps.length === 0}
						<p class="muted">No instructions were provided for this recipe.</p>
					{:else}
						<ol class="steps">
							{#each steps as step, index (index)}
								<li>{step}</li>
							{/each}
						</ol>
					{/if}
				</section>
			</div>
		</article>
	{/if}
</div>

<PlanSlotDialog recipe={summary} bind:open={planOpen} />

<rk-modal
	open={confirmDeleteOpen}
	heading="Delete this recipe?"
	onrkClose={() => (confirmDeleteOpen = false)}
>
	<p>
		<strong>{recipe?.name}</strong> will be removed from your recipes, favourites and meal plan.
		This cannot be undone.
	</p>

	<div slot="footer" class="row">
		<button class="btn btn--ghost" type="button" onclick={() => (confirmDeleteOpen = false)}>
			Keep it
		</button>
		<button class="btn btn--danger" type="button" onclick={confirmDelete}>Delete recipe</button>
	</div>
</rk-modal>

<style>
	.breadcrumb {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
		font-size: 0.85rem;
	}

	.breadcrumb a:hover {
		color: var(--rk-color-primary);
		text-decoration: underline;
	}

	.layout {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.hero {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
		align-items: start;
	}

	@media (max-width: 46rem) {
		.hero {
			grid-template-columns: 1fr;
		}
	}

	.hero-image {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--rk-radius-lg);
		box-shadow: var(--rk-shadow-md);
	}

	.hero-image--empty {
		display: grid;
		place-items: center;
		font-size: 4rem;
		background: var(--rk-color-surface);
		border: 1px solid var(--rk-color-border);
	}

	.hero-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.badges,
	.actions {
		gap: 0.4rem;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		font-size: 0.88rem;
	}

	.link {
		color: var(--rk-color-primary);
		font-weight: 600;
	}

	.link:hover {
		text-decoration: underline;
	}

	.columns {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
		align-items: start;
	}

	@media (max-width: 52rem) {
		.columns {
			grid-template-columns: 1fr;
		}
	}

	.section-title {
		margin-bottom: 0.75rem;
		font-size: 1rem;
		font-weight: 650;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin: 0;
		padding-left: 1.3rem;
		font-size: 0.93rem;
		line-height: 1.65;
	}

	.steps li::marker {
		color: var(--rk-color-primary);
		font-weight: 700;
	}
</style>
