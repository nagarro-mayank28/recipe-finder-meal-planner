<script lang="ts">
	import { goto } from '$app/navigation';

	import RecipeForm from '$lib/components/RecipeForm.svelte';
	import { userRecipes } from '$lib/stores/userRecipes.svelte';
	import type { RecipeDraft } from '$lib/validation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let recipe = $derived(userRecipes.get(data.id));

	function save(draft: RecipeDraft) {
		const updated = userRecipes.update(data.id, draft);

		if (updated) {
			goto(`/recipes/${updated.id}`);
		}
	}
</script>

<svelte:head>
	<title>{recipe ? `Edit ${recipe.name}` : 'Edit recipe'} · Recipe Finder</title>
</svelte:head>

<div class="page stack">
	{#if !recipe}
		<rk-empty-state
			icon="🥲"
			heading="Recipe not found"
			message="It may have been deleted, or it was created in a different browser."
		>
			<a class="btn btn--primary" href="/my-recipes">Back to my recipes</a>
		</rk-empty-state>
	{:else}
		<div class="page-head">
			<div>
				<h1 class="page-title">Edit recipe</h1>
				<p class="page-subtitle">{recipe.name}</p>
			</div>
			<a class="btn btn--ghost" href={`/recipes/${recipe.id}`}>← Back to recipe</a>
		</div>

		<!--
			`key` forces a fresh form if the route changes to a different recipe,
			so the draft can never carry over from the previously edited one.
		-->
		{#key recipe.id}
			<RecipeForm
				initial={userRecipes.toDraft(recipe)}
				submitLabel="Save changes"
				categories={data.categories}
				areas={data.areas}
				onsubmit={save}
				oncancel={() => goto(`/recipes/${recipe.id}`)}
			/>
		{/key}
	{/if}
</div>
