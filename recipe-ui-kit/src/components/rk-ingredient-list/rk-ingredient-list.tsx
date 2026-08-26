import { Component, Prop, State, h } from '@stencil/core';
import type { RkIngredient } from '../../interfaces';

/**
 * Checklist of ingredients for the recipe details page.
 *
 * `items` is an object array, so hosts set it as a **property**. A JSON string
 * is accepted as well. Ticking a row is local UI state - a shopping aid - so it
 * deliberately emits nothing.
 *
 * @slot header - Content shown to the right of the heading, e.g. a servings badge.
 */
@Component({
  tag: 'rk-ingredient-list',
  styleUrl: 'rk-ingredient-list.css',
  shadow: true,
})
export class RkIngredientList {
  /** Section heading. */
  @Prop() heading = 'Ingredients';

  /** Ingredients to render. Accepts an array or a JSON-encoded array. */
  @Prop() items: RkIngredient[] | string = [];

  /** Renders checkboxes so the list doubles as a shopping list. */
  @Prop() checkable = true;

  @State() private checked: Record<number, boolean> = {};

  private get parsedItems(): RkIngredient[] {
    if (Array.isArray(this.items)) {
      return this.items;
    }

    if (typeof this.items === 'string' && this.items.trim()) {
      try {
        const parsed = JSON.parse(this.items);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        console.warn('[rk-ingredient-list] `items` was a string but not valid JSON.');
      }
    }

    return [];
  }

  private toggle(index: number) {
    // Replace the object so Stencil sees a new @State reference.
    this.checked = { ...this.checked, [index]: !this.checked[index] };
  }

  render() {
    const items = this.parsedItems;

    return (
      <section class="wrap">
        <header class="head">
          <h2 class="heading">{this.heading}</h2>
          <slot name="header" />
        </header>

        {items.length === 0 ? (
          <p class="empty">No ingredients listed for this recipe.</p>
        ) : (
          <ul class="list">
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`} class={{ row: true, 'row--done': !!this.checked[index] }}>
                {this.checkable ? (
                  <label class="control">
                    <input
                      type="checkbox"
                      class="box"
                      checked={!!this.checked[index]}
                      onChange={() => this.toggle(index)}
                    />
                    <span class="name">{item.name}</span>
                    {item.measure && <span class="measure">{item.measure}</span>}
                  </label>
                ) : (
                  <div class="control">
                    <span class="bullet" aria-hidden="true">
                      •
                    </span>
                    <span class="name">{item.name}</span>
                    {item.measure && <span class="measure">{item.measure}</span>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }
}
