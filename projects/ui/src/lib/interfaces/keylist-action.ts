import { QueryParams } from '@ngrx/data';
import { Observable } from 'rxjs';
import { BaseResult } from './base-result';
import { KeyListModel } from './keylist-model';

export interface KeyListAction {
  getKeyList(queryParams: QueryParams): Observable<BaseResult<KeyListModel>>;
}
