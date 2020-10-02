import { Injectable } from '@angular/core';
import { FileApiService } from './file-api.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private fileApiService: FileApiService
  ) { }

  storeImageDate(fileId: string, imageData: string) {
    return this.fileApiService.post('v1/image',
      { imageData },
      { fileId }
    );
  }

  removeFileByPrefix(prefix: string) {
    return this.fileApiService.delete('v1/files', { prefix });
  }
}