import { describe, expect, h, it, render } from '@stencil/vitest';

/**
 * `rk-recipe-card` is the component the host app leans on most, so these tests
 * cover its whole contract: props in, events out, slots projected.
 */
describe('rk-recipe-card', () => {
	const baseProps = {
		recipeId: '52772',
		name: 'Teriyaki Chicken Casserole',
		thumbnail: 'https://example.com/teriyaki.jpg'
	};

	it('renders the name and thumbnail from props', async () => {
		const { root } = await render(<rk-recipe-card {...baseProps} />);
		const shadow = root.shadowRoot!;

		expect(shadow.querySelector('.title')?.textContent).toBe('Teriyaki Chicken Casserole');

		const image = shadow.querySelector('img');
		expect(image?.getAttribute('src')).toBe('https://example.com/teriyaki.jpg');
		expect(image?.getAttribute('alt')).toBe('Teriyaki Chicken Casserole');
	});

	it('falls back to a placeholder when no thumbnail is given', async () => {
		const { root } = await render(<rk-recipe-card recipeId="1" name="Mystery dish" />);
		const shadow = root.shadowRoot!;

		expect(shadow.querySelector('img')).toBeNull();
		expect(shadow.querySelector('.image--empty')).not.toBeNull();
	});

	it('reflects the favourite state on the toggle button', async () => {
		const { root, setProps, waitForChanges } = await render(
			<rk-recipe-card {...baseProps} favorite={false} />
		);

		const button = () => root.shadowRoot!.querySelector('.fav')!;

		expect(button().getAttribute('aria-pressed')).toBe('false');
		expect(button().textContent?.trim()).toBe('♡');

		await setProps({ favorite: true });
		await waitForChanges();

		expect(button().getAttribute('aria-pressed')).toBe('true');
		expect(button().textContent?.trim()).toBe('♥');
		expect(button().className).toContain('fav--on');
	});

	it('emits rkFavoriteToggle with the state the host should move to', async () => {
		const { root } = await render(<rk-recipe-card {...baseProps} favorite={false} />);

		const events: CustomEvent[] = [];
		root.addEventListener('rkFavoriteToggle', (event) => events.push(event as CustomEvent));

		root.shadowRoot!.querySelector<HTMLButtonElement>('.fav')!.click();

		expect(events).toHaveLength(1);
		expect(events[0].detail).toEqual({ recipeId: '52772', favorite: true });
	});

	it('does not also emit rkOpen when the favourite button is pressed', async () => {
		const { root } = await render(<rk-recipe-card {...baseProps} />);

		const opens: CustomEvent[] = [];
		root.addEventListener('rkOpen', (event) => opens.push(event as CustomEvent));

		root.shadowRoot!.querySelector<HTMLButtonElement>('.fav')!.click();

		expect(opens).toHaveLength(0);
	});

	it('emits rkOpen with the recipe id from the primary action', async () => {
		const { root } = await render(<rk-recipe-card {...baseProps} />);

		const opens: CustomEvent<string>[] = [];
		root.addEventListener('rkOpen', (event) => opens.push(event as CustomEvent<string>));

		root.shadowRoot!.querySelector<HTMLButtonElement>('.open')!.click();

		expect(opens).toHaveLength(1);
		expect(opens[0].detail).toBe('52772');
	});

	it('hides the favourite button when hideFavorite is set', async () => {
		const { root } = await render(<rk-recipe-card {...baseProps} hideFavorite={true} />);

		expect(root.shadowRoot!.querySelector('.fav')).toBeNull();
	});

	it('uses a custom action label', async () => {
		const { root } = await render(<rk-recipe-card {...baseProps} actionLabel="Open" />);

		expect(root.shadowRoot!.querySelector('.open')?.textContent?.trim()).toBe('Open');
	});

	it('projects content into the meta and actions slots', async () => {
		const { root } = await render(
			<rk-recipe-card {...baseProps}>
				<span slot="meta" class="probe-meta">
					Chicken
				</span>
				<button slot="actions" class="probe-action" type="button">
					Edit
				</button>
			</rk-recipe-card>
		);

		// Slotted nodes stay in the light DOM; assert they are addressable and that
		// the component really exposes matching slots to receive them.
		expect(root.querySelector('.probe-meta')?.textContent?.trim()).toBe('Chicken');
		expect(root.querySelector('.probe-action')?.textContent?.trim()).toBe('Edit');
		expect(root.shadowRoot!.querySelector('slot[name="meta"]')).not.toBeNull();
		expect(root.shadowRoot!.querySelector('slot[name="actions"]')).not.toBeNull();
	});
});
