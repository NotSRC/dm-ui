import {
  FilterConditions,
  FilterInput,
  FilterOperators,
} from './filter.service';

export function arrayFilterParser<T>(search: T[], filter: FilterInput<T>) {
  const filters = [];
  search?.forEach((arrayItem) => {
    filters.push(
      new FilterInput({
        search: arrayItem,
        field: filter.field,
        condition: FilterConditions.Equal,
      })
    );
  });
  filter.operator = FilterOperators.Or;
  filter.children = filters;
  return search;
}

export function escapeRegExpSymbolsParser(str: string = '') {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function replaceInStringParser(string: string, searchValue: string, replaceValue: string) {
  return string?.toUpperCase()?.replace(searchValue, replaceValue);
}

export function toNumberParser(string: string) {
  return Number(string);
}
