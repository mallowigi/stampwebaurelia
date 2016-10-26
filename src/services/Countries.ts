import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient} from 'aurelia-http-client';
import * as _ from 'lodash';
import {EntityManaged} from './EntityManaged';
import {EventNames} from '../EventManaged';
import {Country} from './Country';

@autoinject
export class Countries extends EntityManaged {
  constructor(protected http: HttpClient, protected ea: EventAggregator) {
    super(http, ea);
  }

  getResourceName() {
    return "countries";
  }

  get(data): Country[] {
    return super.get(data);
  }

  updateInternalCount(data: any = {}) {
    if (this.loaded) {
      let countryRef = _.get(data, 'stamp.countryRef');
      let country = this.getById(countryRef);

      if (country) {
        country.stampCount += (data.increment ? 1 : -1);
      }
    }
  }

  /**
   * Will emit an event that a country has been deleted.
   * This particular implementation differs from the entity-managed implementation as
   * it will notify the album service of changes.  Since it is expensive on the client
   * to calculate which albums contain which stamps from the deleting country, simply
   * the count is sent along.
   *
   * @param model
   * @returns {Promise}
   */
  remove(model: Country) {
    return new Promise((resolve, reject) => {
      let howMuch = 0;
      let stampCount = model.stampCount;
      // How much we want to remove
      if (stampCount > 0) {
        howMuch = -1 * stampCount;
      }

      this.remove(model).then(result => {
        this.ea.publish(EventNames.countryDeleted, {id: model.id, count: howMuch});
        resolve(result);
      }).catch(reason => {
        reject(reason);
      });
    })
  }
}
