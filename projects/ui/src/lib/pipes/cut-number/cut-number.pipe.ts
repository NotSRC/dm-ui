import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cutNumber'
})
export class CutNumberPipe implements PipeTransform {

  transform(value: number|string, ...args: unknown[]): string {
    if (typeof value === 'string') {
      value = Number(value);
    }
    if (value > 999999) {
      return `${(value / 1000000).toFixed(2)} m`;
    }
    if (value > 999) {
      return `${(value / 1000).toFixed(1)} k`;
    }

    return `${Math.round((value))}`;
  }

}
