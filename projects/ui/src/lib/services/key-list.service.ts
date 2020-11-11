import { QueryParams } from '@ngrx/data';
import { Observable } from 'rxjs';
import { BaseResult } from '../interfaces/base-result';
import { KeyListModel } from '../models/keylist-model';

export abstract class KeyListService {
  abstract getKeyList(
    queryParams: QueryParams
  ): Observable<BaseResult<KeyListModel>>;
}
