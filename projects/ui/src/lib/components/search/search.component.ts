import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'dm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent), // replace name as appropriate
      multi: true,
    },
  ],
})
export class SearchComponent implements ControlValueAccessor {

  @ViewChild('input') private input: ElementRef<HTMLInputElement>;
  @Output() search = new EventEmitter<string>();
  @Input() maxlength: number | string = null;
  @Input() placeholder: string = 'Search';

  value: string = '';

  onChange: any = (_: any) => {
    this.value = _;
  };
  onTouch: any = (_: any) => {
    this.value = _;
  };

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  changeValue(value: string) {
    this.value = value;
    this.onChange(value);
    this.search.emit(value);
  }
}
