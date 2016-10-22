import {autoinject, LogManager} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {Countries} from '../../../services/Countries';
import {Preferences} from '../../../services/Preferences';
import {EventManaged} from '../../../EventManaged';
import {EventAggregator} from 'aurelia-event-aggregator';

import * as _ from 'lodash';
import {Country} from '../../../services/Country';
import {Preference} from '../../../services/Preference';

const logger = LogManager.getLogger('stamp-list');

@autoinject
export class StampsList extends EventManaged {

  countries: Country[] = [];
  preferences: Preference[] = [];

  constructor(private ea: EventAggregator,
              private countryService: Countries,
              private preferenceService: Preferences) {
    super(ea);
  }

  activate(params, routeConfig: RouterConfiguration) {
    return new Promise(async(resolve, reject) => {
      // Get all countries and prefs
      let countries = await this.countryService.find();
      let preferences = await this.preferenceService.find();

      this.countries = this.countryService.get(countries);
      this.preferences = this.countryService.get(preferences);
      resolve();
    });
  }
}
