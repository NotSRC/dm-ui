import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

type httpOptions = {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
};

export abstract class ApiService {
  protected abstract apiUrl: string;

  constructor(protected http: HttpClient) {}

  get(url: string, options?: httpOptions): Observable<any> {
    return this.http.get(`${this.apiUrl}/${url}`, options);
  }

  post(url: string, data: any, options?: httpOptions): Observable<any> {
    return this.http.post(`${this.apiUrl}/${url}`, data, options);
  }

  put(url: string, data: any, options?: httpOptions): Observable<any> {
    return this.http.put(`${this.apiUrl}/${url}`, data, options);
  }

  patch(url: string, data: any, options: httpOptions): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${url}`, data, options);
  }

  delete(url: string, options?: httpOptions): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${url}`, options);
  }

  getSingle(url: string, options?: httpOptions): Observable<any> {
    return this.http.get(`${this.apiUrl}/${url}`, options);
  }
}
