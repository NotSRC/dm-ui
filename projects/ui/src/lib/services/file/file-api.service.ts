import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { HttpClient } from '@angular/common/http';
import { ApiConfig } from './../../models/api-config.model';

@Injectable({
  providedIn: 'root',
})
export class FileApiService extends ApiService {
  protected debug;
  protected apiUrl;

  constructor(
    protected httpClient: HttpClient,
    private apiConfig: ApiConfig
  ) {
    super(httpClient as any);
    this.apiUrl = apiConfig.apiUrl;
    this.debug = apiConfig.isProduction;
  }
}
