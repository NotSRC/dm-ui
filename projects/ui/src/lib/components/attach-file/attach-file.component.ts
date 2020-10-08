import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'dm-attach-file',
  templateUrl: './attach-file.component.html',
  styleUrls: ['./attach-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachFileComponent {

  //Size in Megabyte
  @Input() size = 5;
  @Input() disabled = false;
  @Input() inputName = 'file';
  @Input() accept: string[] = ['image/png', 'image/jpeg', 'image/gif', 'image/heic', 'application/pdf'];
  @Output() uploadFile = new EventEmitter<FormData>();
  @ViewChild('form') private form: ElementRef<HTMLFormElement>;

  sizeError = false;
  formatError = false;

  constructor(private cd: ChangeDetectorRef) {

  }


  fileUpload() {
    const formData = new FormData(this.form.nativeElement);
    const file = formData.get(this.inputName) as File;
    if (file && this.fileSizeIsValid(file) && this.fileAcceptIsValid(file)) {
      this.uploadFile.emit(formData);
      this.cd.detectChanges();
    }
    this.form.nativeElement.reset();
  }

  resetForm() {
    this.form.nativeElement.reset();
    this.sizeError = false;
    this.formatError = false;
  }

  fileAcceptIsValid(file: File) {
    if (this.accept.includes(file.type)) {
      return true;
    } else {
      this.formatError = true;
      return false;
    }
  }

  fileSizeIsValid(file: File) {
    if ((file.size / 1000) / 1000 < this.size) {
      return true;
    } else {
      this.sizeError = true;
      return false;
    }
  }

}
