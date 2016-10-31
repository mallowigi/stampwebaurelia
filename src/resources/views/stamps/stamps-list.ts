import {autoinject, LogManager, computedFrom} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {Countries} from '../../../services/Countries';
import {Preferences} from '../../../services/Preferences';
import {EventManaged, StorageKeys} from '../../../EventManaged';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Parser, Predicate, Operators} from 'odata-filter-parser';

import * as _ from 'lodash';
import * as $ from 'jquery';
import {Country} from '../../../models/Country';
import {Preference} from '../../../models/Preference';
import {LocationHelper} from '../../../util/LocationHelper';
import {Stamp} from '../../../models/Stamp';
import {SearchQuery} from '../../../models/SearchQuery';
import {Stamps} from '../../../services/Stamps';
import {PageModel} from '../../../models/PageModel';
import {DisplayMode} from '../../../models/DisplayMode';
import {PanelNames} from '../../../models/PanelNames';
import {CurrencyCode} from '../../../models/CurrencyCode';
import {DialogService} from 'aurelia-dialog';
import {PurchaseForm} from './purchase-form';
import {PredicateUtilities} from '../../../util/PredicateUtilities';
import {StampFilter, StampFilters} from '../../../models/StampFilter';

const logger = LogManager.getLogger('stamp-list');

@autoinject
export class StampsList extends EventManaged {

  /**
   * Fetched list of stamps
   * @type {Array}
   */
  private stamps: Stamp[] = [];
  /**
   * List of stamps
   */
  private stampCount: number;
  /**
   * Editing stamp
   */
  private editingStamp: Stamp;
  /**
   * last selected stamp
   */
  private latestSelected: Stamp;

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

  /**
   * Selected stamp filter
   */
  private stampFilter: StampFilter = StampFilters.ALL;

  /**
   * List of search predicates
   * @type {Array}
   */
  private currentFilters: Predicate[] = [];

  /**
   * Filtering options
   */
  private options = {
    $filter: '',
    $top: 250,
    $skip: 0,
    $orderBy: 'name',
    sort: '',
    sortDirection: 'asc'
  };

  /**
   * The stamps image paths
   */
  private imagePath;
  private _defaultImagePath = 'http://drake-server.ddns.net:9001/Pictures/Stamps';

  /**
   * Current display mode
   */
  private displayMode: DisplayMode;

  /**
   * Pagination model
   */
  private pageInfo: PageModel = new PageModel();

  /**
   * The panel name
   */
  private panelContents: PanelNames;
  /**
   * Whether the editor is shown
   */
  private editorShown: boolean = false;
  /**
   * The search entered value
   */
  private searchText: string;

  /**
   * Sorting columns
   * @type {[string,string,string]}
   */
  private sortColumns = ['number', 'value', 'pricePaid'];

  /**
   * Display/Hide the reference catalogue numbers table
   */
  private referenceMode = false;

  constructor(private ea: EventAggregator,
              private element: Element,
              private router: Router,
              private stampService: Stamps,
              private countryService: Countries,
              private preferenceService: Preferences,
              private dialogService: DialogService) {
    super(ea);
  }

  /**
   * When loading the route, setup the view.
   * @param params
   * @param routeConfig
   * @return {Promise<T>}
   */
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

      if ($skip) {
        this.options.$skip = $skip;
      }

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
   * Show a panel in the editor
   * @param panelName
   */
  showEditor(panelName: PanelNames) {
    switch (panelName) {
      case PanelNames.createStamp:
      case PanelNames.createWantList:
        this.editingStamp = new Stamp({action: PanelNames.createWantList});
        this.panelContents = PanelNames.stampEditor;
        break;
      case PanelNames.searchPanel:
        this.panelContents = panelName;
        break;
      default:
        break;
    }

    this.editorShown = true;
  }

  selectAll(select = false) {
    if (!select) {
      this.stampService.clearSelected();

      if (this.editingStamp) {
        this.editorShown = false;
        this.editingStamp = null;
        this.latestSelected = null;
      }
    }
    else {
      this.stampService.selectAll();
    }
  }

  /**
   * Send a search request
   */
  sendSearch() {
    // Remove latest search and relaunch search
    this.currentFilters = PredicateUtilities.removeMatches('description', this.currentFilters);
    if (!_.isEmpty(this.searchText)) {
      let predicate = new Predicate({
        subject: 'description',
        operators: Operators.EQUALS,
        value: this.searchText
      });

      this.currentFilters.unshift(predicate);
    }

    this.search();
  }

  /**
   * Clear search and return all stamps
   */
  clearSearch() {
    this.searchText = '';
    this.sendSearch();
  }

  /**
   * Change display mode
   * @param displayMode
   */
  setDisplayMode(displayMode: DisplayMode) {
    this.displayMode = displayMode;
  }

  /**
   * Search for stamps using the current filters
   * @return {Promise<T>}
   */
  private search() {
    return new Promise((resolve, reject) => {
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
      if (this.currentFilters.length > 1) {
        let predicate = Predicate.concat(Operators.AND, this.currentFilters);
        opts.$filter = predicate.serialize();
      } else {
        opts.$filter = this.currentFilters[0].serialize();
      }

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
    this.latestSelected = undefined; // clear any editing stamps
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

  get selectedCount() {
    return this.stampService.getSelected().length;
  }

  /**
   * Purchase selected stamps
   */
  purchase() {
    let selected = this.stampService.getSelected();
    if (selected && selected.length) {
      // Remove selected stamps that are in want list
      selected = _.filter(selected, {wantList: false});
      if (selected.length) {
        // Open dialog service
        let purchase = {
          price: 0,
          currency: CurrencyCode.USD.key,
          updateExisting: true,
          selectedStamps: selected
        };

        this.dialogService.open({
          viewModel: PurchaseForm,
          model: purchase
        }).then(() => {
          // post process purchases
        }).catch(() => {
          // handle cancel
        });
      }
    }
  }

  /**
   * Return the state of the showReferenceTable button
   */
  @computedFrom('referenceMode', 'displayMode')
  get referenceTableState() {
    if (this.referenceMode && this.displayMode === DisplayMode.GRID) {
      return 'active';
    } else if (this.displayMode === DisplayMode.LIST) {
      return 'disabled'
    }
    return '';
  }

  /**
   * Toggle reference catalogue table
   */
  toggleCatalogueNumbers() {
    this.referenceMode = !this.referenceMode;
    localStorage.setItem(StorageKeys.referenceCatalogueNumbers, String(this.referenceMode));
  }

  /**
   * Set a sort option and sort
   * @param sortCol
   */
  setSort(sortCol) {
    this.options.sort = sortCol;
    if (!this.options.sortDirection) {
      this.options.sortDirection = 'asc';
    }

    this.search();
  }

  /**
   * Clear sorting
   */
  clearSort() {
    this.options.sort = 'placeholder';
    this.search();
  }

  /**
   * Toggle the sort direction
   */
  toggleSortDirection() {
    this.options.sortDirection = (this.options.sortDirection === 'asc' ? 'desc' : 'asc');
    this.search();
  }

  /**
   * Return the selected filter description
   * @param filter
   */
  getFilterText(filter) {
    return filter.description;
  }
}
