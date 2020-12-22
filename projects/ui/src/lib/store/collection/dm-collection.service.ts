import { EntityCollectionServiceBase } from '@ngrx/data';
import { BehaviorSubject } from 'rxjs';
import { createSelector } from '@ngrx/store';
import { Pagination } from '../models/pagination.model';
import { map } from 'rxjs/operators';
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

  clearCache() {
    this.pagination.next({});
    super.clearCache();
  }
}
