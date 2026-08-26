import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { RkMealSlotDetail } from '../../interfaces';

/**
 * One cell of the weekly planner grid: either an assigned recipe or an empty
 * "add" target.
 *
 * @slot - Extra content shown under an assigned recipe, e.g. a serving-count
 * badge.
 */
@Component({
  tag: 'rk-meal-slot',
  styleUrl: 'rk-meal-slot.css',
  shadow: true,
})
export class RkMealSlot {
  /** Day key echoed back in every event, e.g. `"monday"`. */
  @Prop() day!: string;

  /** Meal key echoed back in every event, e.g. `"dinner"`. */
  @Prop() meal!: string;

  /** Label for the meal, defaults to a title-cased `meal`. */
  @Prop() mealLabel = '';

  /** Id of the assigned recipe. Empty renders the add-target state. */
  @Prop() recipeId = '';

  /** Title of the assigned recipe. */
  @Prop() recipeName = '';

  /** Thumbnail of the assigned recipe. */
  @Prop() recipeThumbnail = '';

  /** Fired when an empty slot is activated - the host should open a picker. */
  @Event() rkAssign!: EventEmitter<RkMealSlotDetail>;

  /** Fired when the remove button on a filled slot is pressed. */
  @Event() rkRemove!: EventEmitter<RkMealSlotDetail>;

  /** Fired when an assigned recipe is activated - the host should navigate. */
  @Event() rkOpen!: EventEmitter<RkMealSlotDetail>;

  private get detail(): RkMealSlotDetail {
    return {
      day: this.day,
      meal: this.meal,
      ...(this.recipeId ? { recipeId: this.recipeId } : {}),
    };
  }

  private get displayLabel(): string {
    if (this.mealLabel) {
      return this.mealLabel;
    }
    return this.meal ? this.meal.charAt(0).toUpperCase() + this.meal.slice(1) : '';
  }

  private handleAssign = () => this.rkAssign.emit(this.detail);

  private handleOpen = () => this.rkOpen.emit(this.detail);

  private handleRemove = (event: MouseEvent) => {
    event.stopPropagation();
    this.rkRemove.emit(this.detail);
  };

  private renderEmpty() {
    return (
      <button type="button" class="slot slot--empty" onClick={this.handleAssign}>
        <span class="label">{this.displayLabel}</span>
        <span class="plus" aria-hidden="true">
          +
        </span>
        <span class="hint">Add recipe</span>
      </button>
    );
  }

  private renderFilled() {
    return (
      <div class="slot slot--filled">
        <span class="label">{this.displayLabel}</span>

        <button type="button" class="recipe" onClick={this.handleOpen}>
          {this.recipeThumbnail && (
            <img class="thumb" src={this.recipeThumbnail} alt="" loading="lazy" aria-hidden="true" />
          )}
          <span class="name">{this.recipeName}</span>
        </button>

        <slot />

        <button
          type="button"
          class="remove"
          aria-label={`Remove ${this.recipeName} from ${this.day} ${this.displayLabel}`}
          onClick={this.handleRemove}
        >
          ✕
        </button>
      </div>
    );
  }

  render() {
    return this.recipeId ? this.renderFilled() : this.renderEmpty();
  }
}
