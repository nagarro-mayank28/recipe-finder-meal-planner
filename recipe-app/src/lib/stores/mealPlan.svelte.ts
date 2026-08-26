import { Persisted } from './persisted.svelte';
import { DAYS, MEALS, type Day, type Meal, type MealPlan, type PlannedMeal, type RecipeSummary } from '$lib/types';

const STORAGE_KEY = 'rfmp:meal-plan';

const DAY_SET = new Set<string>(DAYS);
const MEAL_SET = new Set<string>(MEALS);

/**
 * Keep only day/meal keys the app still knows about, so a plan saved before a
 * schema change cannot inject unrenderable slots into the grid.
 */
function revive(raw: unknown): MealPlan {
	if (!raw || typeof raw !== 'object') return {};

	const plan: MealPlan = {};

	for (const [day, meals] of Object.entries(raw as Record<string, unknown>)) {
		if (!DAY_SET.has(day) || !meals || typeof meals !== 'object') continue;

		const dayEntry: Partial<Record<Meal, PlannedMeal>> = {};

		for (const [meal, value] of Object.entries(meals as Record<string, unknown>)) {
			if (!MEAL_SET.has(meal) || !value || typeof value !== 'object') continue;

			const entry = value as Partial<PlannedMeal>;
			if (typeof entry.recipeId !== 'string' || typeof entry.name !== 'string') continue;

			dayEntry[meal as Meal] = {
				recipeId: entry.recipeId,
				name: entry.name,
				thumbnail: typeof entry.thumbnail === 'string' ? entry.thumbnail : '',
				origin: entry.origin === 'user' ? 'user' : 'mealdb'
			};
		}

		if (Object.keys(dayEntry).length > 0) {
			plan[day as Day] = dayEntry;
		}
	}

	return plan;
}

class MealPlanStore {
	#store = new Persisted<MealPlan>(STORAGE_KEY, {}, revive);

	get plan(): MealPlan {
		return this.#store.value;
	}

	/** How many slots are filled across the week. Drives the empty state. */
	get plannedCount(): number {
		return Object.values(this.#store.value).reduce(
			(total, meals) => total + Object.keys(meals ?? {}).length,
			0
		);
	}

	get(day: Day, meal: Meal): PlannedMeal | undefined {
		return this.#store.value[day]?.[meal];
	}

	/** Assign a recipe to a slot, replacing whatever was there. */
	assign(day: Day, meal: Meal, recipe: RecipeSummary): void {
		const entry: PlannedMeal = {
			recipeId: recipe.id,
			name: recipe.name,
			thumbnail: recipe.thumbnail,
			origin: recipe.origin
		};

		this.#store.update((current) => ({
			...current,
			[day]: { ...current[day], [meal]: entry }
		}));
	}

	/** Clear a single slot, pruning the day when it becomes empty. */
	remove(day: Day, meal: Meal): void {
		this.#store.update((current) => {
			const dayEntry = current[day];
			if (!dayEntry) return current;

			const { [meal]: _removed, ...remainingMeals } = dayEntry;

			if (Object.keys(remainingMeals).length === 0) {
				const { [day]: _emptyDay, ...remainingDays } = current;
				return remainingDays;
			}

			return { ...current, [day]: remainingMeals };
		});
	}

	/**
	 * Drop every slot holding a given recipe.
	 *
	 * Called when a user recipe is deleted, so the week cannot keep pointing at a
	 * recipe whose details page no longer resolves.
	 */
	removeRecipe(recipeId: string): void {
		this.#store.update((current) => {
			const next: MealPlan = {};

			for (const [day, meals] of Object.entries(current)) {
				const kept = Object.entries(meals ?? {}).filter(
					([, entry]) => entry?.recipeId !== recipeId
				);

				if (kept.length > 0) {
					next[day as Day] = Object.fromEntries(kept) as Partial<Record<Meal, PlannedMeal>>;
				}
			}

			return next;
		});
	}

	/** Move a planned meal to another slot; used by the "change day" flow. */
	move(from: { day: Day; meal: Meal }, to: { day: Day; meal: Meal }): void {
		const entry = this.get(from.day, from.meal);
		if (!entry) return;

		this.remove(from.day, from.meal);
		this.#store.update((current) => ({
			...current,
			[to.day]: { ...current[to.day], [to.meal]: entry }
		}));
	}

	/** Wipe the whole week. */
	clear(): void {
		this.#store.reset({});
	}

	/** Every recipe id currently planned, for "already in your week" hints. */
	get plannedRecipeIds(): Set<string> {
		const ids = new Set<string>();

		for (const meals of Object.values(this.#store.value)) {
			for (const entry of Object.values(meals ?? {})) {
				if (entry) ids.add(entry.recipeId);
			}
		}

		return ids;
	}
}

export const mealPlan = new MealPlanStore();
