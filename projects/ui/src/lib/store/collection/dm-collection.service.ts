import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase } from '@ngrx/data';
import { Observable } from 'rxjs';
import { createSelector } from '@ngrx/store';
import { Pagination } from '../models/pagination.model';
import { map } from 'rxjs/operators';
import { BaseEntityModel } from '../models/base-entity.model';

@Injectable({
  providedIn: 'root',
})
export class DmCollectionService<
  T extends BaseEntityModel
> extends EntityCollectionServiceBase<T> {
  private pagination: Pagination;
  private paginationSelector = createSelector(
    this.selectors.selectCollection,
    (collection: any) => {
      this.pagination = collection.pagination;
      return collection.pagination;
    }
  );
  public pagination$: Observable<Pagination> = this.store.select(
    this.paginationSelector
  );

  getFromCacheById(id: string) {
    return this.entities$.pipe(
      map((res) => res?.find((entity) => entity._id === id))
    );
  }

  clearCache() {
    delete this.pagination.page;
    delete this.pagination.pages;
    delete this.pagination.limit;
    delete this.pagination.total;
    super.clearCache();
  }
}
