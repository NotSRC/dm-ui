import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { DmCollectionService } from './dm-collection.service';
import { BaseEntityModel } from '../models/base-entity.model';

@Injectable({
  providedIn: 'root',
})
export class DmCollectionServiceFactory {
  constructor(
    public entityCollectionServiceElementsFactory: EntityCollectionServiceElementsFactory
  ) {}

  create<T extends BaseEntityModel>(
    entityName: string
  ): DmCollectionService<T> {
    return new DmCollectionService<T>(
      entityName,
      this.entityCollectionServiceElementsFactory
    );
  }
}
