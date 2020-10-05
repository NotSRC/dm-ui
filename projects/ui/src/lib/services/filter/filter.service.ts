export enum FilterConditions {
  Equal = 'EQ',
  Greater = 'GT',
  GreaterOrEqual = 'GTE',
  LessThen = 'LT',
  LessThenOrEqual = 'LTE',
  Include = 'IN',
}

export enum FilterOperator {
  Or = 'or',
  And = 'and',
  Not = 'not',
  NotOr = 'nor'
}

export interface FilterInputPlain {
  field: string;
  search: any;
  condition: FilterConditions;
  operator?: FilterOperator;
}

export class FilterInput<T> {
  // tslint:disable-next-line:variable-name
  private _field: string;
  // tslint:disable-next-line:variable-name
  private _search: T;
  // tslint:disable-next-line:variable-name
  private _condition: FilterConditions;

  // tslint:disable-next-line:variable-name
  private _operator: FilterOperator = FilterOperator.And;

  set field(field) {
    this._field = field;
  }

  get field() {
    return this._field;
  }

  set search(search) {
    this._search = search;
  }

  get search() {
    return this._search;
  }

  set condition(condition) {
    this._condition = condition;
  }

  get condition() {
    return this._condition;
  }

  set operator(operator) {
    this._operator = operator;
  }

  get operator() {
    return this._operator;
  }

  constructor(params: {
    field?: string,
    search?: T,
    condition?: FilterConditions,
    operator?: FilterOperator
  } = {}) {
    this._field = params.field;
    this._search = params.search;
    this._condition = params.condition || FilterConditions.Equal;
    this._operator = params.operator || FilterOperator.And;
  }

}

export type filtersPlainType = { [key: string]: FilterInputPlain };

export type filtersType<T> = { [key in keyof T]: FilterInput<any> };

export abstract class FilterService {

  abstract readonly filters: filtersType<{}>;

  setFiltersFromPlain(plain: filtersPlainType) {
    Object.keys(plain || {})
      .forEach(key => {
        if (Object.prototype.hasOwnProperty.call(this.filters, key)) {
          this.filters[key].search = plain[key].search;
        } else {
          this.filters[key] = new FilterInput<any>({
            field: plain[key].field,
            search: plain[key].search,
            condition: plain[key].condition,
            operator: plain[key].operator,
          });
        }
      });
  }

  getFiltersPlain(): filtersPlainType {
    return Object.keys(this.filters)
      .reduce((acc, key) => {
        acc[key] = getFilterPlain(this.filters[key]);
        return acc;
      }, {});
  }

  getFiltersArray(): FilterInputPlain[] {
    return Object
      .keys(this.filters)
      .map(key => this.filters[key])
      .filter(f => f.search !== undefined && f.search !== null)
      .map(filter => getFilterPlain(filter));
  }

  getJsonFilters(): string {
    return JSON.stringify(this.getFiltersArray());
  }
}

export function TransformArrayFiltersToJson(filters: Array<FilterInputPlain|FilterInput<any>>) {
  const filtersArray =  Object
    .keys(filters)
    .map(key => filters[key])
    .filter(f => f.search !== undefined && f.search !== null)
    .map(filter => getFilterPlain(filter));

  return JSON.stringify(filtersArray);
}

export function TransformPlainFiltersToJson(plain: filtersPlainType): string {
  const filtersArray = Object
    .keys(plain)
    .map(key => plain[key])
    .filter(f => f.search !== undefined && f.search !== null)
    .map(filter => filter);

  return JSON.stringify(filtersArray);
}

function getFilterPlain(filter: FilterInput<any>) {
  return {
    field: filter.field,
    search: filter.search,
    condition: filter.condition,
    operator: filter.operator
  };
}
