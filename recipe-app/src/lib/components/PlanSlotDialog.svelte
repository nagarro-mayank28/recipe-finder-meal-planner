<script lang="ts">
	/**
	 * "Add to meal plan" dialog: given a recipe, pick the day and meal.
	 *
	 * Built on `rk-modal` from the component library - the day/meal form goes in
	 * its default slot and the buttons into its `footer` slot, and closing is
	 * driven entirely by its `rkClose` event.
	 */
	import { mealPlan } from '$lib/stores/mealPlan.svelte';
	import { DAYS, MEALS, titleCase, type Day, type Meal, type RecipeSummary } from '$lib/types';

	let {
		recipe,
		open = $bindable(false)
	}: {
		/** Recipe to place. `null` keeps the dialog closed. */
		recipe: RecipeSummary | null;
		open?: boolean;
	} = $props();

	let day = $state<Day>('monday');
	let meal = $state<Meal>('dinner');
	let saved = $state(false);

	/** What the chosen slot already holds, so the user knows they'd replace it. */
	let occupant = $derived(mealPlan.get(day, meal));

	function close() {
		open = false;
		saved = false;
	}

	function confirm() {
		if (!recipe) return;

		mealPlan.assign(day, meal, recipe);
		saved = true;

		// Leave the confirmation on screen briefly so the action feels acknowledged.
		setTimeout(close, 900);
	}
</script>

<rk-modal open={open} heading="Add to meal plan" onrkClose={close}>
	{#if recipe}
		<div class="body">
			<p class="lead">
				Where should <strong>{recipe.name}</strong> go?
			</p>

			<div class="fields">
				<label class="field">
					<span class="field-label">Day</span>
					<select class="select" bind:value={day}>
						{#each DAYS as option (option)}
							<option value={option}>{titleCase(option)}</option>
						{/each}
					</select>
				</label>

				<label class="field">
					<span class="field-label">Meal</span>
					<select class="select" bind:value={meal}>
						{#each MEALS as option (option)}
							<option value={option}>{titleCase(option)}</option>
						{/each}
					</select>
				</label>
			</div>

			{#if occupant}
				<p class="notice" role="status">
					{titleCase(day)} {meal} currently holds <strong>{occupant.name}</strong> — saving will
					replace it.
				</p>
			{/if}

			{#if saved}
				<p class="saved" role="status">✓ Added to {titleCase(day)} {meal}.</p>
			{/if}
		</div>
	{/if}

	<!-- Projected into the modal's `footer` slot. -->
	<div slot="footer" class="row">
		<button class="btn btn--ghost" type="button" onclick={close}>Cancel</button>
		<button class="btn btn--primary" type="button" onclick={confirm} disabled={!recipe || saved}>
			{occupant ? 'Replace meal' : 'Add to plan'}
		</button>
	</div>
</rk-modal>

<style>
	.body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.lead {
		font-size: 0.94rem;
		line-height: 1.5;
	}

	.fields {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.field-label {
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--rk-color-muted);
	}

	.select {
		padding: 0.55rem 0.7rem;
		font: inherit;
		color: var(--rk-color-text);
		background: var(--rk-color-surface);
		border: 1px solid var(--rk-color-border);
		border-radius: var(--rk-radius-md);
	}

	.select:focus-visible {
		outline: none;
		box-shadow: var(--rk-focus-ring);
	}

	.notice,
	.saved {
		margin: 0;
		padding: 0.6rem 0.75rem;
		font-size: 0.85rem;
		border-radius: var(--rk-radius-md);
	}

	.notice {
		color: var(--rk-color-text);
		background: var(--rk-color-surface-alt);
	}

	.saved {
		color: var(--rk-color-primary);
		background: var(--rk-color-primary-soft);
		font-weight: 600;
	}
</style>
