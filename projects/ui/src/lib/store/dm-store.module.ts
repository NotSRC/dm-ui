import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DefaultDataServiceConfig,
  EntityCollectionCreator,
  EntityCollectionReducerMethodsFactory,
  EntityCollectionServiceFactory,
  EntityMetadataMap,
  PersistenceResultHandler,
} from '@ngrx/data';
import { DmCollectionCreator } from './collection/dm-collection-creator.service';
import { DmPersistenceResultHandler } from './data-service/dm-result-handler';
import { DmCollectionReducerMethodsFactory } from './collection/dm-collection-reducer-methods-factory';
import { DmCollectionServiceFactory } from './collection/dm-collection-service-factory.service';
import { HttpClientModule } from '@angular/common/http';

export interface DmStoreConfig {
  entityConfig: EntityMetadataMap;
  defaultDataServiceConfig: DefaultDataServiceConfig;
}

// export const DmDataServiceProvider = {
//   provide: DefaultDataServiceFactory,
//   useClass: DmDataServiceFactory,
// };

@NgModule({})
export class DmStoreModule {
  static forRoot(config: DmStoreConfig): ModuleWithProviders<DmStoreModule> {
    return {
      ngModule: DmStoreModule,
      providers: [
        {
          provide: DefaultDataServiceConfig,
          useValue: config.defaultDataServiceConfig,
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
