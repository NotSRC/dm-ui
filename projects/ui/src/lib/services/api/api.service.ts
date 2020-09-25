import { HttpClient } from '@angular/common/http';
import { Params } from '@angular/router';
import { Injectable } from '@angular/core';


@Injectable()
export abstract class ApiService {
  protected abstract debug: boolean;
  protected abstract apiUrl: string;

  constructor(private http: HttpClient) {
  }

  async get(url: string, params: Params = {}): Promise<any> {
    if (this.debug) {
      console.log('get', url, params);
    }
    const res = await this.http
      .get(`${this.apiUrl}/${url}`, { params })
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  async post(url: string, data: any): Promise<any> {
    if (this.debug) {
      console.log('post', url, data);
    }
    const res = await this.http.post(`${this.apiUrl}/${url}`, data).toPromise();
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  async patch(url: string, data: any): Promise<any> {
    if (this.debug) {
      console.log('patch', url, data);
    }
    const res = await this.http
      .patch(`${this.apiUrl}/${url}`, data)
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  async delete(url: string, params: Params = {}): Promise<any> {
    if (this.debug) {
      console.log('delete', url);
    }
    const res = await this.http
      .delete(`${this.apiUrl}/${url}`, { params })
    if (this.debug) {
      console.log(res);
    }
    return res;
  }

  async getSingle(url: string, params: Params = {}): Promise<any> {
    if (this.debug) {
      console.log('getSingle', url);
    }
    const res = await this.http
      .get(`${this.apiUrl}/${url}`, { params })
    if (this.debug) {
      console.log(res);
    }
    return res;
  }
}
