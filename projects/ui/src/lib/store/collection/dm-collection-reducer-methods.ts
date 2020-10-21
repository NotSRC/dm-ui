import {
  EntityAction,
  EntityCollection,
  EntityCollectionReducerMethods,
  EntityDefinition,
} from '@ngrx/data';
import { DmCollectionOperations } from './dm-collection-operations';

export class DmCollectionReducerMethods<
  T
> extends EntityCollectionReducerMethods<T> {
  constructor(
    public entityName: string,
    public definition: EntityDefinition<T>
  ) {
    super(entityName, definition);

    this.methods[DmCollectionOperations.SET_FIELDS] = this.setFields.bind(this);
  }

  // save data from PersistenceResultHandler to action.payload
  protected queryManySuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    const entityCollection: any = super.queryLoadSuccess(collection, action);
    if ((action.payload as any).pagination) {
      entityCollection.pagination = (action.payload as any).pagination;
    }
    return entityCollection;
  }

  protected setFields(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    return <EntityCollection>{ ...collection, fields: action.payload.data };
  }
}
