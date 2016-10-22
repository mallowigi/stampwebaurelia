import {autoinject, LogManager} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {Countries} from '../../../services/Countries';
import {Preferences} from '../../../services/Preferences';
import {EventManaged} from '../../../EventManaged';
import {EventAggregator} from 'aurelia-event-aggregator';
const logger = LogManager.getLogger('stamp-list');

@autoinject
export class StampsList extends EventManaged{

  constructor(private ea: EventAggregator
  ) {
    // logger.info('Stamp List')
    // let p = new Promise(async (resolve, reject) =>{
    //   let countries = await this.countryService.find();
    //   logger.debug(countries);
    // });
    // console.log('help');
    super(ea);
  }

  activate (params, routeConfig: RouterConfiguration) {
    // return new Promise(async (resolve, reject) => {
    //   // Get all countries and prefs
    //   let countries = await this.countryService.find();
    //   logger.debug(countries);
    //   // Promise.all([this.countryService.find(), this.preferenceService.find()])
    // });
  }
}
