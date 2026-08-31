<script lang="ts">
	/**
	 * "Move this meal somewhere else" dialog used by the planner.
	 *
	 * The counterpart to `PlanSlotDialog`: that one places a recipe into a slot,
	 * this one relocates a meal that is already planned. Together they cover the
	 * "modify a planned meal" half of the planner — changing which recipe sits in
	 * a slot goes through `RecipePickerDialog` instead.
	 *
	 * Built on `rk-modal`: body in the default slot, buttons in `footer`, closing
	 * driven by its `rkClose` event.
	 */
	import { mealPlan } from '$lib/stores/mealPlan.svelte';
	import { DAYS, MEALS, titleCase, type Day, type Meal } from '$lib/types';

	let {
		from,
		open = $bindable(false)
	}: {
		/** Slot being moved out of. `null` keeps the dialog closed. */
		from: { day: Day; meal: Meal } | null;
		open?: boolean;
	} = $props();

	let day = $state<Day>('monday');
	let meal = $state<Meal>('dinner');

	// Re-seed the selects whenever a different slot is picked, so the dialog opens
	// showing where the meal currently is rather than a stale choice.
	$effect(() => {
		if (from) {
			day = from.day;
			meal = from.meal;
		}
	});

	let moving = $derived(from ? mealPlan.get(from.day, from.meal) : undefined);

	/** What the destination already holds — `move` overwrites it, so say so. */
	let occupant = $derived(mealPlan.get(day, meal));

	let unchanged = $derived(Boolean(from && from.day === day && from.meal === meal));

	function close() {
		open = false;
	}

	function confirm() {
		if (!from || unchanged) return;

		mealPlan.move(from, { day, meal });
		close();
	}
</script>

<rk-modal
	open={open}
	heading={from ? `Move ${titleCase(from.day)} ${from.meal}` : 'Move meal'}
	onrkClose={close}
>
	{#if moving}
		<div class="body">
			<p class="lead">
				Move <strong>{moving.name}</strong> to a different slot.
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

			{#if unchanged}
				<p class="notice" role="status">
					That's where this meal already is — pick a different day or meal.
				</p>
			{:else if occupant}
				<p class="notice" role="status">
					{titleCase(day)} {meal} currently holds <strong>{occupant.name}</strong> — moving here
					will replace it.
				</p>
			{/if}
		</div>
	{/if}

	<div slot="footer" class="row">
		<button class="btn btn--ghost" type="button" onclick={close}>Cancel</button>
		<button
			class="btn btn--primary"
			type="button"
			onclick={confirm}
			disabled={!moving || unchanged}
		>
			{occupant && !unchanged ? 'Replace meal' : 'Move meal'}
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

	.notice {
		margin: 0;
		padding: 0.6rem 0.75rem;
		font-size: 0.85rem;
		color: var(--rk-color-text);
		background: var(--rk-color-surface-alt);
		border-radius: var(--rk-radius-md);
	}
</style>
