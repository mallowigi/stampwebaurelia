export class DefaultValueValueConverter {
  toView(value, defaultValue) {
    return (!value) ? defaultValue : value;
  }
}
