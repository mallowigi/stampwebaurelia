import * as nprogress from 'nprogress';
import {noView, autoinject, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EventManaged, EventNames} from '../../EventManaged';

@noView
@autoinject
export class LoadingIndicator extends EventManaged {
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
    super(ea);
    nprogress.configure({showSpinner: false});
  }

  /**
   * Called when the element is attached into the DOM
   */
  attached() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    /**
     * Everytime a xhr loading has started, increment the loading count
     */
    this.subscribe(EventNames.loadingStarted, () => {
      nprogress.start();
      this.loadingCount++;
    });

    /**
     * Everytime a xhr loading has finished, decrement the loading count
     */
    this.subscribe(EventNames.loadingFinished, () => {
      this.loadingCount--;

      if (!this.loading && this.loadingCount <= 0) {
        nprogress.done();
        this.loadingCount = 0;
      }
    })
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
