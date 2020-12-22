import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { createSelector } from '@ngrx/store';
import { Pagination } from '../models/pagination.model';
import { map } from 'rxjs/operators';
import { BaseEntityModel } from '../models/base-entity.model';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data/src/entity-services/entity-collection-service-elements-factory';

@Injectable({
  providedIn: 'root',
})
export class DmCollectionService<
  T extends BaseEntityModel
> extends EntityCollectionServiceBase<T> {
  constructor(
    entityName: string,
    serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super(entityName, serviceElementsFactory);
    this.paginationSelector.subscribe((val) => {
      this.pagination.next(val);
    });
  }

  private paginationSelector = this.store.select(
    createSelector(this.selectors.selectCollection, (collection: any) => {
      return collection.pagination;
    })
  );
  private pagination = new BehaviorSubject<Pagination>({});
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
