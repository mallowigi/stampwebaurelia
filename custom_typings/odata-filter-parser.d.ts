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

    static concat(operator, p);

    flatten(result?);

    serialize();
  }
  class Operators {
    static EQUALS: Operator;
    static AND: Operator;
    static OR: Operator;
    static GREATER_THAN: Operator;
    static GREATER_THAN_EQUAL: Operator;
    static LESS_THAN: Operator;
    static LESS_THAN_EQUAL: Operator;
    static LIKE: Operator;
    static IS_NULL: Operator;
    static NOT_EQUAL: Operator;
    static isUnary(op);
    static isLogical(op);
  }

  class Parser {
    static parse(filterStr): Predicate
  }
}

declare module 'odata-filter-parser' {
  export = ODataFilterParser;
}
