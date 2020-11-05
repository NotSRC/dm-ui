import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'dm-attach-file',
  templateUrl: './attach-file.component.html',
  styleUrls: ['./attach-file.component.scss'],
})
export class AttachFileComponent {
  //Size in Megabyte
  @Input() size = 5;
  @Input() disabled = false;
  @Input() inputName = 'file';
  @Input() accept: string[] = [
    'video/*',
    'image/*',
    'application/*',
    'text/plain',
  ];
  @Output() uploadFile = new EventEmitter<FormData>();
  @ViewChild('inputFile') private inputFile: ElementRef<HTMLFormElement>;

  sizeError = false;
  formatError = false;

  fileUpload() {
    const formData = new FormData();
    const file = this.inputFile.nativeElement.files[0] as File;
    formData.append(this.inputName, file);
    if (file && this.fileSizeIsValid(file) && this.fileAcceptIsValid(file)) {
      this.uploadFile.emit(formData);
    }
    this.inputFile.nativeElement.value = null;
  }

  resetForm() {
    this.inputFile.nativeElement.value = null;
    this.sizeError = false;
    this.formatError = false;
  }

  fileAcceptIsValid(file: File) {
    const allSubTypes = `${file.type.split('/')[0]}/*`;
    if (this.accept.includes(file.type) || this.accept.includes(allSubTypes)) {
      return true;
    } else {
      this.formatError = true;
      return false;
    }
  }

  fileSizeIsValid(file: File) {
    if (file.size / 1000 / 1000 < this.size) {
      return true;
    } else {
      this.sizeError = true;
      return false;
    }
  }
}
