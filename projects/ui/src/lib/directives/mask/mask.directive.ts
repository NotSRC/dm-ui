import { Directive, ElementRef, forwardRef, HostListener, Input, OnChanges, OnInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Inputmask from 'inputmask';
import { Instance, Options } from 'inputmask';

@Directive({
  selector: 'input[dmMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskDirective), // replace name as appropriate
      multi: true,
    },
  ],
})
export class MaskDirective implements ControlValueAccessor, OnChanges, OnInit {
  @Input() dmMask: string;
  @Input('options') inputOptions: Options = {};

  get options() {
    return {
      ...this.inputOptions
    };
  }

  private value: string = '';
  private inputMasked: Instance;

  constructor(private el: ElementRef, private renderer2: Renderer2) {
  }

  ngOnInit() {
    this.unmaskInput();
    this.maskInput();
  }

  ngOnChanges(): void {
    this.unmaskInput();
    this.maskInput();
  }

  @HostListener('input', ['$event.target'])
  inputListener(target: HTMLInputElement) {
    this.changeValue(target.value);
  }

  unmaskInput() {
    if (this.inputMasked) {
      this.inputMasked.remove();
      this.inputMasked = null;
    }
  }

  maskInput() {
    if (!this.inputMasked) {
      this.inputMasked = Inputmask(this.dmMask, this.options).mask(this.el.nativeElement);
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
    if (!!value) {
      this.inputMasked.setValue(value);
    }
  }

  changeValue(value: string) {
    this.value = value;
    this.onChange(this.value);
  }
}
