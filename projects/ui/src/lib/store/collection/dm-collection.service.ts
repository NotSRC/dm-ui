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
  private paginationSelector = createSelector(
    this.selectors.selectCollection,
    (collection: any) => {
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
    this.paginationSelector.clearResult();
    this.paginationSelector.release();
    super.clearCache();
  }
}
