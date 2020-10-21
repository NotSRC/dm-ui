import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  DefaultDataService,
  DefaultDataServiceConfig,
  HttpUrlGenerator,
} from '@ngrx/data';

@Injectable({
  providedIn: 'root',
})
export class DmDataService<T> extends DefaultDataService<T> {
  constructor(
    http: HttpClient,
    entityName: string,
    httpUrlGenerator: HttpUrlGenerator,
    config?: DefaultDataServiceConfig
  ) {
    super(entityName, http, httpUrlGenerator, config);
  }
}
