import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { RkFilterChangeDetail, RkFilterOption } from '../../interfaces';

/**
 * Labelled dropdown used to narrow a recipe list.
 *
 * `options` is an object array, so hosts must set it as a **property** rather
 * than an attribute. A JSON string is also accepted as a convenience for
 * server-rendered markup.
 */
@Component({
  tag: 'rk-filter-select',
  styleUrl: 'rk-filter-select.css',
  shadow: true,
})
export class RkFilterSelect {
  /** Echoed back in `rkFilterChange` so one handler can serve several filters. */
  @Prop() name!: string;

  /** Visible label above the control. */
  @Prop() label = '';

  /** Currently selected option value. Empty string selects the reset entry. */
  @Prop() value = '';

  /** Label for the "no filter" entry. */
  @Prop() placeholder = 'All';

  /** Choices to render. Accepts an array or a JSON-encoded array. */
  @Prop() options: RkFilterOption[] | string = [];

  /** Disables the control, e.g. while its choices are still loading. */
  @Prop() disabled = false;

  /** Fired whenever the user picks a different option. */
  @Event() rkFilterChange!: EventEmitter<RkFilterChangeDetail>;

  /**
   * Normalise `options` so the component behaves the same whether it received a
   * real array (property binding) or a JSON string (attribute binding).
   */
  private get parsedOptions(): RkFilterOption[] {
    if (Array.isArray(this.options)) {
      return this.options;
    }

    if (typeof this.options === 'string' && this.options.trim()) {
      try {
        const parsed = JSON.parse(this.options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        console.warn('[rk-filter-select] `options` was a string but not valid JSON.');
      }
    }

    return [];
  }

  private handleChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;
    this.rkFilterChange.emit({ name: this.name, value });
  };

  render() {
    return (
      <label class="wrap">
        {this.label && <span class="label">{this.label}</span>}

        <select class="select" disabled={this.disabled} onChange={this.handleChange}>
          <option value="" selected={!this.value}>
            {this.placeholder}
          </option>

          {this.parsedOptions.map(option => (
            <option key={option.value} value={option.value} selected={option.value === this.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
}
