import { Component, Prop, h } from '@stencil/core';

/**
 * Small pill used for recipe categories, cuisines and tags.
 *
 * @slot - Badge content. Falls back to the `label` prop when empty.
 */
@Component({
  tag: 'rk-badge',
  styleUrl: 'rk-badge.css',
  shadow: true,
})
export class RkBadge {
  /** Text to render when no slotted content is provided. */
  @Prop() label = '';

  /** Visual treatment of the pill. */
  @Prop() variant: 'neutral' | 'primary' | 'danger' = 'neutral';

  render() {
    return (
      <span class={`badge badge--${this.variant}`}>
        <slot>{this.label}</slot>
      </span>
    );
  }
}
