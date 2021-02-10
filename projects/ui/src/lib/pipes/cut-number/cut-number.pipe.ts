import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'cutNumber',
})
export class CutNumberPipe implements PipeTransform {
  constructor(private decimalPipe: DecimalPipe) {}

  transform(
    value: number,
    start: 'k' | 'm' = 'k',
    digitsInfo?: string,
    locale?: string
  ): string {
    if (typeof value === 'string') {
      value = Number(value);
    }

    if (value >= 1000000) {
      return `${this.decimalPipe.transform(
        value / 1000000,
        digitsInfo,
        locale
      )} m`;
    }
    if (value >= 1000 && start === 'k') {
      return `${this.decimalPipe.transform(
        value / 1000,
        digitsInfo,
        locale
      )} k`;
    }

    return this.decimalPipe.transform(Math.round(value), digitsInfo, locale);
  }
}
