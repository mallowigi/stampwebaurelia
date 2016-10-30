export var StringUtil = {
  pluralize: function (str, count) {
    var s = str;
    if (count > 1) {
      if (str.endsWith("y")) {
        s = str.substring(0, str.length - 1) + 'ies';
      } else {
        s += 's';
      }
    }
    return s;
  }
};
