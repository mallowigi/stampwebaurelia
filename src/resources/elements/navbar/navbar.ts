import {autoinject, LogManager, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Router} from 'aurelia-router';

const logger = LogManager.getLogger('navbar');

@autoinject
export class Navbar {
  @bindable router: Router;

  constructor(private ea: EventAggregator) {

  }
}
