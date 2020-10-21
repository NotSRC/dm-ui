import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  DefaultDataServiceConfig,
  EntityCollectionCreator,
  EntityCollectionReducerMethodsFactory,
  EntityCollectionServiceFactory,
  PersistenceResultHandler,
} from '@ngrx/data';
import { DmCollectionCreator } from './collection/dm-collection-creator.service';
import { DmPersistenceResultHandler } from './data-service/dm-result-handler';
import { DmCollectionReducerMethodsFactory } from './collection/dm-collection-reducer-methods-factory';
import { DmCollectionServiceFactory } from './collection/dm-collection-service-factory.service';

// {
//   provide: DefaultDataServiceFactory,
//   useClass: DmDataServiceFactory,
// };

@NgModule({})
export class DmStoreModule {
  static forRoot(
    defaultDataServiceConfig: DefaultDataServiceConfig
  ): ModuleWithProviders<DmStoreModule> {
    return {
      ngModule: DmStoreModule,
      providers: [
        {
          provide: DefaultDataServiceConfig,
          useValue: defaultDataServiceConfig,
        },
        {
          provide: EntityCollectionServiceFactory,
          useClass: DmCollectionServiceFactory,
        },
        {
          provide: EntityCollectionReducerMethodsFactory,
          useClass: DmCollectionReducerMethodsFactory,
        },
        {
          provide: PersistenceResultHandler,
          useClass: DmPersistenceResultHandler,
        },
        {
          provide: EntityCollectionCreator,
          useClass: DmCollectionCreator,
        },
      ],
    };
  }
}
