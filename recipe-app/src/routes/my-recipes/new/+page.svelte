<script lang="ts">
	import { goto } from '$app/navigation';

	import RecipeForm from '$lib/components/RecipeForm.svelte';
	import { userRecipes } from '$lib/stores/userRecipes.svelte';
	import { emptyDraft, type RecipeDraft } from '$lib/validation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function save(draft: RecipeDraft) {
		const recipe = userRecipes.create(draft);
		// Land on the new recipe so the user sees the result of their work.
		goto(`/recipes/${recipe.id}`);
	}
</script>

<svelte:head>
	<title>New recipe · Recipe Finder</title>
</svelte:head>

<div class="page stack">
	<div class="page-head">
		<div>
			<h1 class="page-title">New recipe</h1>
			<p class="page-subtitle">Fields marked with * are required.</p>
		</div>
		<a class="btn btn--ghost" href="/my-recipes">← Back to my recipes</a>
	</div>

	<RecipeForm
		initial={emptyDraft()}
		submitLabel="Save recipe"
		categories={data.categories}
		areas={data.areas}
		onsubmit={save}
		oncancel={() => goto('/my-recipes')}
	/>
</div>
