import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Inputmask from 'inputmask';

@Directive({
  selector: 'input[dmIntegerMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IntegerMaskDirective), // replace name as appropriate
      multi: true,
    },
  ],
})
export class IntegerMaskDirective implements ControlValueAccessor, OnChanges {
  @Input() min: number = null;
  @Input() max: number = null;
  @Input() suffix: string = null;
  @Input() prefix: string = null;
  @Input() separator: string = '';

  value: number | string;
  private inputMasked: Inputmask;

  constructor(private el: ElementRef, private renderer2: Renderer2) {}

  // https://github.com/RobinHerbots/Inputmask/blob/5.x/lib/extensions/inputmask.numeric.extensions.js
  get options() {
    const options: any = {
      alias: 'integer',
      min: this.min as any,
      max: this.max as any,
      groupSeparator: this.separator || '',
      rightAlign: false,
      unmaskAsNumber: false,
      showMaskOnHover: false,
      showMaskOnFocus: false,
      clearMaskOnLostFocus: true,
      digitsOptional: true,
      allowMinus: false,
      placeholder: '',
      enforceDigitsOnBlur: false,
      nullable: true,
    };
    if (this.prefix) {
      options.prefix = this.prefix;
    }
    if (this.suffix) {
      options.suffix = this.suffix;
    }
    return options;
  }

  @HostListener('input', ['$event.target'])
  inputListener(target: HTMLInputElement) {
    const val = parseInt(target.value, 10);
    const resValue = val || val === 0 ? val : null;
    this.changeValue(resValue);
  }

  ngOnChanges(): void {
    this.unmaskInput();
    this.maskInput();
  }

  unmaskInput() {
    if (this.inputMasked) {
      this.inputMasked.remove();
      this.inputMasked = null;
    }
  }

  maskInput() {
    if (!this.inputMasked) {
      this.inputMasked = Inputmask(this.options).mask(this.el.nativeElement);
    }
  }

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
    this.renderer2.setValue(this.el.nativeElement, value);
    this.inputMasked.setValue(value || '');
  }

  changeValue(value: number) {
    this.value = value;
    this.onChange(this.value);
  }
}
