import { Injectable } from '@angular/core';
import { FileApiService } from './file-api.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private fileApiService: FileApiService) {}

  uploadBase64Image(fileId: string, base64Image: string) {
    return this.fileApiService.post('v1/files/base64-upload', {
      base64Image,
      fileId,
    });
  }

  uploadOne(form: FormData, options) {
    return this.fileApiService.post('v1/files/upload', form, options);
  }

  removeFileByPrefix(prefix: string) {
    return this.fileApiService.delete(`v1/files/${prefix}`);
  }
}
