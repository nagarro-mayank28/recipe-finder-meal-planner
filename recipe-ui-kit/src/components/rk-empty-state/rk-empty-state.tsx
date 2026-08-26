import { Component, Prop, h } from '@stencil/core';

/**
 * Placeholder shown when a list has nothing to display.
 *
 * @slot - Optional call-to-action rendered below the message, e.g. a button
 * that clears the current filters.
 */
@Component({
  tag: 'rk-empty-state',
  styleUrl: 'rk-empty-state.css',
  shadow: true,
})
export class RkEmptyState {
  /** Emoji or short glyph shown above the heading. */
  @Prop() icon = '🍳';

  /** Bold headline, e.g. `"No recipes found"`. */
  @Prop() heading = 'Nothing here yet';

  /** Supporting sentence explaining what to do next. */
  @Prop() message = '';

  render() {
    return (
      <div class="empty">
        <div class="icon" aria-hidden="true">
          {this.icon}
        </div>
        <h3 class="heading">{this.heading}</h3>
        {this.message && <p class="message">{this.message}</p>}
        <div class="action">
          <slot />
        </div>
      </div>
    );
  }
}
