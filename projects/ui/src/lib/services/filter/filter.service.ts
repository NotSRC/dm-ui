export enum FilterConditions {
  Equal = 'EQ',
  Greater = 'GT',
  GreaterOrEqual = 'GTE',
  LessThen = 'LT',
  LessThenOrEqual = 'LTE',
  Include = 'IN',
}

export enum FilterOperators {
  And = 'AND',
  Or = 'OR',
}

export interface FilterInputArray {
  field?: string;
  search?: any;
  condition?: FilterConditions;
  operator?: FilterOperators;
  children?: FilterInputArray[];
}

export interface FilterInputPlain {
  field?: string;
  search?: any;
  condition?: FilterConditions;
  operator?: FilterOperators;
  children?: filtersPlainType;
}

export class FilterInput<T> {
  // tslint:disable-next-line:variable-name
  private _field: string;
  // tslint:disable-next-line:variable-name
  private _search: T;
  // tslint:disable-next-line:variable-name
  private _condition: FilterConditions;
  // tslint:disable-next-line:variable-name
  private _operator: FilterOperators;
  // tslint:disable-next-line:variable-name
  private _children: filtersType;

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

  set children(children) {
    this._children = children;
  }

  get children() {
    return this._children;
  }

  constructor(
    params: {
      field?: string;
      search?: T;
      condition?: FilterConditions;
      operator?: FilterOperators;
      children?: filtersType;
    } = {}
  ) {
    this._field = params.field;
    this._search = params.search;
    this._condition = params.condition;
    this._operator = params.operator;
    this._children = params.children;
  }
}

export type filtersPlainType = { [key: string]: FilterInputPlain };

export type filtersType = { [key: string]: FilterInput<any> };

export abstract class FilterService {
  abstract readonly filters: filtersType;

  setFiltersFromPlain(plain: filtersPlainType, filterSrc = this.filters) {
    Object.keys(plain || {}).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(filterSrc, key)) {
        filterSrc[key].search = plain[key].search;
        if (plain[key].children) {
          this.setFiltersFromPlain(
            plain[key].children,
            filterSrc[key].children
          );
        }
      }
    });
  }

  getFiltersPlain(filters = this.filters): filtersPlainType {
    return Object.keys(filters).reduce((acc, key) => {
      const filter = filters[key];
      if (filter.children) {
        acc[key] = {
          operator: filter.operator,
          children: this.getFiltersArray(filter.children),
        };
      } else {
        acc[key] = getFilterPlain(filter);
      }
      return acc;
    }, {});
  }

  getFiltersArray(filters: filtersType): FilterInputArray[] {
    return TransformPaintFilterToArray(filters);
  }

  getJsonFilters(): string {
    return JSON.stringify(this.getFiltersArray(this.filters));
  }
}

export function TransformFiltersToJson(
  filters:
    | filtersPlainType
    | filtersType
    | Array<FilterInputPlain | FilterInputArray | FilterInput<any>>
): string {
  return JSON.stringify(TransformPaintFilterToArray(filters));
}

function TransformPaintFilterToArray(
  filters:
    | filtersPlainType
    | filtersType
    | Array<FilterInputPlain | FilterInputArray | FilterInput<any>>
): FilterInputArray[] {
  return Object.keys(filters)
    .map((key) => filters[key])
    .filter((f) => f.search !== undefined && f.field !== null && !f.children)
    .map((filter) => {
      if (filter.children) {
        return {
          operator: filter.operator,
          children: TransformPaintFilterToArray(filter.children),
        };
      } else {
        return getFilterPlain(filter);
      }
    });
}

function getFilterPlain(
  filter: FilterInputPlain | FilterInputArray | FilterInput<any>
) {
  return {
    field: filter.field,
    search: filter.search,
    condition: filter.condition,
  };
}
