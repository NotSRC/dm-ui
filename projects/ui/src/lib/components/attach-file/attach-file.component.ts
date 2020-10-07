import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'dm-attach-file',
  templateUrl: './attach-file.component.html',
  styleUrls: ['./attach-file.component.scss']
})
export class AttachFileComponent {

  //Size in Megabyte
  @Input() size = 5;
  @Input() inputName = 'file';
  @Input() accept: string[] = ['image/png', 'image/jpeg', 'image/gif', 'image/heic', 'application/pdf'];
  @Output() uploadFile = new EventEmitter<FormData>();
  @ViewChild('form') private form: ElementRef<HTMLFormElement>;

  sizeError = false;

  fileUpload() {
    const formData = new FormData(this.form.nativeElement);
    const file = formData.get(this.inputName) as File;
    if (file && this.fileSizeIsValid(file)) {
      this.uploadFile.emit(formData);
    } else {
      this.sizeError = true;
    }
    this.form.nativeElement.reset();
  }

  resetForm() {
    this.form.nativeElement.reset();
    this.sizeError = false;
  }

  fileSizeIsValid(file: File) {
    return (file.size / 1000) / 1000 < this.size;
  }

}
