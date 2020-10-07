import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { HttpClient } from '@angular/common/http';
import { ApiConfig } from '../../models/api-config.model';

@Injectable({
  providedIn: 'root',
})
export class FileApiService extends ApiService {
  apiUrl = this.apiConfig.apiUrl;
  debug = this.apiConfig.isProduction;

  constructor(
    protected httpClient: HttpClient,
    private apiConfig: ApiConfig
  ) {
    super(httpClient as any);
  }
}
