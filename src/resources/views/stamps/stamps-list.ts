import {autoinject, LogManager} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {Countries} from '../../../services/Countries';
import {Preferences} from '../../../services/Preferences';
import {EventManaged} from '../../../EventManaged';
import {EventAggregator} from 'aurelia-event-aggregator';
const logger = LogManager.getLogger('stamp-list');

@autoinject
export class StampsList extends EventManaged{

  constructor(private ea: EventAggregator,
              private countryService: Countries,
              private preferenceService: Preferences
  ) {
    super(ea);
  }

  activate (params, routeConfig: RouterConfiguration) {
    return new Promise(async (resolve, reject) => {
      // Get all countries and prefs
      let countries = await this.countryService.find();
      let preferences = await this.preferenceService.find();
      console.log(countries, preferences);
      // Promise.all([this.countryService.find(), this.preferenceService.find()])
      //   .then(([countries, preferences]) => {
      //     console.log('countries, preferences', countries, preferences);
      //   })
    });
  }
}
