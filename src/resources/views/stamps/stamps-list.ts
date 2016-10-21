import {autoinject, LogManager} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {Countries} from '../countries/Countries';

const logger = LogManager.getLogger('stamp-list');

@autoinject
export class StampsList {

  constructor(
    private countryService: Countries
  ) {

  }

  activate (params, routeConfig: RouterConfiguration) {
    return new Promise((resolve, reject) => {
      // Get all countries and prefs
      // Promise.all([this.countryService.find(), this.preferenceService.find()])
    });
  }
}
