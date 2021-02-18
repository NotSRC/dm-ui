import { EntityCollectionServiceBase } from '@ngrx/data';
import { BehaviorSubject, of } from 'rxjs';
import { createSelector } from '@ngrx/store';
import { Pagination } from '../models/pagination.model';
import { map, mergeMap, take } from 'rxjs/operators';
import { BaseEntityModel } from '../models/base-entity.model';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data/src/entity-services/entity-collection-service-elements-factory';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
export class DmCollectionService<
  T extends BaseEntityModel
> extends EntityCollectionServiceBase<T> {
  private pagination = new BehaviorSubject<Pagination>({});
  private paginationSelector = this.store.select(
    createSelector(this.selectors.selectCollection, (collection: any) => {
      return collection.pagination as Pagination;
    })
  );
  public pagination$ = this.pagination.asObservable();

  constructor(
    entityName: string,
    serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super(entityName, serviceElementsFactory);
    this.paginationSelector.pipe(untilDestroyed(this)).subscribe((val) => {
      this.pagination.next(val);
    });
  }

  getFromCacheById(id: string) {
    return this.entities$.pipe(
      map((res) => res?.find((entity) => entity._id === id))
    );
  }

  getFromCacheOrLoad(id: string) {
    return this.getFromCacheById(id).pipe(
      take(1),
      mergeMap((entity) => (entity ? of(entity) : this.getByKey(id)))
    );
  }

  clearCache() {
    this.pagination.next({});
    super.clearCache();
  }
}
