import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, Inject, Input, Output, PLATFORM_ID } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { debounceTime, filter, mergeMap, takeUntil, tap } from 'rxjs/operators';

const styles = `
<style>
  .drag-and-drop-uploader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    display: none;
    background: #1AB394;
    border: 2px solid #198B6F;
    border-radius: 4px;
    opacity: .5;
    align-items: center;
    justify-content: center;
  }

  .drag-and-drop-uploader span {
    font-size: 30px;
  }

  .drag-and-drop-uploader.showed {
    display: flex;
  }

  .drag-and-drop-uploader input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

</style>
`;

@Directive({
  selector: '[dmDragAndDropUpload]'
})
export class DragAndDropUploadDirective {


  //Size in Megabyte
  @Input() size = 2000;
  @Input() disabled = false;
  @Input() inputName = 'file';
  @Input() accept: string[] = ['image/png', 'image/jpeg', 'image/gif', 'image/heic'];
  @Output() uploadFile = new EventEmitter<FormData>();
  @HostBinding('style.position') position = 'relative';
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private subscription = new Subject();

  constructor(
    private el: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.form = document.createElement('form');
      this.input = document.createElement('input');
      this.el.nativeElement.insertAdjacentHTML('afterbegin', styles);
      this.el.nativeElement.appendChild(this.form);
      this.form.appendChild(this.input);
      this.initListeners();
      this.initInput();
      this.initForm();
    }

  }

  initForm() {
    this.form.className = 'drag-and-drop-uploader';

    const span = document.createElement('span');
    span.innerText = 'Drop your file';
    this.form.appendChild(span);
  }

  initInput() {
    this.input.type = 'file';
    this.input.accept = this.accept.join(',');
    this.input.name = this.inputName;
  }

  initListeners() {

    const dragLeave = new Subject<DragEvent>();
    const leaveFilter = new Subject<{ filter: boolean, event: DragEvent }>();

    fromEvent(this.input, 'change')
      .pipe(takeUntil(this.subscription))
      .pipe(filter(() => !this.disabled))
      .subscribe((e: DragEvent) => this.fileUpload());

    fromEvent(document, 'dragleave')
      .pipe(takeUntil(this.subscription))
      .pipe(filter(() => !this.disabled))
      .subscribe((e: DragEvent) => dragLeave.next(e));

    fromEvent(document, 'dragover')
      .pipe(takeUntil(this.subscription))
      .pipe(filter(() => !this.disabled))
      .subscribe((e: DragEvent) => leaveFilter.next({filter: false, event: e}));

    leaveFilter
      .pipe(takeUntil(this.subscription))
      .pipe(filter(() => !this.disabled))
      .pipe(tap(val => this.dragEnter(val.event)))
      .pipe(filter(val => !val.filter))
      .pipe(debounceTime(500))
      .subscribe((val) => leaveFilter.next({...val, filter: true}));

    dragLeave
      .pipe(takeUntil(this.subscription))
      .pipe(filter(() => !this.disabled))
      .pipe(mergeMap(() => leaveFilter))
      .pipe(filter(val => val.filter))
      .pipe(debounceTime(100))
      .subscribe(() => this.dragLeave());
  }

  dragEnter(event: DragEvent) {
    event.preventDefault();
    this.form.classList.add('showed');
  }

  dragLeave() {
    this.form.classList.remove('showed');
  }

  fileUpload() {
    const formData = new FormData(this.form);
    const file = formData.get(this.inputName) as File;
    if (this.fileAcceptIsValid(file) && this.fileSizeIsValid(file)) {
      this.uploadFile.emit(formData);
      this.cd.detectChanges();
    }
    this.form.reset();
  }

  fileAcceptIsValid(file: File) {
    return this.accept.includes(file.type);
  }

  fileSizeIsValid(file: File) {
    return (file.size / 1024) / 1024 < this.size;
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
  }

}
