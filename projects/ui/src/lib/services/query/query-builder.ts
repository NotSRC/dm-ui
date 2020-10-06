import { CrudListQuery, SortDirection } from '../../interfaces/crud-list-query';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { QueryStorageSaver } from './query-storage-saver';

export class QueryParamsBuilder {
  private cancelChange = false;
  private onChange = new Subject<{ [key: string]: string }>();
  public onChange$ = this.onChange
    .pipe(
      filter(() => this.cancelChange ? this.cancelChange = false : true),
      debounceTime(this.changeDebounceTime),
    );

  protected queryParams: CrudListQuery;

  constructor(
    protected changeDebounceTime = 10,
    protected queryStorageSaver = new QueryStorageSaver()
  ) {
    this.queryParams = {
      page: this.queryStorageSaver.getItem<number>('page') || 1,
      limit: this.queryStorageSaver.getItem<number>('limit') || 25,
      filter: this.queryStorageSaver.getItem<string>('filter') || null,
      sortField: this.queryStorageSaver.getItem<string>('sortField') || null,
      sortDirection: this.queryStorageSaver.getItem<SortDirection>('sortDirection') || null
    }
  }

  protected emitChange() {
    this.onChange.next(this.getAvailableFields());
  }

  public cancelCurrentChangeEvent() {
    this.cancelChange = true;
    return this;
  }

  protected saveParam(param: string, value: number|string, saveOnSession = false) {
  if (saveOnSession) {
    this.queryStorageSaver.setItem(param, value);
  }
  }

  getParam<T>(key: keyof CrudListQuery): T {
    return this.queryParams[key] as any;
  }

  page(page: number|string, {saveOnSession} = { saveOnSession: false }) {
    this.queryParams.page = parseInt(`${page}`, 10) || 1;
    this.saveParam('page', this.queryParams.page, saveOnSession);
    this.emitChange();
    return this;
  }

  limit(limit: number|string, {saveOnSession} = { saveOnSession: false }) {
    this.queryParams.limit = parseInt(`${limit}`, 10) || 25;
    this.saveParam('limit', this.queryParams.limit, saveOnSession);
    this.emitChange();
    return this;
  }

  filter(filter: string, {saveOnSession} = { saveOnSession: false }) {
    this.queryParams.filter = filter || null;
    this.saveParam('filter', this.queryParams.filter, saveOnSession);
    this.emitChange();
    return this;
  }

  sortField(sortField: string, {saveOnSession} = { saveOnSession: false }) {
    this.queryParams.sortField = sortField || null;
    this.saveParam('sortField', this.queryParams.sortField, saveOnSession);
    this.emitChange();
    return this;
  }

  sortDirection(sortDirection: SortDirection | 'asc' | 'desc', {saveOnSession} = { saveOnSession: false }) {
    this.queryParams.sortDirection = sortDirection || null;
    if (!sortDirection) {
      this.queryParams.sortField = null;
    }
    this.saveParam('sortDirection', this.queryParams.sortDirection, saveOnSession);
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
