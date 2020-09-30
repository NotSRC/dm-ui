export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export interface CrudListQuery {
  page?: number;
  filter?: string;
  limit?: number;
  sortField?: string;
  sortDirection?: SortDirection | 'asc' | 'desc';
}
