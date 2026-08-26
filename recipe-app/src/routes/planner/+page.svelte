<script lang="ts">
	import { goto } from '$app/navigation';

	import RecipePickerDialog from '$lib/components/RecipePickerDialog.svelte';
	import { mealPlan } from '$lib/stores/mealPlan.svelte';
	import { DAYS, MEALS, titleCase, type Day, type Meal, type RecipeSummary } from '$lib/types';
	import type { RkMealSlotDetail } from '@mayank_singh28/recipe-ui-kit';

	let pickerSlot = $state<{ day: Day; meal: Meal } | null>(null);
	let pickerOpen = $state(false);
	let clearOpen = $state(false);

	/** `rkAssign` from an empty slot - open the picker for that day and meal. */
	function handleAssign(event: CustomEvent<RkMealSlotDetail>) {
		const { day, meal } = event.detail;
		pickerSlot = { day: day as Day, meal: meal as Meal };
		pickerOpen = true;
	}

	function handleRemove(event: CustomEvent<RkMealSlotDetail>) {
		const { day, meal } = event.detail;
		mealPlan.remove(day as Day, meal as Meal);
	}

	function handleOpen(event: CustomEvent<RkMealSlotDetail>) {
		if (event.detail.recipeId) {
			goto(`/recipes/${event.detail.recipeId}`);
		}
	}

	function assignPicked(recipe: RecipeSummary) {
		if (!pickerSlot) return;
		mealPlan.assign(pickerSlot.day, pickerSlot.meal, recipe);
	}

	function clearWeek() {
		mealPlan.clear();
		clearOpen = false;
	}

	/** Distinct recipes in the week - a rough "how varied is this plan" signal. */
	let uniqueCount = $derived(mealPlan.plannedRecipeIds.size);
</script>

<svelte:head>
	<title>Weekly planner · Recipe Finder</title>
</svelte:head>

<div class="page stack">
	<div class="page-head">
		<div>
			<h1 class="page-title">Weekly meal planner</h1>
			<p class="page-subtitle">
				{mealPlan.plannedCount === 0
					? 'Tap any slot to assign a recipe.'
					: `${mealPlan.plannedCount} of ${DAYS.length * MEALS.length} slots filled · ${uniqueCount} distinct ${uniqueCount === 1 ? 'recipe' : 'recipes'}.`}
			</p>
		</div>

		{#if mealPlan.plannedCount > 0}
			<button class="btn btn--danger" type="button" onclick={() => (clearOpen = true)}>
				Clear week
			</button>
		{/if}
	</div>

	<!--
		One `rk-meal-slot` per day/meal cell. Each cell gets primitive props as
		kebab-case attributes and reports back through its three custom events —
		the component holds no state of its own.
	-->
	<!--
		A CSS grid rather than an ARIA table: each slot already announces its own
		day and meal through its accessible labels, so a partial table role would
		add noise without adding navigation.
	-->
	<section class="planner" aria-label="Weekly meal plan">
		<div class="planner-head" aria-hidden="true">
			<span class="corner"></span>
			{#each MEALS as meal (meal)}
				<span class="col-label">{titleCase(meal)}</span>
			{/each}
		</div>

		{#each DAYS as day (day)}
			<div class="planner-row">
				<h2 class="day-label">
					<span class="day-full">{titleCase(day)}</span>
					<span class="day-short" aria-hidden="true">{titleCase(day).slice(0, 3)}</span>
				</h2>

				{#each MEALS as meal (meal)}
					{@const planned = mealPlan.get(day, meal)}
					<div class="cell">
						<rk-meal-slot
							day={day}
							meal={meal}
							meal-label={titleCase(meal)}
							recipe-id={planned?.recipeId ?? ''}
							recipe-name={planned?.name ?? ''}
							recipe-thumbnail={planned?.thumbnail ?? ''}
							onrkAssign={handleAssign}
							onrkRemove={handleRemove}
							onrkOpen={handleOpen}
						>
							{#if planned?.origin === 'user'}
								<rk-badge variant="danger" label="Yours"></rk-badge>
							{/if}
						</rk-meal-slot>
					</div>
				{/each}
			</div>
		{/each}
	</section>

	{#if mealPlan.plannedCount === 0}
		<rk-empty-state
			icon="🗓️"
			heading="Your week is empty"
			message="Assign recipes from your favourites, your own recipes, or a fresh search."
		>
			<a class="btn btn--primary" href="/">Find recipes</a>
		</rk-empty-state>
	{/if}
</div>

<!-- Named `target`, not `slot`: `slot` is reserved for slot projection in Svelte. -->
<RecipePickerDialog target={pickerSlot} bind:open={pickerOpen} onpick={assignPicked} />

<rk-modal open={clearOpen} heading="Clear the whole week?" onrkClose={() => (clearOpen = false)}>
	<p>
		All {mealPlan.plannedCount} planned {mealPlan.plannedCount === 1 ? 'meal' : 'meals'} will be
		removed. Your favourites and recipes are not affected.
	</p>

	<div slot="footer" class="row">
		<button class="btn btn--ghost" type="button" onclick={() => (clearOpen = false)}>Cancel</button>
		<button class="btn btn--danger" type="button" onclick={clearWeek}>Clear week</button>
	</div>
</rk-modal>

<style>
	.planner {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.planner-head,
	.planner-row {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 5.5rem repeat(3, minmax(0, 1fr));
		align-items: stretch;
	}

	.col-label {
		padding: 0 0.6rem;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--rk-color-muted);
	}

	.day-label {
		display: flex;
		align-items: center;
		font-size: 0.85rem;
		font-weight: 650;
		color: var(--rk-color-text);
	}

	.day-short {
		display: none;
	}

	.cell {
		min-width: 0;
	}

	/* Below this width the three-column grid stops being readable, so each day
	   becomes a stacked card instead. */
	@media (max-width: 44rem) {
		.planner-head {
			display: none;
		}

		.planner-row {
			grid-template-columns: 1fr;
			gap: 0.4rem;
			padding: 0.75rem;
			background: var(--rk-color-surface);
			border: 1px solid var(--rk-color-border);
			border-radius: var(--rk-radius-lg);
		}

		.day-label {
			margin-bottom: 0.2rem;
		}

		.day-full {
			display: inline;
		}
	}
</style>
