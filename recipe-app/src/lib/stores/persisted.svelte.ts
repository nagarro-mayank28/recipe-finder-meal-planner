import { browser } from '$app/environment';

/**
 * A $state value mirrored into localStorage.
 *
 * Reads once on construction, writes on every assignment, so callers just use
 * `store.value`.
 *
 * There's no localStorage during SSR, so the store holds `fallback` on the
 * server and picks up the real value when the module runs in the browser. Routes
 * whose first paint depends on stored data set `ssr = false`.
 *
 * Both reads and writes are wrapped in try/catch: bad JSON shouldn't break the
 * app, and setItem throws in Safari private mode or when the quota is full.
 */
export class Persisted<T> {
	#key: string;
	#value: T = $state()!;

	/**
	 * @param key Storage key. Namespaced by the caller, e.g. `rfmp:favorites`.
	 * @param fallback Value used before hydration and whenever stored data is unusable.
	 * @param revive Optional validator that turns unknown parsed JSON into `T`.
	 */
	constructor(key: string, fallback: T, revive?: (raw: unknown) => T) {
		this.#key = key;
		this.#value = browser ? Persisted.#read(key, fallback, revive) : fallback;
	}

	static #read<T>(key: string, fallback: T, revive?: (raw: unknown) => T): T {
		try {
			const raw = localStorage.getItem(key);
			if (raw === null) return fallback;

			const parsed: unknown = JSON.parse(raw);
			return revive ? revive(parsed) : (parsed as T);
		} catch {
			console.warn(`[persisted] Ignoring unreadable value at "${key}".`);
			return fallback;
		}
	}

	get value(): T {
		return this.#value;
	}

	set value(next: T) {
		this.#value = next;
		this.#save();
	}

	/**
	 * Apply a change and persist it.
	 *
	 * `update` must return a *new* object rather than mutating in place - the
	 * assignment is what both triggers reactivity and writes to storage.
	 */
	update(mutate: (current: T) => T): void {
		this.value = mutate(this.#value);
	}

	/** Drop the stored value and return to the fallback shape. */
	reset(fallback: T): void {
		this.value = fallback;
	}

	#save(): void {
		if (!browser) return;

		try {
			localStorage.setItem(this.#key, JSON.stringify(this.#value));
		} catch {
			console.warn(`[persisted] Could not write "${this.#key}" — storage may be full or blocked.`);
		}
	}
}
