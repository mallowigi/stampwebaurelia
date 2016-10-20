import {inject} from 'aurelia-framework'
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class EventManaged {
  _subscribers: Array<Subscription[]> = [];

  constructor (private eventBus: EventAggregator) {

  }

  /**
   * Add a subscriber to a given event
   * @param event
   * @param handler
   */
  subscribe(event, handler) {
    if (!this._subscribers[event]) {
      this._subscribers[event] = [];
    }

    this._subscribers[event].push( this.eventBus.subscribe(event, handler));
  }

  unsubscribe(event) {
    this._subscribers[event].forEach(sub => sub.dispose);
  }

  /**
   * When the element is detached
   */
  detached () {
    this._subscribers.forEach(event => this.unsubscribe);
  }
}

/**
 * List of events
 */
export const EventNames = {
  loadingStarted: 'loadingStarted',
  loadingFinished: 'loadingFinished'
};

/**
 * List of Storage Keys
 */
export const StorageKeys = {

};

/**
 * KeyCodes
 */
export const KeyCodes = {
  VK_TAB: 9,
  VK_ENTER: 13,
  VK_ESCAPE: 27,
  VK_SHIFT: 16
};
