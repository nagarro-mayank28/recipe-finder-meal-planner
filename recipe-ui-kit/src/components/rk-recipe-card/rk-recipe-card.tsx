import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { RkFavoriteToggleDetail } from '../../interfaces';

/**
 * Presentational card for a single recipe.
 *
 * The card owns no state: the host decides whether it is favourited and reacts
 * to `rkFavoriteToggle` / `rkOpen`.
 *
 * @slot meta - Extra metadata under the title, e.g. `<rk-badge>` chips.
 * @slot actions - Trailing actions in the footer, e.g. Edit / Delete buttons
 * for recipes the user owns.
 */
@Component({
  tag: 'rk-recipe-card',
  styleUrl: 'rk-recipe-card.css',
  shadow: true,
})
export class RkRecipeCard {
  /** Identifier passed back in every emitted event. */
  @Prop() recipeId!: string;

  /** Recipe title shown as the card heading. */
  @Prop() name = '';

  /** Thumbnail URL. A placeholder is drawn when omitted. */
  @Prop() thumbnail = '';

  /** Whether the recipe is currently favourited (drives the heart icon). */
  @Prop() favorite = false;

  /** Hides the favourite button entirely, for read-only contexts. */
  @Prop() hideFavorite = false;

  /** Text of the primary call-to-action. */
  @Prop() actionLabel = 'View recipe';

  /** Fired when the favourite button is pressed, with the desired next state. */
  @Event() rkFavoriteToggle!: EventEmitter<RkFavoriteToggleDetail>;

  /** Fired when the card or its primary action is activated. */
  @Event() rkOpen!: EventEmitter<string>;

  private toggleFavorite = (event: MouseEvent) => {
    // Keep the click from also triggering the card-level `rkOpen`.
    event.stopPropagation();
    this.rkFavoriteToggle.emit({ recipeId: this.recipeId, favorite: !this.favorite });
  };

  private open = () => this.rkOpen.emit(this.recipeId);

  render() {
    return (
      <article class="card">
        <div class="media">
          {this.thumbnail ? (
            <img class="image" src={this.thumbnail} alt={this.name} loading="lazy" />
          ) : (
            <div class="image image--empty" aria-hidden="true">
              🍽️
            </div>
          )}

          {!this.hideFavorite && (
            <button
              type="button"
              class={{ fav: true, 'fav--on': this.favorite }}
              aria-pressed={String(this.favorite)}
              aria-label={this.favorite ? `Remove ${this.name} from favourites` : `Add ${this.name} to favourites`}
              onClick={this.toggleFavorite}
            >
              {this.favorite ? '♥' : '♡'}
            </button>
          )}
        </div>

        <div class="body">
          <h3 class="title">{this.name}</h3>
          <div class="meta">
            <slot name="meta" />
          </div>
        </div>

        <footer class="footer">
          <button type="button" class="open" onClick={this.open}>
            {this.actionLabel}
          </button>
          <div class="actions">
            <slot name="actions" />
          </div>
        </footer>
      </article>
    );
  }
}
