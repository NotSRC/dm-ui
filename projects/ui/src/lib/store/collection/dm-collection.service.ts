import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase } from '@ngrx/data';
import { BehaviorSubject } from 'rxjs';
import { createSelector } from '@ngrx/store';
import { Pagination } from '../models/pagination.model';
import { map } from 'rxjs/operators';
import { BaseEntityModel } from '../models/base-entity.model';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class DmCollectionService<
  T extends BaseEntityModel
> extends EntityCollectionServiceBase<T> {
  private pagination = new BehaviorSubject<Pagination>({});
  private paginationSelector = this.store.select(
    createSelector(this.selectors.selectCollection, (collection: any) => {
      this.pagination.next(collection.pagination);
      return collection.pagination as Pagination;
    })
  );
  public pagination$ = this.pagination.asObservable();

  getFromCacheById(id: string) {
    return this.entities$.pipe(
      map((res) => res?.find((entity) => entity._id === id))
    );
  }

  clearCache() {
    this.pagination.next({});
    super.clearCache();
  }
}
