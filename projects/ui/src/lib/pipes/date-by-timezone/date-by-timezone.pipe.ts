import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateByTimezone'
})
export class DateByTimezonePipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {

  }

  transform(
    value: any,
    format?: string,
    timezone = (new Date()).getTimezoneOffset(),
    locale?: string
  ) {
    return this.datePipe.transform(value, format, `${timezone * -1}`, locale);
  }

}
