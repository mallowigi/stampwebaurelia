import {autoinject, LogManager} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {Countries} from '../../../services/Countries';
import {Preferences} from '../../../services/Preferences';
import {EventManaged} from '../../../EventManaged';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Parser, Predicate} from 'odata-filter-parser';

import * as _ from 'lodash';
import {Country} from '../../../services/Country';
import {Preference} from '../../../services/Preference';
import {LocationHelper} from '../../../util/LocationHelper';

const logger = LogManager.getLogger('stamp-list');

@autoinject
export class StampsList extends EventManaged {

  countries: Country[] = [];
  preferences: Preference[] = [];

  private currentFilters = [];

  /**
   * Filtering options
   */
  private options = {
    $filter: '',
    $top: 250,
    $skip: 0,
    sort: '',
    sortDirection: 'ssc'
  };

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

      // Filter out results by query parameters
      let $filter = LocationHelper.getQueryParameter('$filter'),
        $orderBy = LocationHelper.getQueryParameter('$orderBy'),
        $skip = LocationHelper.getQueryParameter('$skip');

      if ($filter) {
        // Parse odata filter and save them in currentFilters
        let filter = Parser.parse($filter);
        if (filter) {
          this.currentFilters = filter.flatten();
          logger.debug(this.currentFilters);
          // SessionContext.setSearchCondition(filter);
        }
      } else if (countries.total) {
        let index = Math.floor(Math.random() * countries.total);
        this.currentFilters.push(new Predicate({
          subject: 'countryRef',
          value: this.countries[index].id
        }));
      }


      if ($orderBy && $orderBy.length > 1) {
        let [sort, sortDirection] = $orderBy.split(' ');
        this.options.sort = sort;
        this.options.sortDirection = sortDirection;
      }

      resolve();
    });
  }


}
