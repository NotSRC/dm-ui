import { CrudListQuery, SortDirection } from '../interfaces/crud-list-query';

export class QueryParamsBuilder {
  private queryParams: CrudListQuery = {
    page: 1,
    perPage: 15,
    filter: null,
    sortField: null,
    sortDirection: null
  }

  page(page: number) {
    this.queryParams.page = page || 1;
    return this;
  }

  perPage(perPage: number) {
    this.queryParams.perPage = perPage || 25;
    return this;
  }

  filter(filter: string) {
    this.queryParams.filter = filter || null;
    return this;
  }

  sortField(sortField: string) {
    this.queryParams.sortField = sortField || null;
    return this;
  }

  sortDirection(sortDirection: SortDirection) {
    this.queryParams.sortDirection = sortDirection;
    if (!sortDirection) {
      this.queryParams.sortField = null;
    }
    return this;
  }

  getAvailableFields(): CrudListQuery {
    return Object.keys(this.queryParams).reduce((acc, key) => {
      const param = this.queryParams[key];
      if (param || param === 0 || param === false) {
        acc[key] = param;
      }
      return acc;
    }, {} as CrudListQuery);
  }
}
