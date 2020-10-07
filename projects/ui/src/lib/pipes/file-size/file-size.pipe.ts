import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  transform(value: number|string, ...args: unknown[]): unknown {

    if (typeof value === 'string') {
      value = Number(value);
    }

    value = value / 1000;

    if (value > 999999) {
      return `${(value / 1000000)?.toFixed(2)} Gb`;
    }
    if (value > 999) {
      return `${(value / 1000)?.toFixed(2)} Mb`;
    }

    return `${Math.round(value)} Kb`;
  }

}
