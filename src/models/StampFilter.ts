export interface StampFilter {
  ordinal: number,
  description: string
}

export class StampFilters {
  static ALL = {ordinal: 0, description: 'filters.ALL_STAMPS'};
  static OWNED: { ordinal: 1, description: 'filters.ONLY_OWNED' };
  static WANT_LIST: { ordinal: 2, description: 'filters.ONLY_WANTLIST' };
}
