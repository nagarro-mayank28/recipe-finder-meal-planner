import { Component, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';

/**
 * Accessible dialog used for the "assign a recipe" and delete-confirmation flows.
 *
 * Visibility is fully controlled by the host through `open`; the component only
 * asks to be closed by emitting `rkClose`.
 *
 * @slot - Dialog body.
 * @slot footer - Action row pinned to the bottom of the dialog.
 */
@Component({
  tag: 'rk-modal',
  styleUrl: 'rk-modal.css',
  shadow: true,
})
export class RkModal {
  /** Whether the dialog is visible. */
  @Prop() open = false;

  /** Dialog heading, also used as its accessible name. */
  @Prop() heading = '';

  /** Hides the × button when the host wants to force a footer choice. */
  @Prop() hideCloseButton = false;

  /** Fired on backdrop click, × press, or Escape. */
  @Event() rkClose!: EventEmitter<void>;

  /** Lock background scrolling while the dialog is on screen. */
  @Watch('open')
  onOpenChange(isOpen: boolean) {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  disconnectedCallback() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  private requestClose = () => this.rkClose.emit();

  private handleBackdropClick = (event: MouseEvent) => {
    // Only close when the backdrop itself was clicked, not the dialog inside it.
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.requestClose();
    }
  };

  render() {
    if (!this.open) {
      return null;
    }

    return (
      <div class="backdrop" onClick={this.handleBackdropClick} onKeyDown={this.handleKeyDown}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label={this.heading || 'Dialog'}
          /* Makes the dialog focusable so Escape reaches our handler. */
          tabindex={-1}
          ref={el => el?.focus()}
        >
          <header class="head">
            <h2 class="heading">{this.heading}</h2>
            {!this.hideCloseButton && (
              <button type="button" class="close" aria-label="Close dialog" onClick={this.requestClose}>
                ✕
              </button>
            )}
          </header>

          <div class="body">
            <slot />
          </div>

          <footer class="foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    );
  }
}
