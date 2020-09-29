import { CrudListQuery, SortDirection } from '../../interfaces/crud-list-query';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export class QueryParamsBuilder {

  private onChange = new Subject();
  public onChange$ = this.onChange.pipe(debounceTime(10));

  private queryParams: CrudListQuery = {
    page: 1,
    limit: 25,
    filter: null,
    sortField: null,
    sortDirection: null
  }

  page(page: number) {
    this.queryParams.page = page || 1;
    this.onChange.next();
    return this;
  }

  limit(limit: number) {
    this.queryParams.limit = limit || 25;
    this.onChange.next();
    return this;
  }

  filter(filter: string) {
    this.queryParams.filter = filter || null;
    this.onChange.next();
    return this;
  }

  sortField(sortField: string) {
    this.queryParams.sortField = sortField || null;
    this.onChange.next();
    return this;
  }

  sortDirection(sortDirection: SortDirection) {
    this.queryParams.sortDirection = sortDirection;
    if (!sortDirection) {
      this.queryParams.sortField = null;
    }
    this.onChange.next();
    return this;
  }

  getAvailableFields(): {[key: string]: string} {
    return Object.keys(this.queryParams).reduce((acc, key) => {
      const param = this.queryParams[key];
      if (param || param === 0 || param === false) {
        acc[key] = param;
      }
      return acc;
    }, {});
  }
}
