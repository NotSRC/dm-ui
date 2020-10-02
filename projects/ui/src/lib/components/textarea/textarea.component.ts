import { AfterViewInit, Component, ElementRef, forwardRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'dm-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent), // replace name as appropriate
      multi: true,
    },
  ],
})
export class TextareaComponent implements AfterViewInit, ControlValueAccessor {

  @Input() parentFormControlName: string;
  @Input() placeholder: string;
  @ViewChild('trix', {static: false}) private trix: ElementRef;
  @ViewChild('trixInput', {static: false}) private trixInput: ElementRef;

  private editor: any;
  length: number = 0;
  value = '';

  ngAfterViewInit() {
    this.trix.nativeElement.addEventListener('trix-initialize', () => {
      this.editor = this.trix.nativeElement.editor;
      this.editor.insertHTML(this.value || null);
      this.trix.nativeElement.addEventListener('trix-change', (event) => {
        this.length = event.target.innerText?.length;
        this.changeValue(event.target.innerHTML);
      });
      (<HTMLElement> document.activeElement).blur();
    });
  }

  setEditorValue() {
    this.editor?.insertHTML(this.value || null);
    this.length = this.value?.length;
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
    this.setEditorValue();
  }

  changeValue(value: string) {
    this.value = value;
    this.onChange(value);
  }

}
