<script lang="ts">
	/**
	 * Shared add / edit recipe form.
	 *
	 * Validation lives in `$lib/validation.ts`; this component only decides *when*
	 * to show the messages. Fields stay quiet until they have been touched or the
	 * form has been submitted once, so typing into a new form is not a wall of red.
	 */
	import { isValid, validateDraft, type RecipeDraft, type ValidationErrors } from '$lib/validation';

	let {
		initial,
		submitLabel = 'Save recipe',
		categories = [],
		areas = [],
		onsubmit,
		oncancel
	}: {
		initial: RecipeDraft;
		submitLabel?: string;
		/** Suggestions for the category field; the user may still type their own. */
		categories?: string[];
		areas?: string[];
		onsubmit: (draft: RecipeDraft) => void;
		oncancel: () => void;
	} = $props();

	// Deep-copy so editing the form never mutates the caller's stored recipe.
	//
	// Reading `initial` once here is the intent: the form owns its draft from then
	// on. Callers that need to reseed it (e.g. the edit route switching recipes)
	// remount the component with `{#key}`.
	// svelte-ignore state_referenced_locally
	let draft = $state<RecipeDraft>({
		...initial,
		ingredients: initial.ingredients.map((item) => ({ ...item }))
	});

	let submitted = $state(false);
	let touched = $state<Partial<Record<keyof RecipeDraft, boolean>>>({});

	let errors = $derived<ValidationErrors>(validateDraft(draft));

	/** Show a field's error only once the user has engaged with the form. */
	function errorFor(field: keyof RecipeDraft): string | undefined {
		return submitted || touched[field] ? errors[field] : undefined;
	}

	function markTouched(field: keyof RecipeDraft) {
		touched = { ...touched, [field]: true };
	}

	function addIngredient() {
		draft.ingredients = [...draft.ingredients, { name: '', measure: '' }];
	}

	function removeIngredient(index: number) {
		draft.ingredients = draft.ingredients.filter((_, i) => i !== index);

		// Always leave one row so there is somewhere to type.
		if (draft.ingredients.length === 0) {
			draft.ingredients = [{ name: '', measure: '' }];
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;

		if (!isValid(errors)) {
			// Move focus to the first problem so keyboard and screen-reader users
			// are not left guessing why nothing happened.
			const firstField = Object.keys(errors)[0];
			document.querySelector<HTMLElement>(`[data-field="${firstField}"]`)?.focus();
			return;
		}

		onsubmit(draft);
	}
</script>

<form class="form" novalidate onsubmit={handleSubmit}>
	<div class="panel stack-sm">
		<h2 class="section-title">Basics</h2>

		<label class="field">
			<span class="field-label">Recipe name <span class="req">*</span></span>
			<input
				class="input"
				class:input--invalid={errorFor('name')}
				data-field="name"
				type="text"
				bind:value={draft.name}
				onblur={() => markTouched('name')}
				placeholder="Grandma’s butter chicken"
				aria-invalid={errorFor('name') ? 'true' : undefined}
				aria-describedby={errorFor('name') ? 'err-name' : undefined}
			/>
			{#if errorFor('name')}
				<span class="error" id="err-name">{errorFor('name')}</span>
			{/if}
		</label>

		<div class="grid-2">
			<label class="field">
				<span class="field-label">Category <span class="req">*</span></span>
				<input
					class="input"
					class:input--invalid={errorFor('category')}
					data-field="category"
					type="text"
					list="category-options"
					bind:value={draft.category}
					onblur={() => markTouched('category')}
					placeholder="Chicken"
					aria-invalid={errorFor('category') ? 'true' : undefined}
				/>
				<datalist id="category-options">
					{#each categories as option (option)}
						<option value={option}></option>
					{/each}
				</datalist>
				{#if errorFor('category')}
					<span class="error">{errorFor('category')}</span>
				{/if}
			</label>

			<label class="field">
				<span class="field-label">Cuisine <span class="req">*</span></span>
				<input
					class="input"
					class:input--invalid={errorFor('area')}
					data-field="area"
					type="text"
					list="area-options"
					bind:value={draft.area}
					onblur={() => markTouched('area')}
					placeholder="Indian"
					aria-invalid={errorFor('area') ? 'true' : undefined}
				/>
				<datalist id="area-options">
					{#each areas as option (option)}
						<option value={option}></option>
					{/each}
				</datalist>
				{#if errorFor('area')}
					<span class="error">{errorFor('area')}</span>
				{/if}
			</label>
		</div>

		<label class="field">
			<span class="field-label">Image URL</span>
			<input
				class="input"
				class:input--invalid={errorFor('thumbnail')}
				data-field="thumbnail"
				type="url"
				bind:value={draft.thumbnail}
				onblur={() => markTouched('thumbnail')}
				placeholder="https://example.com/photo.jpg"
			/>
			<span class="hint">Optional. Leave blank and a placeholder is used.</span>
			{#if errorFor('thumbnail')}
				<span class="error">{errorFor('thumbnail')}</span>
			{/if}
		</label>

		<label class="field">
			<span class="field-label">Tags</span>
			<input
				class="input"
				type="text"
				bind:value={draft.tags}
				placeholder="spicy, weeknight, one-pot"
			/>
			<span class="hint">Optional, comma separated.</span>
		</label>
	</div>

	<div class="panel stack-sm">
		<div class="section-head">
			<h2 class="section-title">
				Ingredients <span class="req">*</span>
			</h2>
			<button class="btn btn--ghost btn--sm" type="button" onclick={addIngredient}>
				+ Add ingredient
			</button>
		</div>

		{#if errorFor('ingredients')}
			<p class="error" data-field="ingredients">{errorFor('ingredients')}</p>
		{/if}

		<ul class="ingredients">
			{#each draft.ingredients as ingredient, index (index)}
				<li class="ingredient-row">
					<input
						class="input"
						type="text"
						bind:value={ingredient.name}
						onblur={() => markTouched('ingredients')}
						placeholder="Ingredient"
						aria-label={`Ingredient ${index + 1} name`}
					/>
					<input
						class="input"
						type="text"
						bind:value={ingredient.measure}
						placeholder="Measure"
						aria-label={`Ingredient ${index + 1} measure`}
					/>
					<button
						class="btn btn--ghost btn--sm remove"
						type="button"
						onclick={() => removeIngredient(index)}
						aria-label={`Remove ingredient ${index + 1}`}
						disabled={draft.ingredients.length === 1 && !ingredient.name && !ingredient.measure}
					>
						✕
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<div class="panel stack-sm">
		<h2 class="section-title">Instructions <span class="req">*</span></h2>
		<label class="field">
			<span class="sr-only">Instructions</span>
			<textarea
				class="input textarea"
				class:input--invalid={errorFor('instructions')}
				data-field="instructions"
				rows="9"
				bind:value={draft.instructions}
				onblur={() => markTouched('instructions')}
				placeholder={'Put one step per line.\n\nHeat oil in a pan.\nAdd the onions and cook until golden.'}
				aria-invalid={errorFor('instructions') ? 'true' : undefined}
			></textarea>
			<span class="hint">One step per line — each line becomes a numbered step.</span>
			{#if errorFor('instructions')}
				<span class="error">{errorFor('instructions')}</span>
			{/if}
		</label>
	</div>

	<div class="form-actions">
		<button class="btn btn--ghost" type="button" onclick={oncancel}>Cancel</button>
		<button class="btn btn--primary" type="submit">{submitLabel}</button>
	</div>

	{#if submitted && !isValid(errors)}
		<p class="form-error" role="alert">
			Please fix the {Object.keys(errors).length}
			{Object.keys(errors).length === 1 ? 'field' : 'fields'} highlighted above.
		</p>
	{/if}
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.stack-sm {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 650;
	}

	.req {
		color: var(--rk-color-danger);
		font-weight: 700;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.field-label {
		font-size: 0.75rem;
		font-weight: 650;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--rk-color-muted);
	}

	.input {
		width: 100%;
		padding: 0.6rem 0.75rem;
		font: inherit;
		font-size: 0.92rem;
		color: var(--rk-color-text);
		background: var(--rk-color-surface);
		border: 1px solid var(--rk-color-border);
		border-radius: var(--rk-radius-md);
	}

	.input:focus-visible {
		outline: none;
		box-shadow: var(--rk-focus-ring);
	}

	.input--invalid {
		border-color: var(--rk-color-danger);
		background: var(--rk-color-danger-soft);
	}

	.textarea {
		resize: vertical;
		line-height: 1.6;
	}

	.grid-2 {
		display: grid;
		gap: 0.9rem;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
	}

	.hint {
		font-size: 0.78rem;
		color: var(--rk-color-muted);
	}

	.error {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--rk-color-danger);
	}

	.ingredients {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ingredient-row {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) auto;
		align-items: center;
	}

	.remove {
		padding: 0.45rem 0.6rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
	}

	.form-error {
		padding: 0.7rem 0.9rem;
		font-size: 0.86rem;
		font-weight: 600;
		color: var(--rk-color-danger);
		background: var(--rk-color-danger-soft);
		border-radius: var(--rk-radius-md);
	}
</style>
