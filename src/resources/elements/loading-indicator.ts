import * as nprogress from 'nprogress';
import {noView, autoinject, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@noView
@autoinject
export class LoadingIndicator {
  /**
   * Whether it be loading
   * @type {boolean}
   */
  @bindable loading = false;

  /**
   * Count loading
   * @type {number}
   */
  loadingCount = 0;

  constructor(private ea: EventAggregator) {
    nprogress.configure({showSpinner: false});
  }

  /**
   * Called when the element is attached into the DOM
   */
  attached() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {

  }

  /**
   * Watch for loading value changes to show/hide nprogress
   */
  loadingChanged(newValue) {
    if (newValue) {
      nprogress.start();
    }
    else {
      nprogress.done();
    }
  }
}
