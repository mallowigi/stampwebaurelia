import {autoinject} from 'aurelia-framework';
import {EntityManaged} from './EntityManaged';
import {HttpClient} from 'aurelia-http-client'
import {EventAggregator} from 'aurelia-event-aggregator';
import {Stamp} from './Stamp';
import {EventNames} from '../EventManaged';

import * as _ from 'lodash';

@autoinject
export class Stamps extends EntityManaged {
  constructor(protected http: HttpClient, protected ea: EventAggregator) {
    super(http, ea);

    this.setupListeners();
  }

  getResourceName(): string {
    return 'stamps';
  }

  get(data): Stamp[] {
    return super.get(data);
  }

  private setupListeners() {
    this.ea.subscribe(EventNames.deleteSuccessful, this.handleDelete.bind(this));
  }

  /**
   *   remove all references to stamp in stamps' catalogue numbers
   */
  private handleDelete(stamp: Stamp = <Stamp>{}) {
    if (stamp.type === 'catalogueNumbers' && stamp.id) {
      _.each(this.models, (s: Stamp) => {
        _.remove(s.catalogueNumbers, {id: +stamp.id});
      });
    }
  }

}
