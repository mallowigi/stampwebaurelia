import {extend} from 'lodash';

export class Stamp {
  type: String = '';
  id: number = 0;
  catalogueNumbers: Array<Stamp> = [];
  countryRef = -1;
  wantList = [];
  stampOwnerships = [];

  constructor(wantList) {
    this.wantList = wantList;
  }
}
