import {autoinject} from 'aurelia-framework';

/**
 * Custom attribute that listen to keydown events to focus the element
 */
@autoinject
export class FindTargetCustomAttribute {
  private listener;

  constructor(private element: Element) {
    this.listener = this.focusSearch.bind(this);
  }

  focusSearch(e: KeyboardEvent) {
    // If pressing f3 or ctrl f
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
      e.preventDefault();
      setTimeout(() => {
        $(this.element).focus();
      }, 100);
    }
  }

  attached() {
    $(window).on('keydown', this.listener);
  }

  detached () {
    $(window).off('keydown', this.listener);
  }
}
