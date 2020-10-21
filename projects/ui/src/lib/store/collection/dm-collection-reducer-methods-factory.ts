import {
  EntityCollectionReducerMethodMap,
  EntityDefinitionService,
} from '@ngrx/data';
import { Injectable } from '@angular/core';
import { DmCollectionReducerMethods } from './dm-collection-reducer-methods';

@Injectable()
export class DmCollectionReducerMethodsFactory {
  constructor(private entityDefinitionService: EntityDefinitionService) {}

  create<T>(entityName: string): EntityCollectionReducerMethodMap<T> {
    const definition = this.entityDefinitionService.getDefinition<T>(
      entityName
    );
    const methodsClass = new DmCollectionReducerMethods(entityName, definition);
    return methodsClass.methods;
  }
}
