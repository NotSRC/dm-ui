import { HttpClient } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

abstract class ApiService {
  protected abstract debug: boolean;
  protected abstract apiUrl: string;

  constructor(protected http: HttpClient) {}

  get(url: string, params: Params = {}): Observable<any> {
    if (this.debug) {
      console.log('get', url, params);
    }
    return this.http.get(`${this.apiUrl}/${url}`, { params }).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  post(url: string, data: any): Observable<any> {
    if (this.debug) {
      console.log('post', url, data);
    }
    return this.http.post(`${this.apiUrl}/${url}`, data).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  patch(url: string, data: any): Observable<any> {
    if (this.debug) {
      console.log('patch', url, data);
    }
    return this.http.patch(`${this.apiUrl}/${url}`, data).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  delete(url: string, params: Params = {}): Observable<any> {
    if (this.debug) {
      console.log('delete', url);
    }
    return this.http.delete(`${this.apiUrl}/${url}`, { params }).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }

  getSingle(url: string, params: Params = {}): Observable<any> {
    if (this.debug) {
      console.log('getSingle', url);
    }
    return this.http.get(`${this.apiUrl}/${url}`, { params }).pipe(
      tap(res => {
        if (this.debug) {
          console.log(res);
        }
      })
    );
  }
}

