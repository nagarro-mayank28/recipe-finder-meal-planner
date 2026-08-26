import { Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

/**
 * A debounced search input.
 *
 * Emits `rkSearch` while the user types (debounced) and `rkSearchSubmit` when
 * they press Enter or the search button, so hosts can choose between
 * search-as-you-type and explicit submission.
 *
 * @slot filters - Rendered next to the input, for filter controls that should
 * sit inside the search surface.
 */
@Component({
  tag: 'rk-search-bar',
  styleUrl: 'rk-search-bar.css',
  shadow: true,
})
export class RkSearchBar {
  @Element() host!: HTMLElement;

  /** Current query. Kept in sync when the host changes it (e.g. clearing a search). */
  @Prop({ mutable: true }) value = '';

  /** Placeholder text for the input. */
  @Prop() placeholder = 'Search recipes…';

  /** Milliseconds to wait after the last keystroke before emitting `rkSearch`. */
  @Prop() debounce = 350;

  /** Accessible label for the input. */
  @Prop() label = 'Search recipes';

  /** Renders a spinner in place of the search icon. */
  @Prop() loading = false;

  /** Fired after the debounce window with the current query. */
  @Event() rkSearch!: EventEmitter<string>;

  /** Fired immediately on Enter or search-button press. */
  @Event() rkSearchSubmit!: EventEmitter<string>;

  @State() private draft = '';

  private timer?: ReturnType<typeof setTimeout>;
  private input?: HTMLInputElement;

  componentWillLoad() {
    this.draft = this.value;
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  /** Keep the visible input in step with programmatic `value` changes. */
  @Watch('value')
  onValueChange(next: string) {
    if (next !== this.draft) {
      this.draft = next ?? '';
    }
  }

  private handleInput = (event: Event) => {
    const next = (event.target as HTMLInputElement).value;
    this.draft = next;
    this.value = next;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.rkSearch.emit(next), this.debounce);
  };

  private submit = () => {
    clearTimeout(this.timer);
    this.rkSearchSubmit.emit(this.draft);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  };

  private clear = () => {
    clearTimeout(this.timer);
    this.draft = '';
    this.value = '';
    this.rkSearch.emit('');
    this.input?.focus();
  };

  render() {
    return (
      <div class="bar">
        <div class="field">
          <span class="icon" aria-hidden="true">
            {this.loading ? <span class="spinner" /> : '🔍'}
          </span>

          <input
            ref={el => (this.input = el)}
            type="search"
            class="input"
            aria-label={this.label}
            placeholder={this.placeholder}
            value={this.draft}
            onInput={this.handleInput}
            onKeyDown={this.handleKeyDown}
          />

          {this.draft && (
            <button type="button" class="clear" aria-label="Clear search" onClick={this.clear}>
              ✕
            </button>
          )}
        </div>

        <slot name="filters" />

        <button type="button" class="submit" onClick={this.submit}>
          Search
        </button>
      </div>
    );
  }
}
