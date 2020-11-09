import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

type httpOptions = {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

export abstract class ApiService {
  protected abstract debug: boolean;
  protected abstract apiUrl: string;

  constructor(protected http: HttpClient) {}

  get(url: string, options?: httpOptions): Observable<any> {
    return this.http.get(`${this.apiUrl}/${url}`, options);
  }

  post(url: string, data: any, options?: httpOptions): Observable<any> {
    return this.http.post(`${this.apiUrl}/${url}`, data, options);
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

