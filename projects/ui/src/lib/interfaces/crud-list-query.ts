export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export interface CrudListQuery {
  page?: number;
  filter?: string;
  perPage?: number;
  sortField?: string;
  sortDirection?: SortDirection;
}
