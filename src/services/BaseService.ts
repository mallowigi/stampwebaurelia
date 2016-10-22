import {autoinject, LogManager} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {EventAggregator} from 'aurelia-event-aggregator';

import * as _ from 'lodash';
import {ObjectUtilities} from '../util/ObjectUtilities';
import {EventNames} from '../EventManaged';

const logger = LogManager.getLogger('services');

class ParameterHelper {
  toParameters(options) {
    var s = "";
    var keys = Object.keys(options);
    for (var k = 0; k < keys.length; k++) {
      if (s.length > 1) {
        s += "&";
      }
      s += keys[k] + '=' + encodeURIComponent(options[keys[k]]);
    }
    return s;
  }
}

interface EntitiesResponse {
  models: Array<any>;
  total: number
}

@autoinject
export class BaseService {
  /**
   * The base href
   * @type {string}
   */
  baseHref = 'stamp-webservices';

  /**
   * Cache of parameters of the latest query
   * @type {{}}
   */
  parameters = {};

  /**
   * Entities fetched
   * @type {Array}
   */
  models = [];

  /**
   * Total of entities fetched
   * @type {number}
   */
  total = 0;

  /**
   * Whenever the data has been loaded
   * @type {boolean}
   */
  loaded = false;

  /**
   * Cache for single get
   * @type {{id: number; model: any}}
   */
  lastCache = {
    id: 0,
    model: null
  };

  selections = [];

  paramHelper = new ParameterHelper();

  constructor(protected http: HttpClient, protected ea: EventAggregator) {

    this.http.configure(x => {
      x.withHeader('Accept', 'application/json');
      x.withHeader('Content-Type', 'application/json');
    });
  }


  select(model) {
    model.selected = true;
  }

  unselect(model) {
    model.selected = false;
  }

  selectAll() {
    _.each(this.models, m => (m.selected = true));
  }

  clearSelected() {
    _.each(this.models, m => (m.selected = false));
  }

  isSelected(model) {
    return model.selected === true;
  }

  getSelected() {
    return _.filter(this.models, {selected: true});
  }


  /**
   * Return the collection name. To be overriden by classes
   */
  getCollectionName(): string {
    return this.getResourceName();
  }

  /**
   * Returns the name of the resource.
   * Need to be overridden
   */
  getResourceName(): string {
    throw new Error('Unimplemented resource name');
  }

  get(response): any[] {
    if (response && response.models) {
      return response.models;
    }
    return [];
  }

  /**
   * Return the list of params monitored by the cache
   * @param params
   */
  monitoredParams(params) {
    let reservedKeys = ['$filter', '$top', '$orderBy', '$skip'];

    return _.pick(params, reservedKeys);
  }

  /**
   * Return default search options.
   * To be overridden by subclasses
   */
  getDefaultSearchOptions() {
    return {};
  }

  /**
   * Query whether we can use the cached results for the prvoided params
   * @param params
   * @returns {boolean}
   */
  useCachedResult(params) {
    let monitoredParams = this.monitoredParams(params);

    // If no models were cached - cannot use cache
    if (!this.models.length) {
      return false;
    }

    // If monitored parameters are not equal to some previous ones - need ot build cache
    if (!ObjectUtilities.isEqual(monitoredParams, this.parameters)) {
      return false;
    }

    // If asked for no params but we had params previously - need to build cache for no params
    if (!_.isEmpty(this.parameters) && _.isEmpty(params)) {
      return false;
    }

    if (!_.isUndefined(params) && !_.isUndefined(this.parameters)) {
      /**
       * Return true if new params have no cache but current params had
       * @param newParams
       * @param currentParams
       * @returns {boolean}
       */
      let cacheAndNew = (newParams, currentParams) => {
        return _.isUndefined(newParams._dc) && !_.isUndefined(currentParams._dc)
      };

      /**
       * Return true if newParams and current params have the same dynamic cache
       * @param newParams
       * @param currentParams
       * @returns {boolean}
       */
      let sameCache = (newParams, currentParams) => {
        return newParams._dc === currentParams._dc;
      };

      // If params have already a cache - need to rebuild it
      if (!cacheAndNew(params, this.parameters)) {
        return false;
      }

      // If params have a different cache - cannot use it
      if (!sameCache(params, this.parameters)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Function to be called upon finishing find
   */
  _postFind(models) {
    // do nothing
  }

  /**
   * Get a cached model by its id
   * @param id
   * @returns {any}
   */
  getById(id) {
    if (!this.loaded) {
      throw new Error(`Requires [${this.getCollectionName()}] to be loaded first`);
    }

    // If id has been cached, use cache
    if (this.lastCache.id === +id) {
      return this.lastCache.model;
    }

    // Try to find model in models
    let model = _.find(this.models, {id: +id});
    if (model) {
      this.lastCache.id = id;
      this.lastCache.model = model;
      return model;
    }

    return null;
  }

  /**
   * Issue a request to count the number of a given entity
   * @param options
   * @returns {Promise<T>}
   */
  count(options) {
    return new Promise((resolve, reject) => {
      let href = `${this.baseHref}/rest/${this.getResourceName()}/!count?${this.paramHelper.toParameters(options)}`;

      this.http.get(href)
        .then(({content}) => {
          resolve(+content.count);
        })
        .catch(reason => {
          reject(reason);
        });
    })
  }

  /**
   * Delete an entity from the db
   * @param model
   * @returns {Promise<T>}
   */
  remove(model) {
    return new Promise((resolve, reject) => {
      if (model.id <= 0) {
        return reject(`Cannot delete a non persisted item from ${this.getCollectionName()}`);
      }

      let href = `${this.baseHref}/rest/${this.getResourceName()}/${model.id}`;
      return this.http.delete(href)
        .then(({response, statusCode}) => {
          if (statusCode === 204) {
            this.ea.publish(EventNames.deleteSuccessful, {type: this.getCollectionName(), id: model.id});
            resolve(true);
          } else {
            reject(response);
          }
        })
        .catch(reason => {
          reject(reason);
        })
    })
  }

  /**
   * Manual update of a model
   * @param model
   */
  updateLocalEntry(model) {
    if (this.loaded && this.models.length) {
      let m = _.find(this.models, {id: model.id});
      if (m) {
        _.merge(m, model);

        this.ea.publish(EventNames.updateFinished, {type: this.getCollectionName(), model: m});
      }
      else {
        logger.debug(`Could not find model with id ${model.id} in [${this.getCollectionName()}]`);
      }
    }
  }

  /**
   * Fetch a request to the resource
   * @param options
   */
  find(options = {}): Promise<EntitiesResponse> {
    return new Promise((resolve, reject) => {
      let opts = _.extend({}, this.getDefaultSearchOptions(), options);

      if (!this.loaded || !this.useCachedResult(opts)) {
        logger.debug(`[${this.getCollectionName()}] retrieving items`);
        // Publish event that loading started
        this.ea.publish(EventNames.loadingStarted);

        let href = `${this.baseHref}/rest/${this.getResourceName()}`;
        if (opts) {
          href += '?' + this.paramHelper.toParameters(opts);
        }

        // fetch resource
        this.http.get(href)
          .then(({response, statusCode, content}) => {
            this.loaded = true;

            if (statusCode === 200) {
              // Save the models
              this.models = content[this.getCollectionName()];
              this.total = content.total;

              // Call handler for postFind
              this._postFind(this.models);
            }

            // Publish event that loading finished
            this.ea.publish(EventNames.loadingFinished);
            // Cache params
            this.parameters = opts;

            resolve({models: this.models, total: this.total});
          })
          .catch(reason => {
            this.ea.publish(EventNames.loadingFinished);
            reject(reason);
          })
      } else {
        logger.debug(`[${this.getCollectionName()}] using cached result with ${this.total} items`);
        resolve({models: this.models, total: this.total});
      }
    });
  }

  /**
   * Save or update a model in the db
   * @param model
   * @param options
   * @returns {Promise<T>}
   */
  save(model, options) {
    return new Promise((resolve, reject) => {
      let href = `${this.baseHref}/rest/${this.getResourceName()}`;
      let method = 'post';
      if (model.id > 0) {
        href += `/${model.id}`;
        method = 'put';
      }

      this.http[method](href, options)
        .then(({statusCode, response, content: newModel}) => {
          if (statusCode === 200 || statusCode === 201) {
            // If there was already a model with the same id
            let m = _.find(this.models, {id: newModel.id});
            if (m) {
              this.updateLocalEntry(newModel);
            } else {
              // todo use a set
              this.models.push(newModel);
            }

            this.ea.publish(EventNames.saveSuccessful, {type: this.getCollectionName(), model: newModel});
            resolve(newModel);
          }
          else {
            reject(response);
          }

        })
        .catch(reason => {
          reject(reason);
        })
    })
  }
}
