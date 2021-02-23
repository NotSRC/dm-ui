export enum FilterConditions {
  Equal = 'EQ',
  Greater = 'GT',
  GreaterOrEqual = 'GTE',
  LessThen = 'LT',
  LessThenOrEqual = 'LTE',
  Include = 'IN',
  Not = 'NOT',
  NotEqual = 'NE',
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

interface FilterOption {
  nullable?: boolean;
  parseFunction?: Function[] | Function;
}

export class FilterInput<T> {
  constructor(
    params: {
      field?: string;
      search?: T;
      condition?: FilterConditions;
      operator?: FilterOperators;
      children?: filtersType;
    } = {},
    options: FilterOption = {
      nullable: false,
      parseFunction: null,
    }
  ) {
    this.field = params.field;
    this.search = params.search;
    this.condition = params.condition;
    this.operator = params.operator;
    this.children = params.children;
    this.options = options;
  }

  // tslint:disable-next-line:variable-name
  private _field: string;

  get field() {
    return this._field;
  }

  set field(field) {
    this._field = field;
  }

  // tslint:disable-next-line:variable-name
  private _search: T;

  get search() {
    return this._search;
  }

  set search(search) {
    if (
      this.options?.parseFunction &&
      typeof this.options?.parseFunction === 'function'
    ) {
      this._search = this.options.parseFunction(search, this) || null;
    } else if (
      typeof this.options?.parseFunction === 'object' &&
      this.options?.parseFunction?.length
    ) {
      this._search =
        this.options.parseFunction?.reduce((acc, func) => {
          return func(acc, this);
        }, search) || null;
    } else {
      this._search = search;
    }
  }

  // tslint:disable-next-line:variable-name
  private _condition: FilterConditions;

  get condition() {
    return this._condition;
  }

  set condition(condition) {
    this._condition = condition;
  }

  // tslint:disable-next-line:variable-name
  private _operator: FilterOperators;

  get operator() {
    return this._operator;
  }

  set operator(operator) {
    this._operator = operator;
  }

  // tslint:disable-next-line:variable-name
  private _children: filtersType;

  get children() {
    return this._children;
  }

  set children(children) {
    this._children = children;
  }

  // tslint:disable-next-line:variable-name
  private _options: FilterOption;

  get options() {
    return this._options;
  }

  set options(options) {
    this._options = options;
  }
}

export type filtersPlainType = { [key: string]: FilterInputPlain };

export type filtersType =
  | { [key: string]: FilterInput<any> }
  | FilterInput<any>[];

export abstract class FilterService {
  abstract readonly filters: filtersType;

  setFiltersFromPlain(plain: filtersPlainType, filterSrc = this.filters) {
    Object.keys(plain || {}).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(filterSrc, key)) {
        filterSrc[key] = new FilterInput({
          condition: plain[key].condition,
          operator: plain[key].operator,
          field: plain[key].field,
        });
      }

      filterSrc[key].search = plain[key].search;
      if (plain[key].children) {
        this.setFiltersFromPlain(plain[key].children, filterSrc[key].children);
      }
    });
  }

  setFiltersFromArray(plain: filtersPlainType, filterSrc = this.filters) {
    Object.keys(plain || {}).forEach((key) => {
      const field = plain[key].field;
      if (!Object.prototype.hasOwnProperty.call(filterSrc, field)) {
        filterSrc[field] = new FilterInput({
          condition: plain[key].condition,
          operator: plain[key].operator,
          field: plain[key].field,
        });
      }

      filterSrc[field].search = plain[key].search;
      if (plain[key].children) {
        this.setFiltersFromArray(
          plain[key].children,
          filterSrc[field].children
        );
      }
    });
  }

  getFiltersPlain(filters = this.filters): filtersPlainType {
    return Object.keys(filters).reduce((acc, key) => {
      const filter = filters[key];
      if (filter.children) {
        acc[key] = {
          field: filter.field,
          search: filter.search,
          operator: filter.operator,
          children: TransformFilterToPlain(filter.children),
        };
      } else {
        acc[key] = GetFilterPlain(filter);
      }
      return acc;
    }, {});
  }

  getFiltersArray(filters: filtersType = this.filters): FilterInput<any>[] {
    return TransformFilterToArray(filters);
  }

  getJsonFilters(): string {
    return TransformFiltersToJson(this.filters);
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
  const filter = TransformFilterToPlain(filters);
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
): FilterInput<any>[] {
  return Object.keys(filters)
    .map((key) => filters[key])
    .filter(IsAvailableFilter)
    .map(GetFilterWithChildren)
    .filter((f) => f);
}

/**
 * Public function
 * Get available plain with children from FilterInput and other types
 * @param filters
 * @constructor
 */
export function TransformFilterToPlain(
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
function GetFilterWithChildren(filter: FilterInput<any>) {
  if (filter.children) {
    const children = TransformFilterToArray(filter.children);
    if (children.length) {
      return new FilterInput({
        operator: filter.operator,
        children,
      });
    }
  } else {
    return filter;
  }
}

/**
 * Private function
 * Get filterInput with children
 * @param filter
 * @constructor
 */
function GetFilterPlainWithChildren(filter: FilterInput<any>) {
  if (filter.children) {
    const children = TransformFilterToPlain(filter.children);
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
  const childLength = Object.keys(f.children || {})?.length;
  return (
    (f.search !== undefined &&
      f.search !== null &&
      f.search !== '' &&
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
