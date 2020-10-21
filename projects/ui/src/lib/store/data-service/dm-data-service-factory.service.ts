import { HttpClient } from '@angular/common/http';
import { Optional } from '@angular/core';
import {
  DefaultDataServiceConfig,
  EntityCollectionDataService,
  HttpUrlGenerator,
} from '@ngrx/data';
import { DmDataService } from './dm-data.service';

export class DmDataServiceFactory {
  constructor(
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator,
    @Optional() protected config?: DefaultDataServiceConfig
  ) {
    this.config = config || {};
    httpUrlGenerator.registerHttpResourceUrls(config.entityHttpResourceUrls);
  }

  /**
   * Create a default {EntityCollectionDataService} for the given entity type
   * @param entityName Name of the entity type for this data service
   */
  create<T>(entityName: string): EntityCollectionDataService<T> {
    return new DmDataService<T>(
      this.http,
      entityName,
      this.httpUrlGenerator,
      this.config
    );
  }
}
