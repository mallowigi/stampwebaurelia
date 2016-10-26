export class PageModel {
  page = 0;
  current = true;

  total = 0;
  active = 0;

  constructor({page = 0, current = true} = {}) {
    this.page = page;
    this.current = current;
  }
}
