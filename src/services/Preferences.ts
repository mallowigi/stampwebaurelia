import {autoinject} from 'aurelia-framework';
import {EntityManaged} from './EntityManaged';
import {HttpClient} from 'aurelia-http-client'
import {EventAggregator} from 'aurelia-event-aggregator';

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
}
