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
    if (this.debug) {
      console.log('get', url, options);
    }
    return this.http.get(`${this.apiUrl}/${url}`, options).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  post(url: string, data: any, options?: httpOptions): Observable<any> {
    if (this.debug) {
      console.log('post', url, data, options);
    }
    return this.http.post(`${this.apiUrl}/${url}`, data, options).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  patch(url: string, data: any, options: httpOptions): Observable<any> {
    if (this.debug) {
      console.log('patch', url, data);
    }
    return this.http.patch(`${this.apiUrl}/${url}`, data, options).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  delete(url: string, options?: httpOptions): Observable<any> {
    if (this.debug) {
      console.log('delete', url);
    }
    return this.http.delete(`${this.apiUrl}/${url}`, options).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  getSingle(url: string, options?: httpOptions): Observable<any> {
    if (this.debug) {
      console.log('getSingle', url);
    }
    return this.http.get(`${this.apiUrl}/${url}`, options).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }
}

