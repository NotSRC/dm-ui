import { Injectable, Optional } from '@angular/core';
import { EntityCollection, EntityDefinitionService } from '@ngrx/data';

@Injectable()
export class DmCollectionCreator {
  constructor(
    @Optional() private entityDefinitionService?: EntityDefinitionService
  ) {}

  create<T = any, S extends EntityCollection<T> = EntityCollection<T>>(
    entityName: string
  ): S {
    return <S>createEmptyEntityCollection<T>(entityName);
  }
}

export function createEmptyEntityCollection<T>(
  entityName?: string
): EntityCollection<T> {
  return {
    entityName,
    ids: [],
    entities: {},
    loaded: false,
    loading: false,
    pagination: {},
    changeState: {},
  } as EntityCollection<T>;
}
