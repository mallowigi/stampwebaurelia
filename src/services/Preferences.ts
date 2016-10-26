import {autoinject} from 'aurelia-framework';
import {EntityManaged} from './EntityManaged';
import {HttpClient} from 'aurelia-http-client'
import {EventAggregator} from 'aurelia-event-aggregator';
import {Preference} from '../models/Preference';

@autoinject
export class Preferences extends EntityManaged {

  constructor(protected http: HttpClient, protected ea: EventAggregator){
    super(http, ea);
  }

  getDefaultSearchOptions(): {} {
    return {
      $orderBy: 'name asc'
    };
  }

  getResourceName(): any {
    return 'preferences';
  }

  get (data): Preference[] {
    return super.get(data);
  }

  /**
   * Find a preference by name and category
   * @param name
   * @param category
   * @return {T}
   */
  getByNameAndCategory(name: string, category: string): Preference {
    if (!this.loaded) {
      throw new Error ('The service need to be loaded first');
    }
    return _.find(this.models, {name, category});
  }
}
