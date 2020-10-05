import { Pipe } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateByTimezone'
})
export class DateByTimezonePipe extends DatePipe {

  transform(
    value: any,
    format?: string,
    timezone = (new Date()).getTimezoneOffset().toString(),
    locale?: string
  ) {
    return super.transform(value, format, timezone, locale);
  }

}
