export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export interface CrudListQuery {
  page?: number;
  filter?: string;
  perPage?: number;
  sortField?: string;
  sortDirection?: SortDirection;
}
