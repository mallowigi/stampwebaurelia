declare namespace ODataFilterParser {
  enum Operator {
    EQUALS,
    AND,
    OR,
    GREATER_THAN,
    GREATER_THAN_EQUAL,
    LESS_THAN,
    LESS_THAN_EQUAL,
    LIKE,
    IS_NULL,
    NOT_EQUAL,
  }
  class Predicate {
    constructor(data?: Object);

    subject: string;
    value: string;
    operator: Operator;

    concat(operator, p);

    flatten(result?);

    serialize();
  }
  class Operators {
    EQUALS: Operator;
    AND: Operator;
    OR: Operator;
    GREATER_THAN: Operator;
    GREATER_THAN_EQUAL: Operator;
    LESS_THAN: Operator;
    LESS_THAN_EQUAL: Operator;
    LIKE: Operator;
    IS_NULL: Operator;
    NOT_EQUAL: Operator;
    isUnary(op);
    isLogical(op);
  }

  class Parser {
    static parse(filterStr): Predicate
  }
}

declare module 'odata-filter-parser' {
  export = ODataFilterParser;
}
