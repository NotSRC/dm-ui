import { CrudListQuery, SortDirection } from '../../interfaces/crud-list-query';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

export class QueryParamsBuilder {

  private cancelChange = false;
  private onChange = new Subject<{ [key: string]: string }>();
  public onChange$ = this.onChange
    .pipe(
      filter(() => this.cancelChange ? this.cancelChange = false : true),
      debounceTime(this.changeDebounceTime),
    );

  protected queryParams: CrudListQuery = {
    page: 1,
    limit: 25,
    filter: null,
    sortField: null,
    sortDirection: null
  };

  constructor(protected changeDebounceTime = 10) {
  }

  protected emitChange() {
    this.onChange.next(this.getAvailableFields());
  }

  public cancelCurrentChangeEvent() {
    this.cancelChange = true;
    return this;
  }

  getParam<T>(key: keyof CrudListQuery): T {
    return this.queryParams[key] as any;
  }

  page(page: number) {
    this.queryParams.page = page || 1;
    this.emitChange();
    return this;
  }

  limit(limit: number) {
    this.queryParams.limit = limit || 25;
    this.emitChange();
    return this;
  }

  filter(filter: string) {
    this.queryParams.filter = filter || null;
    this.emitChange();
    return this;
  }

  sortField(sortField: string) {
    this.queryParams.sortField = sortField || null;
    this.emitChange();
    return this;
  }

  sortDirection(sortDirection: SortDirection | 'asc' | 'desc') {
    this.queryParams.sortDirection = sortDirection || null;
    if (!sortDirection) {
      this.queryParams.sortField = null;
    }
    this.emitChange();
    return this;
  }

  setFromObject(data: { [key: string]: string }) {
    Object.keys(data).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(this.queryParams, key)) {
        this.queryParams[key] = data[key];
      }
    });
    this.emitChange();
    return this;
  }

  getAvailableFields(): { [key: string]: string } {
    return Object.keys(this.queryParams).reduce((acc, key) => {
      const param = this.queryParams[key];
      if (param || param === 0 || param === false) {
        acc[key] = param;
      }
      return acc;
    }, {});
  }
}
