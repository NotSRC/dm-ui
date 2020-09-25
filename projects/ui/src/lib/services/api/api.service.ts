import { HttpClient } from '@angular/common/http';
import { Params } from '@angular/router';

export abstract class ApiService {
  protected abstract debug: boolean;
  protected abstract apiUrl: string;

  constructor(protected http: HttpClient) {
  }

  get(url: string, params: Params = {}) {
    if (this.debug) {
      console.log('get', url, params);
    }
    const res = this.http
      .get(`${this.apiUrl}/${url}`, {params});
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  post(url: string, data: any) {
    if (this.debug) {
      console.log('post', url, data);
    }
    const res = this.http.post(`${this.apiUrl}/${url}`, data).toPromise();
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  patch(url: string, data: any) {
    if (this.debug) {
      console.log('patch', url, data);
    }
    const res = this.http
      .patch(`${this.apiUrl}/${url}`, data);
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  delete(url: string, params: Params = {}) {
    if (this.debug) {
      console.log('delete', url);
    }
    const res = this.http
      .delete(`${this.apiUrl}/${url}`, {params});
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  getSingle(url: string, params: Params = {}) {
    if (this.debug) {
      console.log('getSingle', url);
    }
    const res = this.http
      .get(`${this.apiUrl}/${url}`, {params});
    if (this.debug) {
      console.log(res);
    }
    return res;
  }
}
