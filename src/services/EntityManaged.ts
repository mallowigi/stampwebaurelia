import {autoinject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {BaseService} from './BaseService';
import {EventNames} from '../EventManaged';

@autoinject
export class EntityManaged extends BaseService {
  constructor(private http: HttpClient, private ea: EventAggregator) {
    super(http, ea);

    // When receiving event "stampCount", update internal count of the entity
    this.ea.subscribe(EventNames.stampCount, this.updateInternalCount.bind(this));
  }

  /**
   * Function to be called whenever needed to update the count
   * @param data
   */
  updateInternalCount(data) {
    // to be implemented
  }

  getDefaultSearchOptions(): {} {
    return {
      $orderBy: 'name asc'
    };
  }


}
