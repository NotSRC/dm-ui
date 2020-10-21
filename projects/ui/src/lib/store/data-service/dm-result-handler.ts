import { DefaultPersistenceResultHandler, EntityAction } from '@ngrx/data';
import { Action } from '@ngrx/store';

export class DmPersistenceResultHandler extends DefaultPersistenceResultHandler {
  // return a factory to get a data handler to
  // parse data from DataService and save to action.payload
  handleSuccess(originalAction: EntityAction): (data: any) => Action {
    const actionHandler = super.handleSuccess(originalAction);
    return (data: any) => {
      const action = actionHandler.call(this, data);
      if (action && data) {
        if (data.docs) {
          action.payload.data = data.docs;
          action.payload.pagination = {
            limit: data.limit,
            page: data.page,
            pages: data.pages,
            total: data.total,
          };
        }
      }
      return action;
    };
  }
}
