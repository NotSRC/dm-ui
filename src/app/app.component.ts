import { Component } from '@angular/core';
import { QueryParamsBuilder } from '../../projects/ui/src/lib/services/query/query-builder';
import { QuerySetter } from '../../projects/ui/src/lib/services/query/query-setter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dm-ui';

  queryBuilder = new QueryParamsBuilder();
  querySetter = new QuerySetter();

  constructor() {

    this.queryBuilder.onChange$.subscribe(res => {
      this.querySetter.setQueryParams(res);
    });
    this.queryBuilder.setFromObject(this.querySetter.getQueryParams());
  }
}
