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
  // tslint:disable-next-line:variable-name
  private _options: { nullable: boolean };

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

  set options(options) {
    this._options = options;
  }

  get options() {
    return this._options;
  }

  constructor(
    params: {
      field?: string;
      search?: T;
      condition?: FilterConditions;
      operator?: FilterOperators;
      children?: filtersType;
    } = {},
    options = {
      nullable: false,
    }
  ) {
    this.field = params.field;
    this.search = params.search;
    this.condition = params.condition;
    this.operator = params.operator;
    this.children = params.children;
    this.options = options;
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
        acc[key] = GetFilterPlain(filter);
      }
      return acc;
    }, {});
  }

  getFiltersArray(filters: filtersType = this.filters): FilterInputArray[] {
    return TransformFilterToArray(filters);
  }

  getJsonFilters(): string {
    const filter = this.getFiltersArray(this.filters);
    if (filter?.length) {
      return JSON.stringify(filter);
    } else {
      return null;
    }
  }
}

/**
 * Public function
 * Get available plain JSON with children from FilterInput and other types
 * @param filters
 * @constructor
 */
export function TransformFiltersToJson(
  filters:
    | filtersPlainType
    | filtersType
    | Array<FilterInputPlain | FilterInputArray | FilterInput<any>>
): string {
  const filter = TransformFilterToArray(filters);
  if (filter?.length) {
    return JSON.stringify(filter);
  } else {
    return null;
  }
}

/**
 * Public function
 * Get available plain with children from FilterInput and other types
 * @param filters
 * @constructor
 */
export function TransformFilterToArray(
  filters:
    | filtersPlainType
    | filtersType
    | Array<FilterInputPlain | FilterInputArray | FilterInput<any>>
): FilterInputArray[] {
  return Object.keys(filters)
    .map((key) => filters[key])
    .filter(IsAvailableFilter)
    .map(GetFilterPlainWithChildren)
    .filter((f) => f);
}

/**
 * Private function
 * Get filterInput with children
 * @param filter
 * @constructor
 */
function GetFilterPlainWithChildren(filter: FilterInput<any>) {
  if (filter.children) {
    const children = TransformFilterToArray(filter.children);
    if (children.length) {
      return {
        operator: filter.operator,
        children,
      };
    }
  } else {
    return GetFilterPlain(filter);
  }
}

/**
 * Private function
 * Check if filterInput is available
 * @param f
 * @constructor
 */
function IsAvailableFilter(f: FilterInput<any>) {
  if (
    f.options?.nullable &&
    (f.search || f.search === null || f.search === false || f.search === 0) &&
    f.field !== null
  ) {
    return true;
  }
  const childLength = Object.keys(f.children)?.length;
  return (
    (f.search !== undefined &&
      f.search !== null &&
      f.search !== '' &&
      !isNaN(f.search) &&
      f.field !== null) ||
    childLength
  );
}

/**
 * Private function
 * Get plain from FilterInput
 * @param filter
 * @constructor
 */
function GetFilterPlain(
  filter: FilterInputPlain | FilterInputArray | FilterInput<any>
) {
  return {
    field: filter.field,
    search: filter.search,
    condition: filter.condition,
  };
}
