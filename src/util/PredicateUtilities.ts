import {Operators} from 'odata-filter-parser';

export const PredicateUtilities = {
  /**
   * Remove predicates matching the given subject
   * @param subject
   * @param predicates
   * @return {any[]}
   */
  removeMatches(subject, predicates: any[]) {
    let predicateList = _.clone(predicates);
    if (predicateList.length === 1 && !Operators.isLogical(predicateList[0].operator)) {

      if (predicateList[0].subject === subject) {
        predicateList.shift();
      }
    }
    else {
      _.remove(predicateList, {subject: subject});
      let logicals = _.filter(predicateList, item => Operators.isLogical(item.operator));

      if (logicals.length > 0) {
        _.forEach(logicals, logical => {
          let flattened = logical.flatten();
          let processed = PredicateUtilities.removeMatches(subject, flattened);
          if (processed.length < flattened.length) {
            let indx = _.indexOf(predicateList, logical);
            predicateList.splice(indx, 1);
          }
        });
      }
    }
    return predicateList;
  }
};
