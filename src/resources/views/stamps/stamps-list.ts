import {autoinject, LogManager} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {Countries} from '../../../services/Countries';
import {Preferences} from '../../../services/Preferences';
import {EventManaged, StorageKeys} from '../../../EventManaged';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Parser, Predicate} from 'odata-filter-parser';

import * as _ from 'lodash';
import * as $ from 'jquery';
import {Country} from '../../../services/Country';
import {Preference} from '../../../services/Preference';
import {LocationHelper} from '../../../util/LocationHelper';
import {Stamp} from '../../../services/Stamp';
import {SearchQuery} from '../../../models/SearchQuery';
import Operators = ODataFilterParser.Operators;
import {Stamps} from '../../../services/Stamps';
import {PageModel} from '../../../models/PageModel';
import {EntitiesResponse} from '../../../models/EntitiesResponses';
import {DisplayMode} from '../../../models/DisplayMode';

const logger = LogManager.getLogger('stamp-list');

@autoinject
export class StampsList extends EventManaged {

  /**
   * Fetched list of stamps
   * @type {Array}
   */
  private stamps: Stamp[] = [];
  private stampCount: number;

  /**
   * Fetched country list
   * @type {Array}
   */
  private countries: Country[] = [];
  /**
   * Fetched preference list
   * @type {Array}
   */
  private preferences: Preference[] = [];

  private currentFilters = [];

  /**
   * Filtering options
   */
  private options = {
    $filter: '',
    $top: 250,
    $skip: 0,
    $orderBy: 'name',
    sort: '',
    sortDirection: 'ssc'
  };

  /**
   * The stamps image paths
   */
  private imagePath;
  private _defaultImagePath = 'http://drake-server.ddns.net:9001/Pictures/Stamps';

  /**
   * Whether we show by reference or not
   */
  private referenceMode = false;

  /**
   * last selected stamp
   */
  private lastSelected: Stamp;

  private displayMode: DisplayMode;

  /**
   * Pagination model
   */
  private pageInfo : PageModel = new PageModel();

  constructor(private ea: EventAggregator,
              private element: Element,
              private router: Router,
              private stampService: Stamps,
              private countryService: Countries,
              private preferenceService: Preferences) {
    super(ea);
  }

  activate(params, routeConfig: RouterConfiguration) {
    let startTime = new Date().getTime();
    let referenced = localStorage.getItem(StorageKeys.referenceCatalogueNumbers);

    this.referenceMode = referenced === 'true';

    return new Promise(async(resolve, reject) => {
      // Get all countries and prefs
      let countries = await this.countryService.find();
      let preferences = await this.preferenceService.find();

      this.countries = this.countryService.get(countries);
      this.preferences = this.preferenceService.get(preferences);

      // Filter out results by query parameters
      let $filter = LocationHelper.getQueryParameter('$filter'),
        $orderBy = LocationHelper.getQueryParameter('$orderBy'),
        $skip = LocationHelper.getQueryParameter('$skip');

      this.options.$filter = $filter;
      this.options.$orderBy = $orderBy;
      this.options.$skip = $skip;

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

      // order by support
      if ($orderBy && $orderBy.length > 1) {
        let [sort, sortDirection] = $orderBy.split(' ');
        this.options.sort = sort;
        this.options.sortDirection = sortDirection;
      }

      // $top support
      let $top = this.preferenceService.getByNameAndCategory('pageSize', 'stamps');
      if ($top) {
        this.options.$top = +$top;
      }

      // image path
      let $imagePath = this.preferenceService.getByNameAndCategory('imagePath', 'stamps');
      this.imagePath = _.isEmpty($imagePath) ? this._defaultImagePath : $imagePath.value;

      // Finally search for stamps
      this.search().then(() => {
        logger.debug(`StampGrid initialization time: ${new Date().getTime() - startTime}`);
        resolve();
      }).catch((err) => reject(err));

    });
  }

  /**
   * Search for stamps using the current filters
   * @return {Promise<T>}
   */
  private search() {
    return new Promise((resolve, reject)=> {
      let opts = this.buildOptions();
      // Remove selected stamp
      this.stampService.clearSelected();

      this.stampService.find(opts).then(result => {
        // Reload the page
        this.router.navigate(this.router.generate('stamp-list', opts));

        // Process stamps from the result
        this.processStamps(result, opts);

        // Reset display
        this.resetDisplay();
        resolve();
      }).catch(err => {
        logger.debug(err);
        reject(err);
      });
    })
  }

  /**
   * Build search query options
   */
  private buildOptions() {
    let currentOptions = this.options;
    let opts: SearchQuery = {};

    // $orderBy
    if (currentOptions.sort && currentOptions.sort !== 'placeholder' && currentOptions.sortDirection) {
      opts.$orderBy = `${currentOptions.sort} ${currentOptions.sortDirection}`;
    }

    // $top
    opts.$top = currentOptions.$top > -1 ? currentOptions.$top : 100;

    // $skip
    opts.$skip = currentOptions.$skip;

    // Finally serialize currentfilters
    if (_.size(this.currentFilters) > 0) {
      let predicate = Predicate.concat(Operators.AND, this.currentFilters);
      opts.$filter = predicate.serialize();

      logger.debug(`$filter=${opts.$filter}`);
    }

    return opts;
  }

  /**
   * Process request by loading ths tamps
   * @param {Stamp[]} models
   * @param {number} total
   * @param opts
   */
  private processStamps({models, total}, opts: SearchQuery) {
    this.lastSelected = undefined; // clear any editing stamps
    this.generatePageModels(1, 0);

    this.stamps = models;
    this.stampCount = total;

    // Build pagination
    this.pageInfo.total = 1;
    this.pageInfo.active = 0;

    // Handle options
    if (opts.$top) {
      this.pageInfo.total = (total / opts.$top) + 1;
      if (opts.$skip) {
        this.pageInfo.active = opts.$skip / opts.$top;
      }
    }
  }

  /**
   * Generate pagination
   * @param total total number of pages
   * @param current current page
   */
  private generatePageModels(total: number, current: number) {
    _.times(total, (i) => new PageModel({page: i, current: (current === i)}));
  }

  /**
   * Reset the display by scrolling elements up
   */
  private resetDisplay() {
    // Wait for the ui to be loaded
    _.defer(() => {
      let targetElement = '.stamp-content';

      switch (this.displayMode) {
        case DisplayMode.LIST:
          targetElement += ' stamp-table';
          break;
        case DisplayMode.UPGRADE:
          targetElement += ' .stamp-replacement-table-wrapper';
          break;
        default:
          targetElement += ' .scroller';
      }

      // Scroll to top
      let target = $(this.element).find(targetElement);
      target.animate({scrollTop: 0}, 'fast');
    });
  }
}
