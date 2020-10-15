import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Injector,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class TextareaComponent
  implements AfterViewInit, ControlValueAccessor, OnDestroy {
  @Input() parentFormControlName: string;
  @Input() placeholder: string;
  @ViewChild('trix', { static: false }) private trix: ElementRef;
  @ViewChild('trixInput', { static: false }) private trixInput: ElementRef;

  formControl: AbstractControl = new FormControl();
  private subscription = new Subject();
  private editor: any;
  length: number = 0;
  value = '';

  constructor(private injector: Injector) {}

  ngAfterViewInit() {
    fromEvent(this.trix.nativeElement, 'trix-initialize')
      .pipe(takeUntil(this.subscription))
      .subscribe(() => {
        this.editor = this.trix.nativeElement.editor;
        this.editor.insertHTML(this.value || null);
        this.trix.nativeElement.addEventListener('trix-change', (event) => {
          this.length = event.target.innerText?.length;
          this.changeValue(event.target.innerHTML);
        });
        (<HTMLElement>document.activeElement).blur();
      });
    fromEvent(this.trix.nativeElement, 'click')
      .pipe(takeUntil(this.subscription))
      .subscribe(() => {
        this.formControl.markAsTouched();
      });
    setTimeout(() => {
      const ngControl: NgControl = this.injector.get(NgControl, null);
      if (ngControl && ngControl.control) {
        this.formControl = ngControl.control as FormControl;
      }
    });
  }

  ngOnDestroy() {
    this.subscription.next();
    this.subscription.complete();
  }

  setEditorValue() {
    this.editor?.setSelectedRange([0, this.length]);
    this.editor?.deleteInDirection('forward');
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
